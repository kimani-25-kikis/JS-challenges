const start = /^freecodecamp/i;
const end = /freecodecamp$/i;
console.log(start.test("freecodecamp")); // true
console.log(end.test("freecodecamp")); // true
console.log(start.test("freecodecamp is great")); // true
console.log(end.test("freecodecamp is great")); // false
console.log(start.test("i love freecodecamp")); // false
console.log(end.test("i love freecodecamp")); // true
console.log(start.test("have met freecodecamp's founder")); // false
console.log(end.test("have met freecodecamp's founder")); // false