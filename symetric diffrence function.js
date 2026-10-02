function diffArray(arr1, arr2) {
  const onlyInFirst = arr1.filter(item => !arr2.includes(item));
  const onlyInSecond = arr2.filter(item => !arr1.includes(item));

  return onlyInFirst.concat(onlyInSecond);
}