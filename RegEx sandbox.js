
const regexPattern = document.getElementById('pattern');
const stringToTest = document.getElementById('test-string');
const testButton = document.getElementById('test-btn');
const testResult = document.getElementById('result');
const caseInsensitiveFlag = document.getElementById('i');
const globalFlag = document.getElementById('g');


function getFlags() {
  let flags = '';
  if (caseInsensitiveFlag.checked) {
    flags += 'i';
  }
  if (globalFlag.checked) {
    flags += 'g';
  }
  return flags;
}


function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function runTest() {
  // 1. Get the original test string as plain text (strip any previous highlight spans)
  //    We use textContent to get the raw text, then escape it for safe HTML injection.
  const rawText = stringToTest.textContent;

  // 2. Get the pattern and flags
  const patternSource = regexPattern.value;
  const flags = getFlags();

  // If pattern is empty, treat as no match (and don't modify the test string)
  if (patternSource === '') {
    testResult.textContent = 'no match';
    return;
  }

  // 3. Build the regex object
  let regex;
  try {
    regex = new RegExp(patternSource, flags);
  } catch (e) {
    // Invalid regex: treat as no match
    testResult.textContent = 'no match';
    return;
  }

  // 4. Find all matches (or one match if global flag is off)
  //    We need to collect match strings for the result display.
  const matches = [];
  let match;

  if (flags.includes('g')) {
    // Global: use matchAll or exec in a loop
    // Use matchAll for simplicity, but we need to avoid infinite loops with zero-length matches.
    // We'll use a while loop with exec, and handle zero-length by advancing lastIndex.
    regex.lastIndex = 0;
    while ((match = regex.exec(rawText)) !== null) {
      matches.push(match[0]);
      if (match[0].length === 0) {
        // avoid infinite loop for zero-length matches
        regex.lastIndex++;
      }
      // safety: if regex.lastIndex is beyond string length, break
      if (regex.lastIndex > rawText.length) break;
    }
  } else {
    // Non-global: only first match
    match = regex.exec(rawText);
    if (match) {
      matches.push(match[0]);
    }
  }

  // 5. If no matches: display "no match" and leave test string unchanged
  if (matches.length === 0) {
    testResult.textContent = 'no match';
    return;
  }

  // 6. Build the highlighted HTML for the test string
  //    We need to replace each match with a span.highlight, but only the matched parts.
  //    Strategy: build a new HTML string by walking through the original text and
  //    wrapping each match with the highlight span.
  let highlightedHTML = '';
  let lastIndex = 0;

  // We need to find each match again to get its index. We'll use a fresh regex with same flags.
  // For global flag, we can iterate; for non-global, only one match.
  const matchIndices = [];
  const searchRegex = new RegExp(patternSource, flags.includes('g') ? flags : flags.replace('g', ''));
  // ensure global for finding all indices if global flag is on? Actually we already collected matches,
  // but we also need indices. Let's re-run exec to get indices.
  // For simplicity, we'll re-run with global flag if global is on; otherwise just one.

  const findRegex = new RegExp(patternSource, flags.includes('g') ? flags : flags);
  let m;
  if (flags.includes('g')) {
    findRegex.lastIndex = 0;
    while ((m = findRegex.exec(rawText)) !== null) {
      matchIndices.push({ index: m.index, length: m[0].length, text: m[0] });
      if (m[0].length === 0) findRegex.lastIndex++;
      if (findRegex.lastIndex > rawText.length) break;
    }
  } else {
    m = findRegex.exec(rawText);
    if (m) {
      matchIndices.push({ index: m.index, length: m[0].length, text: m[0] });
    }
  }

  // Sort matches by index just in case
  matchIndices.sort((a, b) => a.index - b.index);

  // Build highlighted HTML
  for (const mi of matchIndices) {
    // Add the text before the match, escaped
    highlightedHTML += escapeHTML(rawText.slice(lastIndex, mi.index));
    // Add the highlighted match (escaped)
    highlightedHTML += `<span class="highlight">${escapeHTML(mi.text)}</span>`;
    lastIndex = mi.index + mi.length;
  }
  // Add remaining text
  highlightedHTML += escapeHTML(rawText.slice(lastIndex));

  // 7. Update the test string innerHTML
  stringToTest.innerHTML = highlightedHTML;

  // 8. Update the result display with matched texts joined by ", "
  testResult.textContent = matches.join(', ');
}

/* ---------- attach event listener ---------- */
testButton.addEventListener('click', runTest);


regexPattern.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    runTest();
  }
});

