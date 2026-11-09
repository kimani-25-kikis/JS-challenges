function adjacencyListToMatrix(adjList) {
  const n = Object.keys(adjList).length;
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (const node in adjList) {
    for (const neighbor of adjList[node]) {
      matrix[Number(node)][Number(neighbor)] = 1;
    }
  }

  for (const row of matrix) {
    console.log(row);
  }

  return matrix;
}