function addTogether(...args) {
  const isValidNumber = (num) => typeof num === "number";

  if (args.length === 2) {
    if (isValidNumber(args[0]) && isValidNumber(args[1])) {
      return args[0] + args[1];
    }
    return undefined;
  }

  if (args.length === 1) {
    if (isValidNumber(args[0])) {
      const firstNum = args[0];
      return function (secondNum) {
        if (isValidNumber(secondNum)) {
          return firstNum + secondNum;
        }
        return undefined;
      };
    }
  }

  return undefined;
}