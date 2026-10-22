
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weather-card");
const locationResults = document.getElementById("location-results");

function getWeatherDescription(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return conditions[code] ?? "Weather condition unavailable";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 86) return "🌦️";
  if (code >= 95) return "⛈️";

  return "🌡️";
}

// Search for matching locations
async function searchLocations(city) {
  message.textContent = "Searching for places...";
  weatherCard.hidden = true;
  locationResults.replaceChildren();

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search" +
      `?name=${encodeURIComponent(city)}` +
      "&count=10&language=en&format=json&countryCode=IN";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not search locations. Try again.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      message.textContent = "Location not found. Try another name.";
      return;
    }

    // Show each matching location as a button
    data.results.forEach((place) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "location-option";

      const name = document.createElement("strong");
      name.textContent = place.name;

      const details = document.createElement("span");
      details.textContent = [
        place.admin3,
        place.admin2,
        place.admin1,
        place.country
      ].filter(Boolean).join(", ");

      button.append(name, details);

      button.addEventListener("click", () => {
        locationResults.replaceChildren();
        getWeather(place);
      });

      locationResults.appendChild(button);
    });

    message.textContent =
      `${data.results.length} matching location(s) found. Select one.`;

  } catch (error) {
    message.textContent = error.message;
  }
}

// Fetch weather for the selected location
async function getWeather(place) {
  message.textContent = `Fetching weather for ${place.name}...`;
  weatherCard.hidden = true;
  locationResults.replaceChildren();

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${place.latitude}` +
      `&longitude=${place.longitude}` +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
      "&timezone=auto";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not fetch weather data. Try again.");
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error("Weather data is unavailable.");
    }

    document.getElementById("city-name").textContent =
      [place.name, place.admin1, place.country]
        .filter(Boolean)
        .join(", ");

    document.getElementById("weather-description").textContent =
      getWeatherDescription(current.weather_code);

    document.getElementById("weather-icon").src =
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="75%" text-anchor="middle" font-size="72">${getWeatherIcon(current.weather_code)}</text></svg>`
      );

    document.getElementById("weather-icon").alt =
      getWeatherDescription(current.weather_code);

    document.getElementById("temperature").textContent =
      Math.round(current.temperature_2m);

    document.getElementById("feels-like").textContent =
      `Feels like ${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;

    document.getElementById("wind-speed").textContent =
      `${current.wind_speed_10m} km/h`;

    weatherCard.hidden = false;
    message.textContent = "Weather updated successfully!";

  } catch (error) {
    message.textContent = error.message;
  }
}

// Handle search form submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city.length < 2) {
    message.textContent = "Enter at least 2 characters.";
    weatherCard.hidden = true;
    locationResults.replaceChildren();
    return;
  }

  searchLocations(city);
});

// Load Amravati weather on startup
searchLocations("Amravati");
function updateDateTime() {
  const now = new Date();

  document.getElementById("current-date").textContent =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  document.getElementById("current-time").textContent =
    now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
}

updateDateTime();
setInterval(updateDateTime, 1000);