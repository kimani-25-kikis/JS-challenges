async function getWeather(city) {
  const { lat, lon } = await geocode(city);          
  const [current, forecast] = await Promise.all([    
    fetchCurrent(lat, lon),
    fetchForecast(lat, lon),
  ]);
  return { current, forecast };
}