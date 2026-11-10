function generateElement() {
  return Math.floor(Math.random() * 100) + 1;
}

function generateArray() {
  const arr = [];
  for (let i = 0; i < 5; i++) {
    arr.push(generateElement());
  }
  return arr;
}

function generateContainer() {
  return document.createElement("div");
}

function fillArrContainer(element, arr) {
  element.innerHTML = "";
  arr.forEach((num) => {
    const span = document.createElement("span");
    span.textContent = num;
    element.appendChild(span);
  });
}

function isOrdered(a, b) {
  return a <= b;
}

function swapElements(arr, index) {
  if (!isOrdered(arr[index], arr[index + 1])) {
    const temp = arr[index];
    arr[index] = arr[index + 1];
    arr[index + 1] = temp;
  }
}

function highlightCurrentEls(element, index) {
  const children = element.children;
  if (children[index]) {
    children[index].style.border = "2px dashed red";
  }
  if (children[index + 1]) {
    children[index + 1].style.border = "2px dashed red";
  }
}

const arrayContainer = document.getElementById("array-container");
const startingArray = document.getElementById("starting-array");
const generateBtn = document.getElementById("generate-btn");
const sortBtn = document.getElementById("sort-btn");

let currentArray = [];

generateBtn.addEventListener("click", () => {
  // Remove any previously generated step divs, keep only #starting-array
  Array.from(arrayContainer.children).forEach((child) => {
    if (child.id !== "starting-array") {
      child.remove();
    }
  });

  currentArray = generateArray();
  fillArrContainer(startingArray, currentArray);
});

sortBtn.addEventListener("click", () => {
  // Clear previous sort steps (keep starting-array)
  Array.from(arrayContainer.children).forEach((child) => {
    if (child.id !== "starting-array") {
      child.remove();
    }
  });

  // Get the current numbers from the starting array
  const arr = Array.from(startingArray.children).map((span) =>
    Number(span.textContent)
  );

  // Starting array is the first step – highlight the first pair
  highlightCurrentEls(startingArray, 0);

  // Perform the first comparison/swap on the working copy
  swapElements(arr, 0);

  // Continue with the rest of the first pass (indices 1, 2, 3)
  for (let i = 1; i < arr.length - 1; i++) {
    const stepDiv = generateContainer();
    fillArrContainer(stepDiv, arr);
    highlightCurrentEls(stepDiv, i);
    arrayContainer.appendChild(stepDiv);
    swapElements(arr, i);
  }

  // Keep doing full passes until the array is sorted
  while (true) {
    let swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (!isOrdered(arr[i], arr[i + 1])) {
        swapped = true;
      }
    }
    if (!swapped) break;

    for (let i = 0; i < arr.length - 1; i++) {
      const stepDiv = generateContainer();
      fillArrContainer(stepDiv, arr);
      highlightCurrentEls(stepDiv, i);
      arrayContainer.appendChild(stepDiv);
      swapElements(arr, i);
    }
  }

  // One final cycle with no swaps (as required by the algorithm description)
  for (let i = 0; i < arr.length - 1; i++) {
    const stepDiv = generateContainer();
    fillArrContainer(stepDiv, arr);
    highlightCurrentEls(stepDiv, i);
    arrayContainer.appendChild(stepDiv);
    swapElements(arr, i); // no actual swaps will occur
  }

  // Final sorted array (no highlight)
  const sortedDiv = generateContainer();
  fillArrContainer(sortedDiv, arr);
  arrayContainer.appendChild(sortedDiv);
});