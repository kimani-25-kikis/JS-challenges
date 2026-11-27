const resources = { food: 10, water: 10, shelter: 5, health: 10, day: 1 };
const events = [
  { text: "A wild berry bush appears.", effects: { food: 3 } },
  { text: "Rain fills your canteen.", effects: { water: 4 } },
  { text: "A storm damages your shelter.", effects: { shelter: -2 } },
  { text: "You find a clear stream.", effects: { water: 5, health: 1 } },
  { text: "A thief steals some food.", effects: { food: -3 } },
  { text: "You discover an abandoned cabin.", effects: { shelter: 4 } },
  { text: "You get sick from bad water.", effects: { health: -2 } },
  { text: "A trader gives you supplies.", effects: { food: 2, water: 2 } },
  { text: "Cold night weakens you.", effects: { health: -1 } },
  { text: "You catch a fish.", effects: { food: 4 } }
];
const screen = document.getElementById("screen");
let inputBuffer = "";

function render(message) {
  screen.textContent =
    "=== LIFE SIMULATOR ===\n" +
    `Day ${resources.day}\n` +
    `Food:    ${bar(resources.food)}\n` +
    `Water:   ${bar(resources.water)}\n` +
    `Shelter: ${bar(resources.shelter)}\n` +
    `Health:  ${bar(resources.health)}\n\n` +
    (message ? message + "\n\n" : "") +
    "Commands: [1] Forage  [2] Drink  [3] Repair  [4] Rest  [q] Quit\n> " +
    inputBuffer;
}

function bar(v) {
  const filled = Math.max(0, Math.min(10, v));
  return "[" + "#".repeat(filled) + "-".repeat(10 - filled) + "] " + v;
}

function clampAll() {
  for (const k of ["food", "water", "shelter", "health"]) {
    resources[k] = Math.max(0, Math.min(10, resources[k]));
  }
}

function tick() {
  resources.food -= 1;
  resources.water -= 1;
  if (resources.shelter < 3) resources.health -= 1;
  resources.day += 1;
  clampAll();
}

function randomEvent() {
  if (Math.random() < 0.6) {
    const e = events[Math.floor(Math.random() * events.length)];
    for (const [k, v] of Object.entries(e.effects)) resources[k] += v;
    clampAll();
    return e.text;
  }
  return null;
}

function checkGameOver() {
  if (resources.health <= 0) return "You have perished.";
  if (resources.food <= 0 && resources.water <= 0) return "You starved and dehydrated.";
  return null;
}

let pending = null;

function act(cmd) {
  let msg = "";
  if (cmd === "1") { resources.food += 3; msg = "You forage for food."; }
  else if (cmd === "2") { resources.water += 3; msg = "You drink from a nearby source."; }
  else if (cmd === "3") { resources.shelter += 3; msg = "You reinforce your shelter."; }
  else if (cmd === "4") { resources.health += 2; resources.food -= 1; resources.water -= 1; msg = "You rest and recover."; }
  else { msg = "Unknown command."; render(msg); return; }

  tick();
  const evt = randomEvent();
  if (evt) msg += "\n" + evt;

  clampAll();
  const over = checkGameOver();
  if (over) {
    render(msg + "\n\n" + over + "\n\nPress [r] to restart or [q] to quit.");
    pending = "over";
    return;
  }
  render(msg);
}

function restart() {
  resources.food = 10;
  resources.water = 10;
  resources.shelter = 5;
  resources.health = 10;
  resources.day = 1;
  pending = null;
  render("A new life begins.");
}

document.addEventListener("keydown", (e) => {
  if (pending === "over") {
    if (e.key === "r") restart();
    else if (e.key === "q") render("Goodbye.");
    return;
  }
  if (e.key === "q") { render("Goodbye."); return; }
  if (["1", "2", "3", "4"].includes(e.key)) { act(e.key); return; }
  if (e.key === "r") { restart(); return; }
});

render("You wake up in the wilderness. Survive as long as you can.");