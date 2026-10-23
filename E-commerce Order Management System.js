class EcommerceOrderManagement {
    constructor() {
        this.products = new Map();
        this.customers = new Map();
        this.orders = new Map();
        this.orderHistory = new Map();
        this.customerEmails = new Set();
        this.orderStatuses = new Set([
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded"
        ]);

        this.nextProductId = 1;
        this.nextCustomerId = 1;
        this.nextOrderId = 1;
    }

    addProduct(name, price, stock, category) {
        if (!name || !category) {
            throw new Error("Product name and category are required.");
        }

        if (
            !Number.isFinite(price) ||
            !Number.isInteger(stock) ||
            price < 0 ||
            stock < 0
        ) {
            throw new Error("Price and stock must be valid non-negative numbers.");
        }

        const id = this.nextProductId++;

        this.products.set(id, {
            id,
            name,
            price,
            stock,
            category,
            active: true,
            createdAt: new Date().toISOString(),
            unitsSold: 0
        });

        return this.products.get(id);
    }

    updateProduct(productId, updates = {}) {
        const product = this.products.get(productId);

        if (!product) {
            throw new Error("Product not found.");
        }

        if (
            updates.price !== undefined &&
            (!Number.isFinite(updates.price) || updates.price < 0)
        ) {
            throw new Error("Price must be a non-negative number.");
        }

        if (
            updates.stock !== undefined &&
            (!Number.isInteger(updates.stock) || updates.stock < 0)
        ) {
            throw new Error("Stock must be a non-negative integer.");
        }

        if (updates.name !== undefined && !updates.name.trim()) {
            throw new Error("Product name cannot be empty.");
        }

        Object.assign(product, updates, {
            id: product.id
        });

        return product;
    }

    deactivateProduct(productId) {
        const product = this.products.get(productId);

        if (!product) {
            throw new Error("Product not found.");
        }

        product.active = false;
        return product;
    }

    addCustomer(name, email, address) {
        if (!name?.trim() || !email?.trim() || !address?.trim()) {
            throw new Error("Name, email, and address are required.");
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (this.customerEmails.has(normalizedEmail)) {
            throw new Error("A customer with this email already exists.");
        }

        const id = this.nextCustomerId++;

        const customer = {
            id,
            name: name.trim(),
            email: normalizedEmail,
            address: address.trim(),
            createdAt: new Date().toISOString(),
            orderIds: new Set()
        };

        this.customers.set(id, customer);
        this.customerEmails.add(normalizedEmail);

        return customer;
    }

    updateCustomer(customerId, updates = {}) {
        const customer = this.customers.get(customerId);

        if (!customer) {
            throw new Error("Customer not found.");
        }

        if (updates.email !== undefined) {
            const normalizedEmail = updates.email.trim().toLowerCase();

            if (!normalizedEmail) {
                throw new Error("Email cannot be empty.");
            }

            if (
                normalizedEmail !== customer.email &&
                this.customerEmails.has(normalizedEmail)
            ) {
                throw new Error("Email is already registered.");
            }

            this.customerEmails.delete(customer.email);
            this.customerEmails.add(normalizedEmail);
            customer.email = normalizedEmail;
        }

        if (updates.name !== undefined) {
            if (!updates.name.trim()) {
                throw new Error("Name cannot be empty.");
            }

            customer.name = updates.name.trim();
        }

        if (updates.address !== undefined) {
            if (!updates.address.trim()) {
                throw new Error("Address cannot be empty.");
            }

            customer.address = updates.address.trim();
        }

        return customer;
    }

    createOrder(customerId, items, discount = 0) {
        const customer = this.customers.get(customerId);

        if (!customer) {
            throw new Error("Customer not found.");
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("An order must contain at least one item.");
        }

        if (
            !Number.isFinite(discount) ||
            discount < 0 ||
            discount > 100
        ) {
            throw new Error("Discount must be between 0 and 100.");
        }

        const quantities = new Map();

        for (const item of items) {
            if (
                !Number.isInteger(item.productId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0
            ) {
                throw new Error("Each item needs a valid product ID and positive quantity.");
            }

            const product = this.products.get(item.productId);

            if (!product || !product.active) {
                throw new Error(`Product ${item.productId} is unavailable.`);
            }

            quantities.set(
                item.productId,
                (quantities.get(item.productId) || 0) + item.quantity
            );
        }

        for (const [productId, quantity] of quantities) {
            const product = this.products.get(productId);

            if (product.stock < quantity) {
                throw new Error(
                    `Insufficient stock for ${product.name}. Available: ${product.stock}.`
                );
            }
        }

        const orderItems = [];

        for (const [productId, quantity] of quantities) {
            const product = this.products.get(productId);

            orderItems.push({
                productId,
                productName: product.name,
                unitPrice: product.price,
                quantity,
                subtotal: product.price * quantity
            });
        }

        const subtotal = orderItems.reduce(
            (total, item) => total + item.subtotal,
            0
        );

        const discountAmount = subtotal * (discount / 100);
        const total = subtotal - discountAmount;
        const id = this.nextOrderId++;

        const order = {
            id,
            customerId,
            items: orderItems,
            subtotal,
            discount,
            discountAmount,
            total,
            status: "pending",
            paymentStatus: "unpaid",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        for (const [productId, quantity] of quantities) {
            this.products.get(productId).stock -= quantity;
        }

        this.orders.set(id, order);
        customer.orderIds.add(id);

        this.orderHistory.set(id, [
            {
                status: "pending",
                timestamp: order.createdAt,
                note: "Order created."
            }
        ]);

        return order;
    }

    updateOrderStatus(orderId, newStatus, note = "") {
        const order = this.orders.get(orderId);

        if (!order) {
            throw new Error("Order not found.");
        }

        if (!this.orderStatuses.has(newStatus)) {
            throw new Error("Invalid order status.");
        }

        const transitions = new Map([
            ["pending", new Set(["confirmed", "cancelled"])],
            ["confirmed", new Set(["processing", "cancelled"])],
            ["processing", new Set(["shipped", "cancelled"])],
            ["shipped", new Set(["delivered"])],
            ["delivered", new Set(["refunded"])],
            ["cancelled", new Set()],
            ["refunded", new Set()]
        ]);

        if (!transitions.get(order.status).has(newStatus)) {
            throw new Error(
                `Cannot change order status from ${order.status} to ${newStatus}.`
            );
        }

        if (newStatus === "cancelled") {
            for (const item of order.items) {
                const product = this.products.get(item.productId);

                if (product) {
                    product.stock += item.quantity;
                }
            }
        }

        if (newStatus === "refunded" && order.paymentStatus === "paid") {
            order.paymentStatus = "refunded";
        }

        if (newStatus === "delivered") {
            for (const item of order.items) {
                const product = this.products.get(item.productId);

                if (product) {
                    product.unitsSold += item.quantity;
                }
            }
        }

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        this.orderHistory.get(orderId).push({
            status: newStatus,
            timestamp: order.updatedAt,
            note
        });

        return order;
    }

    markOrderAsPaid(orderId, paymentReference) {
        const order = this.orders.get(orderId);

        if (!order) {
            throw new Error("Order not found.");
        }

        if (order.status === "cancelled" || order.status === "refunded") {
            throw new Error("Cannot pay for a cancelled or refunded order.");
        }

        if (order.paymentStatus === "paid") {
            throw new Error("Order has already been paid.");
        }

        if (!paymentReference?.trim()) {
            throw new Error("A payment reference is required.");
        }

        order.paymentStatus = "paid";
        order.paymentReference = paymentReference.trim();
        order.updatedAt = new Date().toISOString();

        this.orderHistory.get(orderId).push({
            status: order.status,
            timestamp: order.updatedAt,
            note: `Payment received: ${paymentReference.trim()}`
        });

        return order;
    }

    getOrder(orderId) {
        const order = this.orders.get(orderId);

        if (!order) {
            throw new Error("Order not found.");
        }

        return {
            ...order,
            items: order.items.map(item => ({ ...item }))
        };
    }

    getCustomerOrders(customerId) {
        const customer = this.customers.get(customerId);

        if (!customer) {
            throw new Error("Customer not found.");
        }

        return [...customer.orderIds]
            .map(orderId => this.orders.get(orderId))
            .filter(Boolean)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getOrderHistory(orderId) {
        if (!this.orders.has(orderId)) {
            throw new Error("Order not found.");
        }

        return (this.orderHistory.get(orderId) || []).map(entry => ({
            ...entry
        }));
    }

    searchProducts(searchTerm = "") {
        const query = searchTerm.trim().toLowerCase();

        return [...this.products.values()].filter(product =>
            product.active &&
            (
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            )
        );
    }

    filterOrders({ status, paymentStatus, customerId } = {}) {
        return [...this.orders.values()].filter(order => {
            return (
                (status === undefined || order.status === status) &&
                (
                    paymentStatus === undefined ||
                    order.paymentStatus === paymentStatus
                ) &&
                (customerId === undefined || order.customerId === customerId)
            );
        });
    }

    getLowStockProducts(threshold = 5) {
        return [...this.products.values()]
            .filter(product => product.active && product.stock <= threshold)
            .sort((a, b) => a.stock - b.stock);
    }

    getBestSellingProducts(limit = 5) {
        return [...this.products.values()]
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, Math.max(0, limit));
    }

    getSalesReport() {
        const report = {
            totalOrders: this.orders.size,
            totalRevenue: 0,
            paidRevenue: 0,
            pendingPayments: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            refundedOrders: 0,
            statusCounts: new Map(),
            categoryRevenue: new Map()
        };

        for (const status of this.orderStatuses) {
            report.statusCounts.set(status, 0);
        }

        for (const order of this.orders.values()) {
            report.statusCounts.set(
                order.status,
                report.statusCounts.get(order.status) + 1
            );

            if (order.status === "delivered") {
                report.completedOrders++;
                report.totalRevenue += order.total;

                if (order.paymentStatus === "paid") {
                    report.paidRevenue += order.total;
                }
            }

            if (order.paymentStatus === "unpaid") {
                report.pendingPayments += order.total;
            }

            if (order.status === "cancelled") {
                report.cancelledOrders++;
            }

            if (order.status === "refunded") {
                report.refundedOrders++;
            }

            if (order.status !== "cancelled" && order.status !== "refunded") {
                for (const item of order.items) {
                    const product = this.products.get(item.productId);
                    const category = product?.category || "Unknown";

                    report.categoryRevenue.set(
                        category,
                        (report.categoryRevenue.get(category) || 0) +
                            item.subtotal * (1 - order.discount / 100)
                    );
                }
            }
        }

        return report;
    }

    getInventoryValue() {
        let value = 0;

        for (const product of this.products.values()) {
            if (product.active) {
                value += product.price * product.stock;
            }
        }

        return value;
    }

    exportData() {
        return JSON.stringify({
            products: [...this.products.entries()],
            customers: [...this.customers.entries()].map(([id, customer]) => [
                id,
                {
                    ...customer,
                    orderIds: [...customer.orderIds]
                }
            ]),
            orders: [...this.orders.entries()],
            orderHistory: [...this.orderHistory.entries()],
            customerEmails: [...this.customerEmails],
            nextProductId: this.nextProductId,
            nextCustomerId: this.nextCustomerId,
            nextOrderId: this.nextOrderId
        }, null, 2);
    }

    importData(jsonData) {
        const data = JSON.parse(jsonData);

        if (
            !Array.isArray(data.products) ||
            !Array.isArray(data.customers) ||
            !Array.isArray(data.orders) ||
            !Array.isArray(data.orderHistory) ||
            !Array.isArray(data.customerEmails)
        ) {
            throw new Error("Invalid import data.");
        }

        this.products = new Map(data.products);
        this.customers = new Map(
            data.customers.map(([id, customer]) => [
                id,
                {
                    ...customer,
                    orderIds: new Set(customer.orderIds)
                }
            ])
        );
        this.orders = new Map(data.orders);
        this.orderHistory = new Map(data.orderHistory);
        this.customerEmails = new Set(data.customerEmails);

        this.nextProductId = data.nextProductId;
        this.nextCustomerId = data.nextCustomerId;
        this.nextOrderId = data.nextOrderId;

        return true;
    }
}

const store = new EcommerceOrderManagement();

const laptop = store.addProduct("Laptop", 1200, 10, "Electronics");
const mouse = store.addProduct("Wireless Mouse", 25, 50, "Accessories");

const customer = store.addCustomer(
    "Alex Kimani",
    "alex@example.com",
    "Nairobi, Kenya"
);

const order = store.createOrder(customer.id, [
    { productId: laptop.id, quantity: 1 },
    { productId: mouse.id, quantity: 2 }
], 10);

store.markOrderAsPaid(order.id, "PAY-10001");
store.updateOrderStatus(order.id, "confirmed");
store.updateOrderStatus(order.id, "processing");
store.updateOrderStatus(order.id, "shipped");
store.updateOrderStatus(order.id, "delivered");

console.log("Order:", store.getOrder(order.id));
console.log("Order history:", store.getOrderHistory(order.id));
console.log("Sales report:", store.getSalesReport());
console.log("Low stock:", store.getLowStockProducts());
console.log("Best sellers:", store.getBestSellingProducts());
console.log("Inventory value:", store.getInventoryValue());
console.log("Exported data:", store.exportData());