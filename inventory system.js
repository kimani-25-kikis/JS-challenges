const inventory = new Map();

const addProduct = (id, name, price, quantity, category) => {
  if (inventory.has(id)) {
    throw new Error(`Product with ID ${id} already exists.`);
  }

  if (
    !name.trim() ||
    !category.trim() ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    throw new Error("Invalid product details.");
  }

  inventory.set(id, {
    id,
    name: name.trim(),
    price,
    quantity,
    category: category.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return inventory.get(id);
};

const getProduct = (id) => {
  return inventory.get(id) ?? null;
};

const updateProduct = (id, updates = {}) => {
  const product = inventory.get(id);

  if (!product) {
    throw new Error(`Product with ID ${id} was not found.`);
  }

  const updatedProduct = { ...product };

  if (updates.name !== undefined) {
    if (typeof updates.name !== "string" || !updates.name.trim()) {
      throw new Error("Product name must not be empty.");
    }

    updatedProduct.name = updates.name.trim();
  }

  if (updates.price !== undefined) {
    if (!Number.isFinite(updates.price) || updates.price < 0) {
      throw new Error("Price must be a non-negative number.");
    }

    updatedProduct.price = updates.price;
  }

  if (updates.quantity !== undefined) {
    if (!Number.isInteger(updates.quantity) || updates.quantity < 0) {
      throw new Error("Quantity must be a non-negative integer.");
    }

    updatedProduct.quantity = updates.quantity;
  }

  if (updates.category !== undefined) {
    if (
      typeof updates.category !== "string" ||
      !updates.category.trim()
    ) {
      throw new Error("Category must not be empty.");
    }

    updatedProduct.category = updates.category.trim();
  }

  updatedProduct.updatedAt = new Date().toISOString();

  inventory.set(id, updatedProduct);

  return updatedProduct;
};

const removeProduct = (id) => {
  return inventory.delete(id);
};

const restockProduct = (id, amount) => {
  const product = inventory.get(id);

  if (!product) {
    throw new Error(`Product with ID ${id} was not found.`);
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Restock amount must be a positive integer.");
  }

  return updateProduct(id, {
    quantity: product.quantity + amount
  });
};

const sellProduct = (id, amount) => {
  const product = inventory.get(id);

  if (!product) {
    throw new Error(`Product with ID ${id} was not found.`);
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Sale amount must be a positive integer.");
  }

  if (product.quantity < amount) {
    throw new Error(
      `Insufficient stock. Available quantity: ${product.quantity}.`
    );
  }

  const updatedProduct = updateProduct(id, {
    quantity: product.quantity - amount
  });

  return {
    product: updatedProduct,
    unitsSold: amount,
    revenue: product.price * amount
  };
};

const searchProducts = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  return [...inventory.values()].filter((product) =>
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.category.toLowerCase().includes(normalizedQuery) ||
    String(product.id).toLowerCase().includes(normalizedQuery)
  );
};

const filterByCategory = (category) => {
  const normalizedCategory = category.trim().toLowerCase();

  return [...inventory.values()].filter(
    (product) =>
      product.category.toLowerCase() === normalizedCategory
  );
};

const getLowStockProducts = (threshold = 5) => {
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error("Threshold must be a non-negative integer.");
  }

  return [...inventory.values()].filter(
    (product) => product.quantity <= threshold
  );
};

const getOutOfStockProducts = () => {
  return [...inventory.values()].filter(
    (product) => product.quantity === 0
  );
};

const getInventoryValue = () => {
  return [...inventory.values()].reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );
};

const getTotalUnits = () => {
  return [...inventory.values()].reduce(
    (total, product) => total + product.quantity,
    0
  );
};

const getInventorySummary = () => {
  const products = [...inventory.values()];

  const categoryTotals = new Map();

  for (const product of products) {
    const currentTotal = categoryTotals.get(product.category) ?? 0;

    categoryTotals.set(
      product.category,
      currentTotal + product.price * product.quantity
    );
  }

  return {
    totalProducts: products.length,
    totalUnits: getTotalUnits(),
    inventoryValue: getInventoryValue(),
    lowStockCount: getLowStockProducts().length,
    outOfStockCount: getOutOfStockProducts().length,
    categoryTotals: Object.fromEntries(categoryTotals)
  };
};

const sortProducts = (
  key = "name",
  direction = "asc"
) => {
  const allowedKeys = ["name", "price", "quantity", "category"];

  if (!allowedKeys.includes(key)) {
    throw new Error(`Cannot sort by "${key}".`);
  }

  if (!["asc", "desc"].includes(direction)) {
    throw new Error('Direction must be "asc" or "desc".');
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...inventory.values()].sort((a, b) => {
    const first = a[key];
    const second = b[key];

    if (typeof first === "string") {
      return first.localeCompare(second) * multiplier;
    }

    return (first - second) * multiplier;
  });
};

const exportInventory = () => {
  return JSON.stringify([...inventory.entries()], null, 2);
};

const importInventory = (json) => {
  const entries = JSON.parse(json);

  if (!Array.isArray(entries)) {
    throw new Error("Invalid inventory data.");
  }

  const importedInventory = new Map();

  for (const entry of entries) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      !entry[1] ||
      typeof entry[1] !== "object"
    ) {
      throw new Error("Invalid inventory entry.");
    }

    const [id, product] = entry;

    if (
      product.id !== id ||
      typeof product.name !== "string" ||
      !product.name.trim() ||
      typeof product.category !== "string" ||
      !product.category.trim() ||
      !Number.isFinite(product.price) ||
      product.price < 0 ||
      !Number.isInteger(product.quantity) ||
      product.quantity < 0
    ) {
      throw new Error(`Invalid product data for ID ${id}.`);
    }

    if (importedInventory.has(id)) {
      throw new Error(`Duplicate product ID: ${id}.`);
    }

    importedInventory.set(id, { ...product });
  }

  inventory.clear();

  for (const [id, product] of importedInventory) {
    inventory.set(id, product);
  }

  return getInventorySummary();
};

const displayInventory = () => {
  console.table([...inventory.values()]);
};

addProduct("P001", "Laptop", 850, 10, "Electronics");
addProduct("P002", "Keyboard", 45, 25, "Accessories");
addProduct("P003", "Mouse", 25, 4, "Accessories");
addProduct("P004", "Monitor", 220, 0, "Electronics");

console.log("All products:", [...inventory.values()]);
console.log("Search results:", searchProducts("mouse"));
console.log("Low stock:", getLowStockProducts());
console.log("Inventory value:", getInventoryValue());

console.log("Sale:", sellProduct("P001", 2));
console.log("Restocked:", restockProduct("P004", 8));
console.log("Summary:", getInventorySummary());

displayInventory();