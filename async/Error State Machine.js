async function createPost(data) {
  setState('loading');
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    setState('error', err.message);
    throw err;
  } finally {
    setState('idle');
  }
}