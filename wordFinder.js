function findLongestWordLength(str) {
  const words = str.split(" ");
  let longestLength = 0;

  for (let i = 0; i < words.length; i++) {
    if (words[i].length > longestLength) {
      longestLength = words[i].length;
    }
  }

  return longestLength;
}