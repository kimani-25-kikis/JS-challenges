
const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, "data", "db.json");

app.use(express.json({ limit: "100kb" }));

let database = null;
let writeQueue = Promise.resolve();

async function initializeDatabase() {
    try {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

        const data = await fs.readFile(DB_PATH, "utf8");
        database = JSON.parse(data);

        console.log("Database loaded successfully.");
    } catch (error) {
        if (error.code === "ENOENT") {
            database = {
                products: [],
                customers: [],
                sales: []
            };

            await saveDatabase();
            console.log("New database created.");
        } else {
            throw error;
        }
    }
}

function saveDatabase() {
    const snapshot = JSON.stringify(database, null, 2);

    const operation = writeQueue.then(async () => {
        const tempPath = `${DB_PATH}.tmp`;

        await fs.writeFile(tempPath, snapshot, "utf8");
        await fs.rename(tempPath, DB_PATH);
    });

    writeQueue = operation.catch(error => {
        console.error("Database write failed:", error);
    });

    return operation;
}

class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

function validateProduct(data) {
    const { name, category, price, stock, reorderLevel } = data;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof category !== "string" ||
        !category.trim()
    ) {
        throw new AppError("Product name and category are required.");
    }

    if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        throw new AppError("Price must be a positive number.");
    }

    if (!Number.isInteger(stock) || stock < 0) {
        throw new AppError("Stock must be a non-negative integer.");
    }

    if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
        throw new AppError("Reorder level must be a non-negative integer.");
    }
}

function validateCustomer(data) {
    if (typeof data.name !== "string" || !data.name.trim()) {
        throw new AppError("Customer name is required.");
    }

    if (
        typeof data.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    ) {
        throw new AppError("A valid email address is required.");
    }
}

function findProduct(id) {
    const product = database.products.find(item => item.id === id);

    if (!product) {
        throw new AppError("Product not found.", 404);
    }

    return product;
}

function findCustomer(id) {
    const customer = database.customers.find(item => item.id === id);

    if (!customer) {
        throw new AppError("Customer not found.", 404);
    }

    return customer;
}

function paginate(items, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;

    return {
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit),
        data: items.slice(startIndex, startIndex + limit)
    };
}

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Inventory Management API",
        version: "1.0.0",
        endpoints: {
            products: "/api/products",
            customers: "/api/customers",
            sales: "/api/sales",
            reports: "/api/reports"
        }
    });
});

app.get("/api/products", asyncHandler(async (req, res) => {
    const {
        search,
        category,
        minPrice,
        maxPrice,
        page = "1",
        limit = "10"
    } = req.query;

    let products = [...database.products];

    if (search) {
        products = products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (category) {
        products = products.filter(product =>
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (minPrice !== undefined) {
        const minimum = Number(minPrice);

        if (!Number.isFinite(minimum)) {
            throw new AppError("Invalid minimum price.");
        }

        products = products.filter(product => product.price >= minimum);
    }

    if (maxPrice !== undefined) {
        const maximum = Number(maxPrice);

        if (!Number.isFinite(maximum)) {
            throw new AppError("Invalid maximum price.");
        }

        products = products.filter(product => product.price <= maximum);
    }

    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    if (
        !Number.isInteger(pageNumber) ||
        !Number.isInteger(pageLimit) ||
        pageNumber < 1 ||
        pageLimit < 1 ||
        pageLimit > 100
    ) {
        throw new AppError("Invalid pagination parameters.");
    }

    res.json({
        success: true,
        ...paginate(products, pageNumber, pageLimit)
    });
}));

app.get("/api/products/:id", asyncHandler(async (req, res) => {
    const product = findProduct(req.params.id);

    res.json({
        success: true,
        data: product
    });
}));

app.post("/api/products", asyncHandler(async (req, res) => {
    validateProduct(req.body);

    const product = {
        id: randomUUID(),
        name: req.body.name.trim(),
        category: req.body.category.trim(),
        price: req.body.price,
        stock: req.body.stock,
        reorderLevel: req.body.reorderLevel,
        createdAt: new Date().toISOString()
    };

    database.products.push(product);

    await saveDatabase();

    res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: product
    });
}));

app.put("/api/products/:id", asyncHandler(async (req, res) => {
    const product = findProduct(req.params.id);

    const updatedProduct = {
        ...product,
        ...req.body
    };

    validateProduct(updatedProduct);

    Object.assign(product, {
        name: updatedProduct.name.trim(),
        category: updatedProduct.category.trim(),
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        reorderLevel: updatedProduct.reorderLevel
    });

    await saveDatabase();

    res.json({
        success: true,
        message: "Product updated successfully.",
        data: product
    });
}));

app.delete("/api/products/:id", asyncHandler(async (req, res) => {
    const product = findProduct(req.params.id);

    const hasSales = database.sales.some(sale =>
        sale.items.some(item => item.productId === product.id)
    );

    if (hasSales) {
        throw new AppError(
            "Cannot delete a product with existing sales records.",
            409
        );
    }

    database.products = database.products.filter(
        item => item.id !== product.id
    );

    await saveDatabase();

    res.json({
        success: true,
        message: "Product deleted successfully."
    });
}));

app.patch("/api/products/:id/restock", asyncHandler(async (req, res) => {
    const product = findProduct(req.params.id);
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError("Restock quantity must be a positive integer.");
    }

    product.stock += quantity;

    await saveDatabase();

    res.json({
        success: true,
        message: "Inventory restocked successfully.",
        data: product
    });
}));

