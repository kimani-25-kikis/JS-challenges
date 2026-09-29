function getIndexToIns(arr, num) {
  arr.sort((a, b) => a - b);

  const index = arr.findIndex(value => value >= num);

  if (index === -1) {
    return arr.length;
  }

  return index;
}