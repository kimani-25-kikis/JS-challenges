let inventory = [];

function findProductIndex(productName) {
  productName = productName.toLowerCase();

  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i].name === productName) {
      return i;
    }
  }

  return -1;
}

function addProduct(product) {
  let productName = product.name.toLowerCase();
  let index = findProductIndex(productName);

  if (index !== -1) {
    inventory[index].quantity += product.quantity;
    console.log(`${productName} quantity updated`);
  } else {
    inventory.push({
      name: productName,
      quantity: product.quantity
    });

    console.log(`${productName} added to inventory`);
  }
}

function removeProduct(productName, quantity) {
  productName = productName.toLowerCase();

  let index = findProductIndex(productName);

  if (index === -1) {
    console.log(`${productName} not found`);
    return;
  }

  if (inventory[index].quantity < quantity) {
    console.log(
      `Not enough ${productName} available, remaining pieces: ${inventory[index].quantity}`
    );
    return;
  }

  inventory[index].quantity -= quantity;

  console.log(
    `Remaining ${productName} pieces: ${inventory[index].quantity}`
  );

  if (inventory[index].quantity === 0) {
    inventory.splice(index, 1);
  }
}