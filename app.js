// API Key for OpenWeatherMap
const apiKey = "57f6cf6f75c188eac2ba40431266a455";

// Icon mapping for different weather conditions
const iconMap = {
  "Clear": "img/CHclear.png",
  "Clouds": "img/cloudCH.png",
  "Rain": "img/CHrainy.png",
  "Drizzle": "img/CHdrizzle.png",
  "Thunderstorm": "img/CHdrizzle.png",
  "Snow": "img/snowCH.png",
  "Mist": "img/mist.png"
};

// Elements for search button, input, and dropdown
const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const cityDropdown = document.getElementById("cityDropdown");

// Event listener for search button click
searchButton.addEventListener("click", function() {
  const city = cityInput.value.trim();
  if (city === "") {
    alert("Please enter a city name!");
    return;
  }
  fetchWeatherData(city);  // Fetch weather data based on city input
  saveToSessionStorage(city);  // Save city to session storage
});

// Event listener for "Enter" key press in the city input field
cityInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city === "") {
      alert("Please enter a city name!");
      return;
    }
    fetchWeatherData(city);  // Fetch weather data based on city input
    saveToSessionStorage(city);  // Save city to session storage
  }
});

// Event listener for selecting a city from the dropdown
cityDropdown.addEventListener("change", function() {
  const selectedCity = cityDropdown.value;
  if (selectedCity) {
    fetchWeatherData(selectedCity);  // Fetch weather data for the selected city
  }
});

// Function to fetch weather data for a given city
async function fetchWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod === "404") {
      alert("City not found. Please enter a valid city.");
      return;
    }

    showWeather(data);  // Show current weather data

    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    showForecast(forecastData.list);  // Show 5-day forecast data
  } catch (err) {
    alert("Error fetching weather data. Please try again.");
  }
}

// Function to display current weather data
function showWeather(data) {
  document.getElementById("weatherResult").classList.remove("hidden");
  document.getElementById("cityName").innerText = `${data.name} (${new Date().toISOString().split("T")[0]})`;
  document.getElementById("temp").innerText = `Temperature: ${data.main.temp}°C`;
  document.getElementById("wind").innerText = `Wind: ${data.wind.speed} M/S`;
  document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;

  document.getElementById("description").innerText = data.weather[0].main;
  const condition = data.weather[0].main;
  const iconPath = iconMap[condition] || "CHclear.png";
  document.getElementById("weatherIcon").src = iconPath;
}

// Function to display 5-day weather forecast data
function showForecast(forecastList) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  // Filter forecast for 12:00 PM readings and take only first 5 days
  const daily = forecastList.filter(item => item.dt_txt.includes(" 12:00:00")).slice(0, 5);

  // Loop through daily forecast and display
  daily.forEach(day => {
    const date = day.dt_txt.split(" ")[0];
    const temp = day.main.temp;
    const wind = day.wind.speed;
    const humidity = day.main.humidity;
    const condition = day.weather[0].main;
    const iconPath = iconMap[condition] || "CHclear.png";

    forecastDiv.innerHTML += `
      <div class="bg-gradient-to-r from-gray-800 to-gray-500 text-white p-2 rounded text-center">
        <p>${date}</p>
        <img class="mx-auto" src="${iconPath}" alt="">
        <p>Temp: ${temp}°C</p>
        <p>Wind: ${wind} M/S</p>
        <p>Humidity: ${humidity}%</p>
      </div>
    `;
  });
}

// Function to save recently searched city to sessionStorage
function saveToSessionStorage(city) {
  let cities = JSON.parse(sessionStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    sessionStorage.setItem("recentCities", JSON.stringify(cities));
  }
  updateCityDropdown();  // Update dropdown with recent cities
}

// Function to update city dropdown with recently searched cities
function updateCityDropdown() {
  let cities = JSON.parse(sessionStorage.getItem("recentCities")) || [];
  cityDropdown.innerHTML = "<option value=''>Select a City</option>";

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.innerText = city;
    cityDropdown.appendChild(option);
  });
}

// Function to get weather data based on user's current location
function getLocation() {
  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      showWeather(data);  // Show weather data for current location

      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();
      showForecast(forecastData.list);  // Show forecast for current location
    } catch (err) {
      alert("Unable to fetch location-based weather. Please try again.");
    }
  });
}

// On page load, check for recent city in session storage and fetch weather if needed
window.onload = function() {
  updateCityDropdown();

  const recentCities = JSON.parse(sessionStorage.getItem("recentCities")) || [];
  if (recentCities.length > 0) {
    // If there's any city in recent cities, automatically load weather for the first city
    fetchWeatherData(recentCities[0]);
  }
};