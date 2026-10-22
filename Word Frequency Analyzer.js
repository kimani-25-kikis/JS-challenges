class WordFrequencyAnalyzer {
  constructor(options = {}) {
    this.options = {
      minWordLength: options.minWordLength ?? 1,
      removeStopWords: options.removeStopWords ?? false,
      includeNumbers: options.includeNumbers ?? false,
      ...options
    };

    this.stopWords = new Set([
      "a", "an", "the", "and", "or", "but", "if", "is", "are",
      "was", "were", "be", "been", "being", "to", "of", "in",
      "on", "at", "for", "with", "by", "from", "as", "it",
      "this", "that", "these", "those", "i", "you", "he", "she",
      "we", "they", "my", "your", "our", "their", "me", "him",
      "her", "us", "them", "not", "do", "does", "did", "have",
      "has", "had", "can", "could", "will", "would", "should"
    ]);

    this.frequencies = new Map();
    this.totalWords = 0;
    this.uniqueWords = new Set();
    this.documents = new Map();
    this.nextDocumentId = 1;
  }

  validateText(text) {
    if (typeof text !== "string") {
      throw new TypeError("Input must be a string.");
    }

    return text;
  }

  tokenize(text) {
    this.validateText(text);

    const normalized = text
      .normalize("NFKC")
      .toLocaleLowerCase();

    const pattern = this.options.includeNumbers
      ? /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu
      : /[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu;

    return normalized.match(pattern) ?? [];
  }

  filterWords(words) {
    return words.filter((word) => {
      if (word.length < this.options.minWordLength) {
        return false;
      }

      if (
        this.options.removeStopWords &&
        this.stopWords.has(word)
      ) {
        return false;
      }

      return true;
    });
  }

  analyze(text, documentName = null) {
    const rawWords = this.tokenize(text);
    const words = this.filterWords(rawWords);

    const localFrequencies = new Map();

    for (const word of words) {
      localFrequencies.set(
        word,
        (localFrequencies.get(word) ?? 0) + 1
      );

      this.frequencies.set(
        word,
        (this.frequencies.get(word) ?? 0) + 1
      );

      this.uniqueWords.add(word);
    }

    this.totalWords += words.length;

    const document = {
      id: this.nextDocumentId++,
      name: documentName ?? `Document ${this.nextDocumentId - 1}`,
      totalWords: words.length,
      uniqueWords: localFrequencies.size,
      frequencies: localFrequencies,
      analyzedAt: new Date().toISOString()
    };

    this.documents.set(document.id, document);

    return {
      documentId: document.id,
      name: document.name,
      totalWords: document.totalWords,
      uniqueWords: document.uniqueWords,
      frequencies: new Map(localFrequencies)
    };
  }

  getFrequency(word) {
    return this.frequencies.get(
      String(word).toLocaleLowerCase()
    ) ?? 0;
  }

  getDocument(documentId) {
    const document = this.documents.get(documentId);

    if (!document) {
      return null;
    }

    return {
      ...document,
      frequencies: new Map(document.frequencies)
    };
  }

  getTopWords(limit = 10) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError("Limit must be a positive integer.");
    }

    return [...this.frequencies.entries()]
      .sort((a, b) =>
        b[1] - a[1] || a[0].localeCompare(b[0])
      )
      .slice(0, limit)
      .map(([word, count]) => ({
        word,
        count,
        percentage: this.totalWords
          ? Number((count / this.totalWords * 100).toFixed(2))
          : 0
      }));
  }

  getLeastFrequentWords(limit = 10) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError("Limit must be a positive integer.");
    }

    return [...this.frequencies.entries()]
      .sort((a, b) =>
        a[1] - b[1] || a[0].localeCompare(b[0])
      )
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  searchWords(query) {
    const normalizedQuery = String(query).toLocaleLowerCase();

    return [...this.frequencies.entries()]
      .filter(([word]) => word.includes(normalizedQuery))
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));
  }

  getWordsByLength(length) {
    if (!Number.isInteger(length) || length < 1) {
      throw new RangeError("Length must be a positive integer.");
    }

    return [...this.frequencies.entries()]
      .filter(([word]) => word.length === length)
      .map(([word, count]) => ({ word, count }));
  }

  getWordsStartingWith(letter) {
    const prefix = String(letter).toLocaleLowerCase();

    return [...this.frequencies.entries()]
      .filter(([word]) => word.startsWith(prefix))
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));
  }

  getWordsEndingWith(suffix) {
    const ending = String(suffix).toLocaleLowerCase();

    return [...this.frequencies.entries()]
      .filter(([word]) => word.endsWith(ending))
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));
  }

  getStatistics() {
    const counts = [...this.frequencies.values()];

    const totalUniqueWords = this.frequencies.size;

    const averageFrequency = totalUniqueWords
      ? counts.reduce((sum, count) => sum + count, 0) /
        totalUniqueWords
      : 0;

    const frequencyDistribution = new Map();

    for (const count of counts) {
      frequencyDistribution.set(
        count,
        (frequencyDistribution.get(count) ?? 0) + 1
      );
    }

    const sortedCounts = [...counts].sort((a, b) => a - b);

    const medianFrequency = sortedCounts.length
      ? sortedCounts.length % 2
        ? sortedCounts[Math.floor(sortedCounts.length / 2)]
        : (
            sortedCounts[sortedCounts.length / 2 - 1] +
            sortedCounts[sortedCounts.length / 2]
          ) / 2
      : 0;

    return {
      documentCount: this.documents.size,
      totalWords: this.totalWords,
      uniqueWords: totalUniqueWords,
      averageFrequency: Number(averageFrequency.toFixed(2)),
      medianFrequency,
      mostFrequentWord: this.getTopWords(1)[0] ?? null,
      leastFrequentWord: this.getLeastFrequentWords(1)[0] ?? null,
      frequencyDistribution: Object.fromEntries(
        [...frequencyDistribution.entries()]
          .sort((a, b) => a[0] - b[0])
      )
    };
  }

  compareDocuments(firstId, secondId) {
    const first = this.documents.get(firstId);
    const second = this.documents.get(secondId);

    if (!first || !second) {
      throw new Error("Both documents must exist.");
    }

    const firstWords = new Set(first.frequencies.keys());
    const secondWords = new Set(second.frequencies.keys());

    const shared = [...firstWords].filter(
      (word) => secondWords.has(word)
    );

    const uniqueToFirst = [...firstWords].filter(
      (word) => !secondWords.has(word)
    );

    const uniqueToSecond = [...secondWords].filter(
      (word) => !firstWords.has(word)
    );

    const union = new Set([...firstWords, ...secondWords]);

    return {
      firstDocument: first.name,
      secondDocument: second.name,
      sharedWords: shared,
      sharedWordCount: shared.length,
      uniqueToFirst,
      uniqueToSecond,
      jaccardSimilarity: union.size
        ? Number((shared.length / union.size).toFixed(4))
        : 1
    };
  }

  removeDocument(documentId) {
    const document = this.documents.get(documentId);

    if (!document) {
      return false;
    }

    for (const [word, count] of document.frequencies) {
      const updatedCount = this.frequencies.get(word) - count;

      if (updatedCount <= 0) {
        this.frequencies.delete(word);
        this.uniqueWords.delete(word);
      } else {
        this.frequencies.set(word, updatedCount);
      }
    }

    this.totalWords -= document.totalWords;
    this.documents.delete(documentId);

    return true;
  }

  reset() {
    this.frequencies.clear();
    this.uniqueWords.clear();
    this.documents.clear();
    this.totalWords = 0;
    this.nextDocumentId = 1;
  }

  exportResults() {
    return JSON.stringify({
      version: 1,
      totalWords: this.totalWords,
      frequencies: [...this.frequencies.entries()],
      documents: [...this.documents.entries()].map(
        ([id, document]) => [
          id,
          {
            ...document,
            frequencies: [...document.frequencies.entries()]
          }
        ]
      )
    }, null, 2);
  }

  importResults(json) {
    const data = JSON.parse(json);

    if (
      !data ||
      data.version !== 1 ||
      !Array.isArray(data.frequencies) ||
      !Array.isArray(data.documents) ||
      !Number.isSafeInteger(data.totalWords) ||
      data.totalWords < 0
    ) {
      throw new Error("Invalid analyzer export.");
    }

    const importedFrequencies = new Map();
    let frequencyTotal = 0;

    for (const entry of data.frequencies) {
      if (
        !Array.isArray(entry) ||
        entry.length !== 2 ||
        typeof entry[0] !== "string" ||
        !Number.isSafeInteger(entry[1]) ||
        entry[1] <= 0 ||
        importedFrequencies.has(entry[0])
      ) {
        throw new Error("Invalid frequency entry.");
      }

      importedFrequencies.set(entry[0], entry[1]);
      frequencyTotal += entry[1];
    }

    if (frequencyTotal !== data.totalWords) {
      throw new Error("Exported total does not match word frequencies.");
    }

    const importedDocuments = new Map();

    for (const entry of data.documents) {
      if (
        !Array.isArray(entry) ||
        entry.length !== 2 ||
        !Number.isSafeInteger(entry[0]) ||
        entry[0] < 1 ||
        importedDocuments.has(entry[0]) ||
        !entry[1] ||
        !Array.isArray(entry[1].frequencies)
      ) {
        throw new Error("Invalid document entry.");
      }

      const [id, document] = entry;
      const documentFrequencies = new Map();

      for (const pair of document.frequencies) {
        if (
          !Array.isArray(pair) ||
          pair.length !== 2 ||
          typeof pair[0] !== "string" ||
          !Number.isSafeInteger(pair[1]) ||
          pair[1] <= 0 ||
          documentFrequencies.has(pair[0])
        ) {
          throw new Error("Invalid document frequency.");
        }

        documentFrequencies.set(pair[0], pair[1]);
      }

      const documentTotal = [...documentFrequencies.values()]
        .reduce((sum, count) => sum + count, 0);

      if (
        !Number.isSafeInteger(document.totalWords) ||
        document.totalWords !== documentTotal ||
        typeof document.name !== "string"
      ) {
        throw new Error("Invalid document statistics.");
      }

      importedDocuments.set(id, {
        ...document,
        frequencies: documentFrequencies
      });
    }

    const aggregate = new Map();

    for (const document of importedDocuments.values()) {
      for (const [word, count] of document.frequencies) {
        aggregate.set(word, (aggregate.get(word) ?? 0) + count);
      }
    }

    if (
      aggregate.size !== importedFrequencies.size ||
      [...aggregate].some(
        ([word, count]) => importedFrequencies.get(word) !== count
      )
    ) {
      throw new Error("Document data does not match aggregate frequencies.");
    }

    this.frequencies = importedFrequencies;
    this.documents = importedDocuments;
    this.uniqueWords = new Set(importedFrequencies.keys());
    this.totalWords = data.totalWords;

    this.nextDocumentId = Math.max(
      1,
      ...importedDocuments.keys()
    ) + 1;

    return this.getStatistics();
  }
}

const analyzer = new WordFrequencyAnalyzer({
  minWordLength: 2,
  removeStopWords: true,
  includeNumbers: false
});

const document1 = analyzer.analyze(
  `JavaScript is a powerful programming language.
   JavaScript makes web applications interactive.
   Developers use JavaScript to build modern web applications.`,
  "JavaScript Introduction"
);

const document2 = analyzer.analyze(
  `Python is a powerful programming language.
   Developers use Python for automation, data analysis,
   machine learning, and web development.`,
  "Python Introduction"
);

console.log("Document 1:", document1);
console.log("Document 2:", document2);
console.log("Top words:", analyzer.getTopWords(10));
console.log("Least frequent:", analyzer.getLeastFrequentWords(5));
console.log("Search for 'program':", analyzer.searchWords("program"));
console.log("Words of length 5:", analyzer.getWordsByLength(5));
console.log("Words starting with 'j':", analyzer.getWordsStartingWith("j"));
console.log("Statistics:", analyzer.getStatistics());
console.log("Document comparison:", analyzer.compareDocuments(1, 2));

const exportedData = analyzer.exportResults();
console.log("Exported data:", exportedData);

analyzer.removeDocument(1);
console.log("Statistics after removal:", analyzer.getStatistics());