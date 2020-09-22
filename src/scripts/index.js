// The following line makes sure your styles are included in the project. Don't remove this.
import "../styles/main.scss";
// Import any additional modules you want to include below \/

// \/ All of your javascript should go here \/

let input = document.getElementById("city");
let submit = document.getElementById("submit");

submit.addEventListener("click", getWeather);

function getWeather(event) {
  event.preventDefault();
  let city = input.value.toLowerCase();

  fetch(
    `https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?query=${city}`
  )
    .then((res) => {
      return res.json();
    })
    .then((jsonData) => {
      let code = jsonData[0].woeid;
      console.log(code);
    })
    .catch((reject) => {
      console.log(reject);
    });
}
