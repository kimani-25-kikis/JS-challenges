function isPalindrome(word) {
  const lowerWord = word.toLowerCase();
  const reversedWord = lowerWord.split("").reverse().join("");

  return lowerWord === reversedWord;
}

function findPalindromeBreaks(words) {
  const breaks = [];

  for (let i = 0; i < words.length; i++) {
    if (!isPalindrome(words[i])) {
      breaks.push(i);
    }
  }

  return breaks;
}

function findRepeatedPhrases(words, phraseLength) {
  const repeatedIndices = [];
  const phrases = {};

  if (phraseLength >= words.length) {
    return [];
  }

  for (let i = 0; i <= words.length - phraseLength; i++) {
    const phrase = words.slice(i, i + phraseLength).join(" ");

    if (!phrases[phrase]) {
      phrases[phrase] = [];
    }

    phrases[phrase].push(i);
  }

  for (const phrase in phrases) {
    if (phrases[phrase].length > 1) {
      repeatedIndices.push(...phrases[phrase]);
    }
  }

  return repeatedIndices.sort((a, b) => a - b);
}

function analyzeTexts(texts, phraseLength) {
  const results = [];

  for (const words of texts) {
    results.push({
      repeatedPhrases: findRepeatedPhrases(words, phraseLength),
      palindromeBreaks: findPalindromeBreaks(words)
    });
  }

  return results;
}