app.get("/api/inventory/low-stock", (req, res) => {
    const lowStockProducts = database.products.filter(
        product => product.stock <= product.reorderLevel
    );

    res.json({
        success: true,
        count: lowStockProducts.length,
        data: lowStockProducts
    });
});

app.get("/api/inventory/summary", (req, res) => {
    const totalProducts = database.products.length;

    const totalUnits = database.products.reduce(
        (total, product) => total + product.stock,
        0
    );

    const inventoryValue = database.products.reduce(
        (total, product) => total + product.stock * product.price,
        0
    );

    const lowStock = database.products.filter(
        product => product.stock <= product.reorderLevel
    ).length;

    res.json({
        success: true,
        data: {
            totalProducts,
            totalUnits,
            inventoryValue,
            lowStockProducts: lowStock
        }
    });
});

app.post("/api/customers", asyncHandler(async (req, res) => {
    validateCustomer(req.body);

    const email = req.body.email.trim().toLowerCase();

    const existingCustomer = database.customers.find(
        customer => customer.email === email
    );

    if (existingCustomer) {
        throw new AppError("Customer email already exists.", 409);
    }

    const customer = {
        id: randomUUID(),
        name: req.body.name.trim(),
        email,
        phone: req.body.phone || "",
        createdAt: new Date().toISOString()
    };

    database.customers.push(customer);

    await saveDatabase();

    res.status(201).json({
        success: true,
        message: "Customer registered successfully.",
        data: customer
    });
}));

app.get("/api/customers", (req, res) => {
    res.json({
        success: true,
        count: database.customers.length,
        data: database.customers
    });
});

app.get("/api/customers/:id", asyncHandler(async (req, res) => {
    const customer = findCustomer(req.params.id);

    res.json({
        success: true,
        data: customer
    });
}));

app.post("/api/sales", asyncHandler(async (req, res) => {
    const { customerId, items, paymentMethod } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
        throw new AppError("Customer and sale items are required.");
    }

    const validPaymentMethods = ["cash", "card", "mobile_money"];

    if (!validPaymentMethods.includes(paymentMethod)) {
        throw new AppError("Invalid payment method.");
    }

    const customer = findCustomer(customerId);
    const aggregatedItems = new Map();

    for (const item of items) {
        if (
            typeof item.productId !== "string" ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            throw new AppError("Invalid product ID or quantity.");
        }

        aggregatedItems.set(
            item.productId,
            (aggregatedItems.get(item.productId) || 0) + item.quantity
        );
    }

    const saleItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of aggregatedItems) {
        const product = findProduct(productId);

        if (product.stock < quantity) {
            throw new AppError(
                `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                409
            );
        }

        const subtotal = product.price * quantity;

        saleItems.push({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            subtotal
        });

        totalAmount += subtotal;
    }

    for (const item of saleItems) {
        const product = findProduct(item.productId);
        product.stock -= item.quantity;
    }

    const sale = {
        id: randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        items: saleItems,
        totalAmount,
        paymentMethod,
        status: "completed",
        createdAt: new Date().toISOString()
    };

    database.sales.push(sale);

    try {
        await saveDatabase();
    } catch (error) {
        for (const item of saleItems) {
            const product = findProduct(item.productId);
            product.stock += item.quantity;
        }

        database.sales.pop();

        throw error;
    }

    res.status(201).json({
        success: true,
        message: "Sale completed successfully.",
        data: sale
    });
}));

app.get("/api/sales", (req, res) => {
    const sales = [...database.sales].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
        success: true,
        count: sales.length,
        data: sales
    });
});

app.get("/api/sales/:id", asyncHandler(async (req, res) => {
    const sale = database.sales.find(item => item.id === req.params.id);

    if (!sale) {
        throw new AppError("Sale not found.", 404);
    }

    res.json({
        success: true,
        data: sale
    });
}));

app.get("/api/reports/overview", (req, res) => {
    const totalRevenue = database.sales.reduce(
        (total, sale) => total + sale.totalAmount,
        0
    );

    const totalOrders = database.sales.length;
    const totalCustomers = database.customers.length;

    const totalUnitsSold = database.sales.reduce(
        (total, sale) =>
            total + sale.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            ),
        0
    );

    const averageOrderValue = totalOrders > 0
        ? totalRevenue / totalOrders
        : 0;

    res.json({
        success: true,
        data: {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalUnitsSold,
            averageOrderValue: Number(averageOrderValue.toFixed(2))
        }
    });
});

app.get("/api/reports/top-products", (req, res) => {
    const productSales = {};

    for (const sale of database.sales) {
        for (const item of sale.items) {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    productId: item.productId,
                    productName: item.productName,
                    unitsSold: 0,
                    revenue: 0
                };
            }

            productSales[item.productId].unitsSold += item.quantity;
            productSales[item.productId].revenue += item.subtotal;
        }
    }

    const results = Object.values(productSales).sort(
        (a, b) => b.unitsSold - a.unitsSold
    );

    res.json({
        success: true,
        data: results
    });
});

app.use((req, res, next) => {
    next(new AppError("Route not found.", 404));
});

app.use((error, req, res, next) => {
    console.error(error);

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "Internal server error."
            : error.message
    });
});

async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log("-----------------------------------");
            console.log("INVENTORY MANAGEMENT API");
            console.log("-----------------------------------");
            console.log(`Server running at http://localhost:${PORT}`);
            console.log("Database ready.");
            console.log("-----------------------------------");
        });
    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}

startServer();
