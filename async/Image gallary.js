async function loadImages(urls) {
  const results = await Promise.allSettled(
    urls.map(url => fetchImage(url))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}