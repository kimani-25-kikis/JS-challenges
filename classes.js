class Book {
  static totalBooks = 0;

  #isbn;

  constructor(title, author, isbn, year) {
    this.title = title;
    this.author = author;
    this.#isbn = isbn;
    this.year = year;
    this.isAvailable = true;
    Book.totalBooks++;
  }

  describe() {
    return `"${this.title}" by ${this.author} (${this.year})`;
  }

  get isbn() {
    return this.#isbn;
  }

  set isbn(value) {
    if (!/^\d{13}$/.test(value)) {
      throw new Error("ISBN must be 13 digits");
    }
    this.#isbn = value;
  }

  static oldest(books) {
    return books.reduce((a, b) => (a.year < b.year ? a : b));
  }
}

class EBook extends Book {
  constructor(title, author, isbn, year, fileSizeMB) {
    super(title, author, isbn, year);
    this.fileSizeMB = fileSizeMB;
  }

  describe() {
    return `${super.describe()} — ${this.fileSizeMB}MB ebook`;
  }
}

class AudioBook extends Book {
  constructor(title, author, isbn, year, durationMin) {
    super(title, author, isbn, year);
    this.durationMin = durationMin;
  }

  describe() {
    return `${super.describe()} — ${this.durationMin} min audio`;
  }
}

class Library {
  #books = [];

  add(...books) {
    this.#books.push(...books);
    return this;
  }

  find(predicate) {
    return this.#books.filter(predicate);
  }

  [Symbol.iterator]() {
    return this.#books[Symbol.iterator]();
  }

  get count() {
    return this.#books.length;
  }
}

const lib = new Library();

const b1 = new Book("Dune", "Frank Herbert", "9780441013593", 1965);
const b2 = new EBook("Snow Crash", "Neal Stephenson", "9780553380958", 1992, 4.2);
const b3 = new AudioBook("Neuromancer", "William Gibson", "9780441007462", 1984, 480);

lib.add(b1, b2, b3);

console.log(b1.describe());
console.log(b2.describe());
console.log(b3.describe());

console.log(b2 instanceof EBook);
console.log(b2 instanceof Book);
console.log(b3 instanceof EBook);

console.log(b1.isbn);

try { b1.isbn = "123"; } catch (e) { console.log(e.message); }

console.log(Book.totalBooks);
console.log(Book.oldest(lib.find(b => true)).title);

for (const book of lib) {
  console.log(book.title);
}

lib.add(new Book("Hyperion", "Dan Simmons", "9780553283686", 1989))
   .add(new Book("Foundation", "Isaac Asimov", "9780553293357", 1951));

console.log(lib.count);