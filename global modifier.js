const regex = /computer/;
const str = `My computer is not connecting with your computer`;
const match = "computer".match(regex);
const replaced = str.replace(regex, "ComPuER");
console.log(match);
console.log(replaced) 

// result::::::::::
// Array [ "computer" ]
// ​
// 0: "computer"
// ​
// groups: undefined
// ​
// index: 0
// ​
// input: "computer"
// ​
// length: 1
// ​
// <prototype>: Array []
// debugger eval code:5:9
// My ComPuER is not connecting with your computer

// Using global modifier:
// const regex = /computer/g;
// const str = `My computer is not connecting with your computer`;
// const match = str.match(regex);
// const replaced = str.replace(regex, "ComPuER");
// console.log(match);
// console.log(replaced) 

// result:::::::::::
// Array [ "computer", "computer" ]
// ​
// 0: "computer"
// ​
// 1: "computer"
// ​
// length: 2
// ​
// <prototype>: Array []
// debugger eval code:5:9
// My ComPuER is not connecting with your ComPuER