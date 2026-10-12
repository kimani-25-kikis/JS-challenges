function spinalCase(str) {
  let result = str.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  result = result.replace(/[^a-zA-Z0-9]+/g, '-');
  result = result.replace(/^-+|-+$/g, '');
  return result.toLowerCase();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = spinalCase;
}