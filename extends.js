// class Vehicle {
//   constructor(brand, year) {
//     this.brand = brand;
//     this.year = year;
//   }
// }

// class Car extends Vehicle {
//   honk() {
//     console.log("Honk! Honk!");
//   }
// }

// let myCar = new Car("freeCodeCamp Motors", 2019);
// console.log(myCar.brand);
// console.log(myCar.year);
// myCar.honk();

class Vehicle{
  constructor(brand, year){
    this.brand = brand;
        this.year = year;
  }
} 

class Car extends Vehicle{
  constructor(brand,year,doors){
    super(brand,year);
        this.doors = doors
  }
move(){
  console.log(`This Car belongs to ${this.brand} ${this.year} and has ${this.doors}`)
}
}

const mov = new Car("Joshua Motors",2024,7);
console.log(mov);
console.log(mov.brand);
console.log(mov.year);
console.log(mov.doors);
mov.move();