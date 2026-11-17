async function retry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await sleep(2 ** i * 1000); // 1s, 2s, 4s...
    }
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));