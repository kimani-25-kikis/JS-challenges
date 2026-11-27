function parseInput(id) {
  try {
    return JSON.parse(document.getElementById(id).value || "{}");
  } catch (e) {
    return null;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function compare() {
  const left = parseInput("left");
  const right = parseInput("right");
  if (left === null || right === null) {
    alert("Invalid JSON in one of the inputs.");
    return;
  }
  const leftPane = document.getElementById("leftPane");
  const rightPane = document.getElementById("rightPane");
  leftPane.innerHTML = "";
  rightPane.innerHTML = "";

  const allKeys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();

  let stats = { added: 0, removed: 0, modified: 0, unchanged: 0 };

  for (const key of allKeys) {
    const inL = key in left;
    const inR = key in right;
    const lv = inL ? JSON.stringify(left[key]) : null;
    const rv = inR ? JSON.stringify(right[key]) : null;

    const lLine = document.createElement("div");
    const rLine = document.createElement("div");

    if (inL && inR && lv === rv) {
      lLine.className = "line unchanged";
      rLine.className = "line unchanged";
      lLine.innerHTML = `<span class="key">${escapeHtml(key)}</span>: <span class="val">${escapeHtml(lv)}</span>`;
      rLine.innerHTML = `<span class="key">${escapeHtml(key)}</span>: <span class="val">${escapeHtml(rv)}</span>`;
      stats.unchanged++;
    } else if (inL && inR) {
      lLine.className = "line modified";
      rLine.className = "line modified";
      lLine.innerHTML = `<span class="key">${escapeHtml(key)}</span>: <span class="val">${escapeHtml(lv)}</span>`;
      rLine.innerHTML = `<span class="key">${escapeHtml(key)}</span>: <span class="val">${escapeHtml(rv)}</span>`;
      stats.modified++;
    } else if (inL) {
      lLine.className = "line removed";
      rLine.className = "line";
      lLine.innerHTML = `− <span class="key">${escapeHtml(key)}</span>: <span class="val">${escapeHtml(lv)}</span>`;
      rLine.innerHTML = "";
      stats.removed++;
    } else {
      lLine.className = "line";
      rLine.className = "line added";
      lLine.innerHTML = "";
      rLine.innerHTML = `+ <span class="key">${escapeHtml(key)}</span>: <span class="val">${escapeHtml(rv)}</span>`;
      stats.added++;
    }
    leftPane.appendChild(lLine);
    rightPane.appendChild(rLine);
  }

  const summary = document.createElement("div");
  summary.style.cssText = "margin-top:10px;color:#4ec9b0;";
  summary.textContent = `Added: ${stats.added} | Removed: ${stats.removed} | Modified: ${stats.modified} | Unchanged: ${stats.unchanged}`;
  leftPane.appendChild(summary);
}

function loadSample() {
  document.getElementById("left").value = JSON.stringify({
    user: "alice", theme: "dark", count: "5", cart: "[]", lang: "en"
  }, null, 2);
  document.getElementById("right").value = JSON.stringify({
    user: "alice", theme: "light", count: "5", cart: '["apple"]', currency: "USD"
  }, null, 2);
}

function capture() {
  const snapshot = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    snapshot[k] = localStorage.getItem(k);
  }
  document.getElementById("right").value = JSON.stringify(snapshot, null, 2);
  if (!document.getElementById("left").value) {
    document.getElementById("left").value = "{}";
  }
}

function clearAll() {
  document.getElementById("left").value = "";
  document.getElementById("right").value = "";
  document.getElementById("leftPane").innerHTML = "<em>Left diff appears here</em>";
  document.getElementById("rightPane").innerHTML = "<em>Right diff appears here</em>";
}

loadSample();
compare();