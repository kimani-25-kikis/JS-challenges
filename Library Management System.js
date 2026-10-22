const library = new Map();
const members = new Map();
const activeLoans = new Map();
const loanHistory = [];
const memberEmails = new Set();

let nextMemberId = 1001;
let nextLoanId = 5001;

const LOAN_PERIOD_DAYS = 14;
const FINE_PER_DAY = 50;
const MAX_ACTIVE_LOANS = 5;

const normalize = (value) => String(value).trim().toLowerCase();

const parseDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date.");
  }

  return parsed;
};

const daysBetween = (start, end) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay)
  );
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addBook = ({
  isbn,
  title,
  author,
  category,
  copies = 1,
  publishedYear = null
}) => {
  if (!isbn || !title?.trim() || !author?.trim() || !category?.trim()) {
    throw new Error("ISBN, title, author, and category are required.");
  }

  if (!Number.isInteger(copies) || copies < 0) {
    throw new Error("Copies must be a non-negative integer.");
  }

  if (
    publishedYear !== null &&
    (!Number.isInteger(publishedYear) ||
      publishedYear < 0 ||
      publishedYear > new Date().getFullYear())
  ) {
    throw new Error("Invalid publication year.");
  }

  if (library.has(isbn)) {
    throw new Error(`Book ${isbn} already exists.`);
  }

  const book = {
    isbn: String(isbn).trim(),
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    publishedYear,
    totalCopies: copies,
    availableCopies: copies,
    createdAt: new Date().toISOString()
  };

  library.set(book.isbn, book);

  return book;
};

const getBook = (isbn) => library.get(isbn) ?? null;

const updateBook = (isbn, updates = {}) => {
  const book = getBook(isbn);

  if (!book) {
    throw new Error("Book not found.");
  }

  const updated = { ...book };

  for (const field of ["title", "author", "category"]) {
    if (updates[field] !== undefined) {
      if (
        typeof updates[field] !== "string" ||
        !updates[field].trim()
      ) {
        throw new Error(`${field} cannot be empty.`);
      }

      updated[field] = updates[field].trim();
    }
  }

  if (updates.publishedYear !== undefined) {
    const year = updates.publishedYear;

    if (
      year !== null &&
      (!Number.isInteger(year) ||
        year < 0 ||
        year > new Date().getFullYear())
    ) {
      throw new Error("Invalid publication year.");
    }

    updated.publishedYear = year;
  }

  if (updates.totalCopies !== undefined) {
    if (
      !Number.isInteger(updates.totalCopies) ||
      updates.totalCopies < 0
    ) {
      throw new Error("Total copies must be a non-negative integer.");
    }

    const borrowedCopies = book.totalCopies - book.availableCopies;

    if (updates.totalCopies < borrowedCopies) {
      throw new Error("Total copies cannot be less than borrowed copies.");
    }

    updated.totalCopies = updates.totalCopies;
    updated.availableCopies = updates.totalCopies - borrowedCopies;
  }

  library.set(isbn, updated);

  return updated;
};

const removeBook = (isbn) => {
  const book = getBook(isbn);

  if (!book) return false;

  if (book.availableCopies !== book.totalCopies) {
    throw new Error("Cannot remove a book while copies are borrowed.");
  }

  return library.delete(isbn);
};

const registerMember = ({ name, email, phone = "" }) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Member name is required.");
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new Error("A valid email address is required.");
  }

  const normalizedEmail = normalize(email);

  if (memberEmails.has(normalizedEmail)) {
    throw new Error("A member with this email already exists.");
  }

  const member = {
    id: nextMemberId++,
    name: name.trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    registeredAt: new Date().toISOString(),
    active: true,
    outstandingFines: 0
  };

  members.set(member.id, member);
  memberEmails.add(normalizedEmail);

  return member;
};

const getMember = (memberId) => members.get(memberId) ?? null;

const getMemberLoans = (memberId) => {
  return [...activeLoans.values()].filter(
    (loan) => loan.memberId === memberId
  );
};

const borrowBook = (isbn, memberId, borrowDate = new Date()) => {
  const book = getBook(isbn);
  const member = getMember(memberId);
  const date = parseDate(borrowDate);

  if (!book) throw new Error("Book not found.");
  if (!member) throw new Error("Member not found.");
  if (!member.active) throw new Error("Member account is inactive.");
  if (book.availableCopies <= 0) {
    throw new Error("No copies are currently available.");
  }

  if (member.outstandingFines > 0) {
    throw new Error("Outstanding fines must be paid before borrowing.");
  }

  if (getMemberLoans(memberId).length >= MAX_ACTIVE_LOANS) {
    throw new Error("Member has reached the borrowing limit.");
  }

  const existingLoan = getMemberLoans(memberId).find(
    (loan) => loan.isbn === isbn
  );

  if (existingLoan) {
    throw new Error("Member already has this book on loan.");
  }

  const loan = {
    id: nextLoanId++,
    isbn,
    memberId,
    borrowDate: date.toISOString(),
    dueDate: addDays(date, LOAN_PERIOD_DAYS).toISOString(),
    returnedAt: null,
    fine: 0,
    status: "borrowed"
  };

  book.availableCopies--;

  activeLoans.set(loan.id, loan);
  loanHistory.push(loan);

  return loan;
};

const calculateFine = (dueDate, returnDate = new Date()) => {
  const due = parseDate(dueDate);
  const returned = parseDate(returnDate);
  const overdueDays = daysBetween(due, returned);

  return {
    overdueDays,
    fine: overdueDays * FINE_PER_DAY
  };
};

