function translatePigLatin(str) {
  const vowels = 'aeiou';
  const firstVowelIndex = str.split('').findIndex(char => vowels.includes(char));

  if (firstVowelIndex === 0) {
    return str + 'way';
  }

  if (firstVowelIndex === -1) {
    return str + 'ay';
  }

  return str.slice(firstVowelIndex) + str.slice(0, firstVowelIndex) + 'ay';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = translatePigLatin;
}