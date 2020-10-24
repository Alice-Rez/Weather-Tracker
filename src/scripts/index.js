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

  $(".loader").css("display", "grid");

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
    $("#results").html('<p class="error">Location was not found :(</p>');
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
        element.day = "Today";
      } else if (index === 1) {
        element.day = "Tomorrow";
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
      element.wind_speed = Math.round(element.wind_speed * 1.60934);
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

let blueLight = "#64B6E7";
let blueDark = "#00697D";
let green = "#2E6C45";
let orange = "#C88C32";
let red = "#A52A2A";
let purple = "#79139c";

function styleWeather() {
  let temperatures = document.querySelectorAll(".temperature");

  for (let item of temperatures) {
    let value = item.textContent;
    let color;

    switch (true) {
      case value <= 0:
        color = blueLight;
        break;
      case value < 16:
        color = green;
        break;
      case value < 30:
        color = orange;
        break;
      case value > 29:
        color = red;
        break;
    }

    item.style.color = color;
  }

  let winds = document.querySelectorAll(".wind");
  let rotors = document.querySelectorAll(".rotor");
  let cards = document.querySelectorAll(".weather__card");

  for (let i = 0; i < winds.length; i++) {
    let value = winds[i].textContent;
    let color;
    let time;

    switch (true) {
      case value < 39:
        color = blueDark;
        time = 2000;
        break;
      case value < 62:
        color = green;
        time = 1500;
        break;
      case value < 89:
        color = orange;
        time = 1000;
        break;
      case value < 118:
        color = red;
        time = 500;
        break;
      case value >= 1180:
        color = purple;
        time = 250;
        break;
    }
    rotors[i].style.fill = color;
    rotors[i].style.animationDuration = `${time}ms`;
    cards[i].addEventListener("mouseover", () => {
      for (let j = 0; j < cards.length; j++) {
        rotors[j].style.animation = "none";
      }
      rotors[i].style.animation = `rotorRotation ${time}ms infinite linear`;
    });
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
