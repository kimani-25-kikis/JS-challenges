const box = document.getElementById("box");
const scrubber = document.getElementById("scrubber");
const readout = document.getElementById("readout");
const durationInput = document.getElementById("duration");
const animNameInput = document.getElementById("animName");
let pausedTime = 0;
let isPaused = false;

function applySettings() {
  const name = animNameInput.value.trim() || "demo";
  const dur = parseFloat(durationInput.value) || 3;
  box.style.animationName = name;
  box.style.animationDuration = dur + "s";
  box.style.animationPlayState = isPaused ? "paused" : "running";
  if (isPaused) setPausedTime(pausedTime);
}

function setPausedTime(ms) {
  pausedTime = ms;
  box.style.animationDelay = `-${ms}ms`;
}

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = true;
  const dur = (parseFloat(durationInput.value) || 3) * 1000;
  const current = parseFloat(scrubber.value) / 1000 * dur;
  pausedTime = current;
  box.style.animationPlayState = "paused";
  setPausedTime(current);
  updateReadout(current);
});

document.getElementById("resumeBtn").addEventListener("click", () => {
  isPaused = false;
  box.style.animationPlayState = "running";
  box.style.animationDelay = "";
  scrubber.value = 0;
  readout.textContent = "Animation running.";
});

document.getElementById("restartBtn").addEventListener("click", () => {
  box.style.animation = "none";
  void box.offsetWidth;
  applySettings();
  if (isPaused) {
    setPausedTime(0);
    scrubber.value = 0;
    updateReadout(0);
  }
});

document.getElementById("applyBtn").addEventListener("click", applySettings);

scrubber.addEventListener("input", () => {
  const dur = (parseFloat(durationInput.value) || 3) * 1000;
  const ms = parseFloat(scrubber.value) / 1000 * dur;
  isPaused = true;
  box.style.animationPlayState = "paused";
  setPausedTime(ms);
  updateReadout(ms);
});

function updateReadout(ms) {
  const cs = getComputedStyle(box);
  const pct = ((ms / ((parseFloat(durationInput.value) || 3) * 1000)) * 100).toFixed(1);
  readout.textContent =
    `Time: ${ms.toFixed(0)}ms (${pct}%)\n` +
    `transform: ${cs.transform}\n` +
    `background: ${cs.backgroundColor}\n` +
    `border-radius: ${cs.borderRadius}\n` +
    `opacity: ${cs.opacity}`;
}

let rafId;
function liveLoop() {
  if (!isPaused) {
    const dur = (parseFloat(durationInput.value) || 3) * 1000;
    const t = (performance.now() % dur);
    scrubber.value = (t / dur) * 1000;
    updateReadout(t);
  }
  rafId = requestAnimationFrame(liveLoop);
}

applySettings();
liveLoop();