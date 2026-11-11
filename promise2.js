const output = document.getElementById("output");

function log(label, value) {
  const line = document.createElement("p");
  line.textContent = `${label}: ${JSON.stringify(value)}`;
  output.appendChild(line);
  console.log(label, value);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error("Invalid user id"));
        return;
      }
      resolve({ id, name: `User${id}`, active: id % 2 === 0 });
    }, 300);
  });
}

function fetchPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, userId, title: "Hello World" },
        { id: 2, userId, title: "Promises 101" },
      ]);
    }, 200);
  });
}

function fetchComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, postId, text: "Nice post" },
        { id: 2, postId, text: "Thanks for sharing" },
      ]);
    }, 150);
  });
}

async function loadDashboard(userId) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  return { user, posts, comments };
}

async function loadDashboardParallel(userId) {
  const user = await fetchUser(userId);
  const [posts, comments] = await Promise.all([
    fetchPosts(user.id),
    fetchComments(1),
  ]);
  return { user, posts, comments };
}

function loadWithRace() {
  return Promise.race([
    delay(100).then(() => "fast"),
    delay(500).then(() => "slow"),
  ]);
}

function loadWithAllSettled() {
  return Promise.allSettled([
    fetchUser(1),
    fetchUser(-1),
    fetchUser(2),
  ]);
}

function retry(fn, attempts) {
  return fn().catch((err) => {
    if (attempts <= 1) throw err;
    return delay(100).then(() => retry(fn, attempts - 1));
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error("Timeout");
    }),
  ]);
}

async function run() {
  log("1. Sequential fetch", await loadDashboard(1));
  log("2. Parallel fetch", await loadDashboardParallel(2));
  log("3. Race winner", await loadWithRace());
  log("4. All settled", await loadWithAllSettled());
  log("5. Retry success", await retry(() => fetchUser(3), 3));

  try {
    await retry(() => fetchUser(-1), 2);
  } catch (err) {
    log("6. Retry failure", err.message);
  }

  try {
    await withTimeout(delay(500).then(() => "done"), 100);
  } catch (err) {
    log("7. Timeout", err.message);
  }

  log("8. Finally ran", await delay(50).then(() => "ok").finally(() => "cleanup"));
}

run();