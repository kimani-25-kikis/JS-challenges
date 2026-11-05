function permuteString(str, prefix = "", results = []) {
  if (str.length === 0) {
    results.push(prefix);
    return results;
  }

  for (let i = 0; i < str.length; i++) {
    const currentChar = str[i];
    const remaining = str.slice(0, i) + str.slice(i + 1);
    permuteString(remaining, prefix + currentChar, results);
  }

  return [...new Set(results)];
}

// For reversing astring:
// function changeString(str) {
//   if (str === "") return "";
//   return changeString(str.slice(1)) + str[0];
// }