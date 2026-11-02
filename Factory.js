class Pizza{
  constructor(type,price){
    this.type = type;
    this.price = price;
  }
static createMargherita(){
  return new this("Margherita", 6.99);
}
static createVeggie() {
  return new this("Veggie", 7.49);
}
}
let myPizza = pizza.createMargherita();
let myVeggie = pizza.createVeggie();
console.log(myPizza)
console.log(myVeggie)