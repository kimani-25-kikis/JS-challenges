

const output = document.getElementById("output");

function log(label, value) {
  const line = document.createElement("p");
  line.textContent = `${label}: ${JSON.stringify(value)}`;
  output.appendChild(line);
  console.log(label, value);
}


function addManual(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

log("addManual(1)(2)(3)", addManual(1)(2)(3)); // 6
log("addManual(10)(20)(30)", addManual(10)(20)(30)); // 60


function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...next) {
      return curried.apply(this, args.concat(next));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

log("curriedAdd(1)(2)(3)", curriedAdd(1)(2)(3)); // 6
log("curriedAdd(1, 2)(3)", curriedAdd(1, 2)(3)); // 6
log("curriedAdd(1)(2, 3)", curriedAdd(1)(2, 3)); // 6
log("curriedAdd(1, 2, 3)", curriedAdd(1, 2, 3)); // 6


const multiply = (a, b) => a * b;
const curriedMultiply = curry(multiply);

const double = curriedMultiply(2);
const triple = curriedMultiply(3);

log("double(5)", double(5)); // 10
log("triple(5)", triple(5)); // 15


const greet = (greeting, name) => `${greeting}, ${name}!`;
const curriedGreet = curry(greet);

const sayHello = curriedGreet("Hello");
const sayHi = curriedGreet("Hi");

log("sayHello('Ada')", sayHello("Ada")); // "Hello, Ada!"
log("sayHi('Bob')", sayHi("Bob")); // "Hi, Bob!"



const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const greaterThan = curry((threshold, n) => n > threshold);
const multiplyBy = curry((factor, n) => n * factor);

const greaterThan5 = greaterThan(5);
const times10 = multiplyBy(10);

const result = numbers.filter(greaterThan5).map(times10);
log("filter(>5).map(*10)", result); // [60, 70, 80, 90, 100]


function infiniteCurry(fn) {
  return function curried(...args) {
    if (args.length === 0) {
      return fn(...args); // not meaningful here, just placeholder
    }
    return (...next) => {
      if (next.length === 0) return fn(...args);
      return infiniteCurry(fn)(...args, ...next);
    };
  };
}

const flexibleSum = (...initial) => {
  const total = initial.reduce((a, b) => a + b, 0);
  const next = (...more) =>
    more.length === 0 ? total : flexibleSum(total, ...more);
  return next;
};

log("flexibleSum(1)(2)(3)()", flexibleSum(1)(2)(3)()); // 6
log("flexibleSum(1, 2)(3, 4)()", flexibleSum(1, 2)(3, 4)()); // 10


const isOrdered = (a, b) => a <= b;


const swapElementsRaw = (arr, index) => {
  if (!isOrdered(arr[index], arr[index + 1])) {
    const temp = arr[index];
    arr[index] = arr[index + 1];
    arr[index + 1] = temp;
  }
};

const swapElementsCurried = curry(swapElementsRaw);

const demoArr = [3, 1, 4, 2];
const swapDemo = swapElementsCurried(demoArr);

log("before swaps", [...demoArr]);
swapDemo(0);
swapDemo(1);
swapDemo(2);
log("after swaps", [...demoArr]);