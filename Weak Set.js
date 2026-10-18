const treeWeakSet = new WeakSet();

const baobab = { name: "Baobab" };
const jackalberry = { name: "Jackalberry" };
const mopaneTree = { name: "Mopane Tree" };
const breadfruit = { name: "Breadfruit" };

treeWeakSet.add(baobab);
treeWeakSet.add(jackalberry);
treeWeakSet.add(mopaneTree);
treeWeakSet.add(breadfruit);

treeWeakSet.delete(jackalberry);
console.log(treeWeakSet.has(jackalberry)); // false

console.log(treeWeakSet);