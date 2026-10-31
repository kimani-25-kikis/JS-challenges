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