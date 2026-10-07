const textInput = document.querySelector("#text-input");
const charCount = document.querySelector("#char-count");

textInput.addEventListener("input", () => {
  let text = textInput.value;

  if (text.length >= 50) {
    textInput.value = text.slice(0, 50);
  }

  const currentCount = textInput.value.length;

  charCount.textContent = `Character Count: ${currentCount}/50`;

  if (currentCount >= 50) {
    charCount.classList.add("limit-reached");
  } else {
    charCount.classList.remove("limit-reached");
  }
});