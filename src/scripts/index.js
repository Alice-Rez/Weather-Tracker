// ----- IMPORTING -----

import "../styles/main.scss";
import "babel-polyfill"; // to be able to use async await
import $ from "jquery"; // importing jquery
const Handlebars = require("handlebars"); // importing handlebars

$(document).ready(() => {
  $(".form").submit(getWeather);
});

async function getWeather(event) {
  event.preventDefault();

  $("#results").html("");

  // ----- LOADER ACTIVATING -----

  $(".loader").css("display", "block");

  // ----- FETCHING LOCATION -----

  let responseLocation = await fetch(
    `https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?query=${$(
      "#city"
    )
      .val()
      .toLowerCase()}`
  );
  let locationData = await responseLocation.json();

  console.log(locationData);

  if (locationData.length === 0) {
    $("#results").html(
      '<p class="error">Invalid Input! Location not found</p>'
    );
    $(".loader").css("display", "none");
  } else {
    // ---- FETCHING WEATHER DATA -----

    let code = locationData[0].woeid;
    let responseWeather = await fetch(
      `https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/${code}`
    );
    let weatherJson = await responseWeather.json();
    let weatherData = weatherJson.consolidated_weather;

    // ----- MANIPULATING WEATHER DATA FOR NICER DISPLAY -----

    weatherData.map((element, index) => {
      if (index === 0) {
        element.day = "today";
      } else if (index === 1) {
        element.day = "tomorrow";
      } else {
        element.day = chooseDay(element.applicable_date.substr(0, 10));
        console.log(element.day);
      }

      element.max_temp = Math.round(element.max_temp);
      element.min_temp = Math.round(element.min_temp);
      element.applicable_date = element.applicable_date
        .split("-")
        .reverse()
        .join(".");
      element.img_source = `https://www.metaweather.com/static/img/weather/${element.weather_state_abbr}.svg`;

      if (element.wind_speed > 5) {
        element.wind_img =
          "https://grid.gograph.com/wind-measurement-instrument-icon-eps-illustration_gg78945909.jpg";
        element.wind_speed = Math.round(element.wind_speed * 1.60934);
      }
    });

    // ----- INJECTING DATA TO HTML USING HANDLEBARS -----

    let cardTemp = $("#card-template").html();
    let handleFunction = Handlebars.compile(cardTemp);
    let result = handleFunction({ weatherData });
    $("#results").append(result);

    // ----- DEACTIVATE LOADER -----

    $(".loader").css("display", "none");

    // ----- DISPLAYING WEATHER INFO -----

    $(".weather").css("display", "flex");

    console.log(weatherData);
    styleWeather(weatherData);
  }
}

function styleWeather() {
  let temperatures = document.querySelectorAll(".temperature");

  for (let item of temperatures) {
    let value = item.textContent;

    if (value <= 0) {
      item.style.color = "#64B6E7";
    } else if (value > 0 && value < 16) {
      item.style.color = "#2E6C45";
    } else if (value > 15 && value < 30) {
      item.style.color = "#E79564";
    } else if (value > 29) {
      item.style.color = "#A52A2A";
    }
  }
}

function chooseDay(string) {
  let weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = new Date(string);

  console.log(day.getDay());

  return weekdays[day.getDay()];
}