const returnBook = (loanId, returnDate = new Date()) => {
  const loan = activeLoans.get(loanId);

  if (!loan) {
    throw new Error("Active loan not found.");
  }

  const date = parseDate(returnDate);
  const dueDate = parseDate(loan.dueDate);

  if (date < parseDate(loan.borrowDate)) {
    throw new Error("Return date cannot precede the borrow date.");
  }

  const { overdueDays, fine } = calculateFine(dueDate, date);
  const book = getBook(loan.isbn);
  const member = getMember(loan.memberId);

  loan.returnedAt = date.toISOString();
  loan.fine = fine;
  loan.status = "returned";

  book.availableCopies++;
  member.outstandingFines += fine;

  activeLoans.delete(loanId);

  return {
    loan,
    overdueDays,
    fine,
    outstandingFines: member.outstandingFines
  };
};

const payFine = (memberId, amount) => {
  const member = getMember(memberId);

  if (!member) {
    throw new Error("Member not found.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment must be a positive amount.");
  }

  if (amount > member.outstandingFines) {
    throw new Error("Payment exceeds outstanding fines.");
  }

  member.outstandingFines -= amount;

  return {
    memberId,
    amountPaid: amount,
    remainingFines: member.outstandingFines
  };
};

const searchBooks = (query) => {
  const term = normalize(query);

  return [...library.values()].filter((book) =>
    book.title.toLowerCase().includes(term) ||
    book.author.toLowerCase().includes(term) ||
    book.category.toLowerCase().includes(term) ||
    book.isbn.toLowerCase().includes(term)
  );
};

const filterBooksByCategory = (category) => {
  const term = normalize(category);

  return [...library.values()].filter(
    (book) => book.category.toLowerCase() === term
  );
};

const getOverdueLoans = (asOf = new Date()) => {
  const date = parseDate(asOf);

  return [...activeLoans.values()]
    .filter((loan) => parseDate(loan.dueDate) < date)
    .map((loan) => ({
      ...loan,
      overdue: calculateFine(loan.dueDate, date)
    }));
};

const getPopularBooks = (limit = 5) => {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Limit must be a positive integer.");
  }

  const borrowCounts = new Map();

  for (const loan of loanHistory) {
    borrowCounts.set(
      loan.isbn,
      (borrowCounts.get(loan.isbn) ?? 0) + 1
    );
  }

  return [...library.values()]
    .map((book) => ({
      ...book,
      borrowCount: borrowCounts.get(book.isbn) ?? 0
    }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, limit);
};

const getLibraryStatistics = () => {
  const books = [...library.values()];
  const activeMembers = [...members.values()].filter(
    (member) => member.active
  );

  const categories = new Map();

  for (const book of books) {
    categories.set(
      book.category,
      (categories.get(book.category) ?? 0) + book.totalCopies
    );
  }

  return {
    uniqueTitles: books.length,
    totalCopies: books.reduce(
      (sum, book) => sum + book.totalCopies,
      0
    ),
    availableCopies: books.reduce(
      (sum, book) => sum + book.availableCopies,
      0
    ),
    borrowedCopies: books.reduce(
      (sum, book) => sum + book.totalCopies - book.availableCopies,
      0
    ),
    registeredMembers: members.size,
    activeMembers: activeMembers.length,
    activeLoans: activeLoans.size,
    overdueLoans: getOverdueLoans().length,
    totalFinesOutstanding: activeMembers.reduce(
      (sum, member) => sum + member.outstandingFines,
      0
    ),
    copiesByCategory: Object.fromEntries(categories)
  };
};

const sortBooks = (key = "title", direction = "asc") => {
  const allowedKeys = [
    "title",
    "author",
    "category",
    "publishedYear",
    "availableCopies"
  ];

  if (!allowedKeys.includes(key)) {
    throw new Error(`Unsupported sort key: ${key}`);
  }

  if (!["asc", "desc"].includes(direction)) {
    throw new Error('Direction must be "asc" or "desc".');
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...library.values()].sort((a, b) => {
    const first = a[key];
    const second = b[key];

    if (typeof first === "string") {
      return first.localeCompare(second) * multiplier;
    }

    return ((first ?? 0) - (second ?? 0)) * multiplier;
  });
};

const displayBooks = () => {
  console.table([...library.values()]);
};

const displayMembers = () => {
  console.table([...members.values()]);
};

const displayActiveLoans = () => {
  console.table([...activeLoans.values()]);
};

addBook({
  isbn: "978-0131103627",
  title: "The C Programming Language",
  author: "Brian Kernighan",
  category: "Programming",
  copies: 3,
  publishedYear: 1988
});

addBook({
  isbn: "978-0132350884",
  title: "Clean Code",
  author: "Robert C. Martin",
  category: "Software Engineering",
  copies: 4,
  publishedYear: 2008
});

addBook({
  isbn: "978-1491950296",
  title: "Learning JavaScript",
  author: "Ethan Brown",
  category: "Programming",
  copies: 2,
  publishedYear: 2016
});

const member = registerMember({
  name: "Alex Mwangi",
  email: "alex@example.com",
  phone: "0712345678"
});

const loan = borrowBook("978-0132350884", member.id);

console.log("Search results:", searchBooks("javascript"));
console.log("Popular books:", getPopularBooks());
console.log("Library statistics:", getLibraryStatistics());

displayBooks();
displayMembers();
displayActiveLoans();