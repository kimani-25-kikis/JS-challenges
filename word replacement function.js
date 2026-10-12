function myReplace(str, before, after) {
  const isCapitalized = before[0] === before[0].toUpperCase() && before[0] !== before[0].toLowerCase();

  let replacement = after;
  if (isCapitalized) {
    replacement = after[0].toUpperCase() + after.slice(1);
  } else {
    replacement = after[0].toLowerCase() + after.slice(1);
  }

  return str.replace(before, replacement);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = myReplace;
}