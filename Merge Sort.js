function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    const sorted = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            sorted.push(left[i]);
            i += 1;
        } else {
            sorted.push(right[j]);
            j += 1;
        }
    }

    return sorted.concat(left.slice(i)).concat(right.slice(j));
}