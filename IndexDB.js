let transaction = db.transaction(["customers"], "readwrite");
let objectStore = transaction.objectStore("customers");
let request = objectStore.add({ id: 1, name: "John Doe", email: "john@example.com" });

request.onerror = function(event) {
  console.log("Error adding data");
};

request.onsuccess = function(event) {
  console.log("Data added successfully");
};