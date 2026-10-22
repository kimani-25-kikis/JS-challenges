const expenses = new Map();
let nextExpenseId = 1;

const categories = new Set([
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Other"
]);

const addExpense = ({
  description,
  amount,
  category,
  date = new Date().toISOString().slice(0, 10)
}) => {
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Description is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (!categories.has(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date) {
    throw new Error("Date must be a valid YYYY-MM-DD date.");
  }

  const expense = {
    id: nextExpenseId++,
    description: description.trim(),
    amount,
    category,
    date,
    createdAt: new Date().toISOString()
  };

  expenses.set(expense.id, expense);

  return expense;
};

const getExpense = (id) => expenses.get(id) ?? null;

const updateExpense = (id, updates = {}) => {
  const expense = expenses.get(id);

  if (!expense) {
    throw new Error(`Expense ${id} was not found.`);
  }

  const updated = { ...expense };

  if (updates.description !== undefined) {
    if (
      typeof updates.description !== "string" ||
      !updates.description.trim()
    ) {
      throw new Error("Description cannot be empty.");
    }

    updated.description = updates.description.trim();
  }

  if (updates.amount !== undefined) {
    if (!Number.isFinite(updates.amount) || updates.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    updated.amount = updates.amount;
  }

  if (updates.category !== undefined) {
    if (!categories.has(updates.category)) {
      throw new Error(`Invalid category: ${updates.category}`);
    }

    updated.category = updates.category;
  }

  if (updates.date !== undefined) {
    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(updates.date) &&
      !Number.isNaN(Date.parse(`${updates.date}T00:00:00.000Z`)) &&
      new Date(`${updates.date}T00:00:00.000Z`)
        .toISOString()
        .slice(0, 10) === updates.date;

    if (!validDate) {
      throw new Error("Date must be a valid YYYY-MM-DD date.");
    }

    updated.date = updates.date;
  }

  expenses.set(id, updated);

  return updated;
};

const deleteExpense = (id) => expenses.delete(id);

const getAllExpenses = () => [...expenses.values()];

const getTotalExpenses = (records = getAllExpenses()) =>
  records.reduce((total, expense) => total + expense.amount, 0);

const getExpensesByCategory = (category) =>
  getAllExpenses().filter((expense) => expense.category === category);

const getExpensesByDateRange = (startDate, endDate) => {
  if (startDate > endDate) {
    throw new Error("Start date cannot be after end date.");
  }

  return getAllExpenses().filter(
    ({ date }) => date >= startDate && date <= endDate
  );
};

const getCategorySummary = () => {
  const summary = new Map();

  for (const category of categories) {
    summary.set(category, {
      count: 0,
      total: 0
    });
  }

  for (const expense of expenses.values()) {
    const current = summary.get(expense.category);

    current.count++;
    current.total += expense.amount;
  }

  return summary;
};

const getHighestExpense = () => {
  return getAllExpenses().reduce(
    (highest, expense) =>
      highest === null || expense.amount > highest.amount
        ? expense
        : highest,
    null
  );
};

const getAverageExpense = () => {
  const records = getAllExpenses();

  return records.length
    ? getTotalExpenses(records) / records.length
    : 0;
};

const getMonthlySummary = (year, month) => {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  const records = getAllExpenses().filter(
    (expense) => expense.date.startsWith(`${prefix}-`)
  );

  return {
    month: prefix,
    expenseCount: records.length,
    total: getTotalExpenses(records),
    expenses: records
  };
};

const searchExpenses = (query) => {
  const normalized = query.trim().toLowerCase();

  return getAllExpenses().filter(
    (expense) =>
      expense.description.toLowerCase().includes(normalized) ||
      expense.category.toLowerCase().includes(normalized) ||
      String(expense.id).includes(normalized)
  );
};

const sortExpenses = (
  key = "date",
  direction = "desc"
) => {
  const allowedKeys = ["description", "amount", "category", "date"];

  if (!allowedKeys.includes(key)) {
    throw new Error(`Cannot sort by ${key}.`);
  }

  if (!["asc", "desc"].includes(direction)) {
    throw new Error('Direction must be "asc" or "desc".');
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return getAllExpenses().sort((a, b) => {
    const first = a[key];
    const second = b[key];

    if (typeof first === "string") {
      return first.localeCompare(second) * multiplier;
    }

    return (first - second) * multiplier;
  });
};

const getBudgetStatus = (budget) => {
  if (!Number.isFinite(budget) || budget < 0) {
    throw new Error("Budget must be a non-negative number.");
  }

  const spent = getTotalExpenses();
  const remaining = budget - spent;

  return {
    budget,
    spent,
    remaining,
    exceeded: remaining < 0,
    percentageUsed: budget === 0
      ? spent > 0 ? Infinity : 0
      : Number(((spent / budget) * 100).toFixed(2))
  };
};

const exportExpenses = () =>
  JSON.stringify(
    {
      version: 1,
      nextExpenseId,
      expenses: getAllExpenses()
    },
    null,
    2
  );

const importExpenses = (json) => {
  const data = JSON.parse(json);

  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.expenses)
  ) {
    throw new Error("Invalid expense export.");
  }

  const imported = new Map();
  let maxId = 0;

  for (const expense of data.expenses) {
    if (
      !Number.isSafeInteger(expense.id) ||
      expense.id <= 0 ||
      imported.has(expense.id) ||
      typeof expense.description !== "string" ||
      !expense.description.trim() ||
      !Number.isFinite(expense.amount) ||
      expense.amount <= 0 ||
      !categories.has(expense.category) ||
      typeof expense.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(expense.date) ||
      Number.isNaN(Date.parse(`${expense.date}T00:00:00.000Z`)) ||
      new Date(`${expense.date}T00:00:00.000Z`)
        .toISOString()
        .slice(0, 10) !== expense.date
    ) {
      throw new Error("Invalid expense record.");
    }

    imported.set(expense.id, { ...expense });
    maxId = Math.max(maxId, expense.id);
  }

  expenses.clear();

  for (const [id, expense] of imported) {
    expenses.set(id, expense);
  }

  nextExpenseId = Math.max(
    maxId + 1,
    Number.isSafeInteger(data.nextExpenseId) &&
    data.nextExpenseId > maxId
      ? data.nextExpenseId
      : maxId + 1
  );

  return getAllExpenses();
};

const displayExpenses = () => {
  console.table(getAllExpenses());
};

addExpense({
  description: "Groceries",
  amount: 3500,
  category: "Food",
  date: "2026-10-01"
});

addExpense({
  description: "Bus fare",
  amount: 500,
  category: "Transport",
  date: "2026-10-02"
});

addExpense({
  description: "Monthly rent",
  amount: 12000,
  category: "Rent",
  date: "2026-10-03"
});

addExpense({
  description: "Internet bill",
  amount: 2500,
  category: "Utilities",
  date: "2026-10-05"
});

console.log("All expenses:", getAllExpenses());
console.log("Total spent:", getTotalExpenses());
console.log("Food expenses:", getExpensesByCategory("Food"));
console.log("Category summary:", [...getCategorySummary()]);
console.log("Highest expense:", getHighestExpense());
console.log("Average expense:", getAverageExpense());
console.log("Monthly summary:", getMonthlySummary(2026, 10));
console.log("Budget status:", getBudgetStatus(25000));

displayExpenses();