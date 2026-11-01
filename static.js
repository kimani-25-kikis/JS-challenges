class Movie {

  constructor(title, rating) {
    this.title = title;
    this.rating = rating;
  }

  static compareMovies(movieA, movieB) {
    if (movieA.rating > movieB.rating) {
      console.log(`${movieA.title} has a higher rating.`);
    } else if (movieA.rating < movieB.rating) {
      console.log(`${movieB.title} has a higher rating.`);
    } else {
      console.log("These movies have the same rating.");
    }
  }

}

let movieA = new Movie("Movie A", 80);
let movieB = new Movie("Movie B", 45);
console.log(movieA);