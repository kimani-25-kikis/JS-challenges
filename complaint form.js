// Get form elements
const form = document.getElementById('form');
const fullName = document.getElementById('full-name');
const email = document.getElementById('email');
const orderNo = document.getElementById('order-no');
const productCode = document.getElementById('product-code');
const quantity = document.getElementById('quantity');
const complaintsGroup = document.getElementById('complaints-group');
const complaintDescription = document.getElementById('complaint-description');
const otherComplaint = document.getElementById('other-complaint');
const solutionsGroup = document.getElementById('solutions-group');
const solutionDescription = document.getElementById('solution-description');
const otherSolution = document.getElementById('other-solution');

/**
 * Validates all form fields and returns an object with validation results.
 * @returns {Object} An object with keys for each form field and boolean values.
 */
function validateForm() {
  const complaintsCheckboxes = complaintsGroup.querySelectorAll('input[type="checkbox"]');
  const solutionsRadios = solutionsGroup.querySelectorAll('input[type="radio"]');

  const atLeastOneComplaintChecked = Array.from(complaintsCheckboxes).some(cb => cb.checked);
  const atLeastOneSolutionSelected = Array.from(solutionsRadios).some(rb => rb.checked);

  const isOtherComplaintChecked = otherComplaint.checked;
  const isOtherSolutionSelected = otherSolution.checked;

  return {
    'full-name': fullName.value.trim() !== '',
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
    'order-no': /^2024\d{6}$/.test(orderNo.value),
    'product-code': /^[A-Za-z]{2}\d{2}-[A-Za-z]\d{3}-[A-Za-z]{2}\d$/.test(productCode.value),
    'quantity': Number.isInteger(Number(quantity.value)) && Number(quantity.value) > 0 && quantity.value !== '',
    'complaints-group': atLeastOneComplaintChecked,
    'complaint-description': !isOtherComplaintChecked || complaintDescription.value.length >= 20,
    'solutions-group': atLeastOneSolutionSelected,
    'solution-description': !isOtherSolutionSelected || solutionDescription.value.length >= 20
  };
}

/**
 * Checks if every field in the validation object is true.
 * @param {Object} validationObj - The object returned by validateForm().
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function isValid(validationObj) {
  return Object.values(validationObj).every(value => value === true);
}

/**
 * Sets the border color of an element.
 * @param {HTMLElement} element - The input, textarea, or fieldset element.
 * @param {boolean} isValid - Whether the field is valid.
 */
function setBorderColor(element, isValid) {
  element.style.borderColor = isValid ? 'green' : 'red';
}

// --- Event Listeners for change events ---

fullName.addEventListener('change', () => {
  setBorderColor(fullName, validateForm()['full-name']);
});

email.addEventListener('change', () => {
  setBorderColor(email, validateForm()['email']);
});

orderNo.addEventListener('change', () => {
  setBorderColor(orderNo, validateForm()['order-no']);
});

productCode.addEventListener('change', () => {
  setBorderColor(productCode, validateForm()['product-code']);
});

quantity.addEventListener('change', () => {
  setBorderColor(quantity, validateForm()['quantity']);
});

// Checkbox group
complaintsGroup.addEventListener('change', () => {
  setBorderColor(complaintsGroup, validateForm()['complaints-group']);
});

// Complaint description
complaintDescription.addEventListener('change', () => {
  const isValidDesc = validateForm()['complaint-description'];
  if (otherComplaint.checked) {
    setBorderColor(complaintDescription, isValidDesc);
  } else {
    complaintDescription.style.borderColor = '';
  }
});

// Radio group
solutionsGroup.addEventListener('change', () => {
  setBorderColor(solutionsGroup, validateForm()['solutions-group']);
});

// Solution description
solutionDescription.addEventListener('change', () => {
  const isValidDesc = validateForm()['solution-description'];
  if (otherSolution.checked) {
    setBorderColor(solutionDescription, isValidDesc);
  } else {
    solutionDescription.style.borderColor = '';
  }
});

// --- Form submission ---

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const validation = validateForm();

  // Highlight all invalid fields
  if (!validation['full-name']) setBorderColor(fullName, false);
  if (!validation['email']) setBorderColor(email, false);
  if (!validation['order-no']) setBorderColor(orderNo, false);
  if (!validation['product-code']) setBorderColor(productCode, false);
  if (!validation['quantity']) setBorderColor(quantity, false);
  if (!validation['complaints-group']) setBorderColor(complaintsGroup, false);
  if (!validation['complaint-description']) setBorderColor(complaintDescription, false);
  if (!validation['solutions-group']) setBorderColor(solutionsGroup, false);
  if (!validation['solution-description']) setBorderColor(solutionDescription, false);

  // Call isValid to determine if the form is valid
  const formIsValid = isValid(validation);

  const messageBox = document.getElementById('message-box');
  if (formIsValid) {
    messageBox.textContent = 'Form submitted successfully!';
    messageBox.style.color = 'green';
  } else {
    messageBox.textContent = 'Please correct the highlighted fields.';
    messageBox.style.color = 'red';
  }
});