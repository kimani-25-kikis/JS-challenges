async function getWeather(city) {
  try {
    const response = await fetch(
      `https://weather-proxy.freecodecamp.rocks/api/city/${city}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function showWeather(city) {
  const data = await getWeather(city);

  if (!data || data.error) {
    alert("Something went wrong, please try again later");
    return;
  }

  // Make the card visible
  document.getElementById("weather-card").classList.add("visible");

  // Icon
  const iconEl = document.getElementById("weather-icon");
  iconEl.src = data.weather?.[0]?.icon ?? "";
  iconEl.alt = data.weather?.[0]?.description ?? "Weather icon";

  // Location & main weather
  document.getElementById("location").textContent =
    data.name ?? "N/A";
  document.getElementById("weather-main").textContent =
    data.weather?.[0]?.main ?? "N/A";

  // Temperatures
  const temp = data.main?.temp;
  document.getElementById("main-temperature").textContent =
    temp !== undefined && temp !== null ? `${temp} °C` : "N/A";

  const feels = data.main?.feels_like;
  document.getElementById("feels-like").textContent =
    feels !== undefined && feels !== null
      ? `Feels like ${feels} °C`
      : "Feels like N/A";

  // Humidity
  const humidity = data.main?.humidity;
  document.getElementById("humidity").textContent =
    humidity !== undefined && humidity !== null ? `${humidity}%` : "N/A";

  // Wind
  const windSpeed = data.wind?.speed;
  document.getElementById("wind").textContent =
    windSpeed !== undefined && windSpeed !== null
      ? `${windSpeed} m/s`
      : "N/A";

  // Gust
  const gust = data.wind?.gust;
  document.getElementById("wind-gust").textContent =
    gust !== undefined && gust !== null ? `${gust} m/s` : "N/A";
}

document.getElementById("get-weather-btn").addEventListener("click", () => {
  const select = document.querySelector("select");
  const city = select.value;

  if (!city) return; // do nothing if no city selected

  showWeather(city);
});