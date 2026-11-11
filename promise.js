fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    return fetch('https://api.example.com/data2');
  })
  .then(response => response.json())
  .then(data2 => console.log(data2))
  .catch(error => console.error('Error:', error));