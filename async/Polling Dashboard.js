async function poll(url, onData, signal) {
  while (!signal.aborted) {
    try {
      const res = await fetch(url, { signal });
      onData(await res.json());
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
    }
    await sleep(3000);
  }
}

const controller = new AbortController();
poll('/api/messages', render, controller.signal);
