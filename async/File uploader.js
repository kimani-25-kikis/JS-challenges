async function uploadAll(files) {
  const results = [];
  for (const file of files) {
    const result = await uploadWithProgress(file); // waits each time
    results.push(result);
  }
  return results;
}

function uploadWithProgress(file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = e => updateProgress(e.loaded / e.total);
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = reject;
    xhr.open('POST', '/upload');
    xhr.send(file);
  });
}