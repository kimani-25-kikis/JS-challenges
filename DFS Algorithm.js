function dfs(graph, root) {
  let visited = [];
  let stack = [root];

  while (stack.length > 0) {
    let node = stack.pop();

    if (!visited.includes(node)) {
      visited.push(node);

      for (let neighbor = 0; neighbor < graph[node].length; neighbor++) {
        if (graph[node][neighbor] === 1 && !visited.includes(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return visited;
}