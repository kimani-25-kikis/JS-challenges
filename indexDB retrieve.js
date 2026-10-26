let transaction = db.transaction(["customers"]);
let objectStore = transaction.objectStore("customers");
let request = objectStore.get(1);

request.onerror = function(event) {
  console.log("Error retrieving data");
};

request.onsuccess = function(event) {
  console.log("Customer:", request.result);
};