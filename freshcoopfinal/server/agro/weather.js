import { SAHEL_CITIES } from './cities.js';

const WEATHER_CACHE = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function fetchRealWeather(cityKey) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  const city = SAHEL_CITIES[cityKey];
  if (!city) return null;

  const cacheKey = cityKey;
  const cached = WEATHER_CACHE[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=fr`, { signal: AbortSignal.timeout(8000) }),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=fr`, { signal: AbortSignal.timeout(8000) })
    ]);

    if (!currentRes.ok || !forecastRes.ok) return null;

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    const dailyForecasts = processForecast(forecast);

    const result = {
      city: cityKey,
      zone: city.zone,
      coordinates: { lat: city.lat, lon: city.lon },
      current: {
        temp: Math.round(current.main.temp),
        feels_like: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        description: current.weather[0].description,
        wind_speed: Math.round(current.wind.speed * 3.6),
        icon: mapWeatherCondition(current.weather[0].id)
      },
      forecast: dailyForecasts,
      source: 'openweathermap',
      last_updated: new Date().toISOString()
    };

    WEATHER_CACHE[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error('OpenWeatherMap error:', error.message);
    return null;
  }
}

function processForecast(data) {
  const days = {};

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) {
      days[date] = { temps: [], humidity: [], rain: 0, conditions: [] };
    }
    days[date].temps.push(item.main.temp);
    days[date].humidity.push(item.main.humidity);
    days[date].rain += (item.rain?.['3h'] || 0);
    days[date].conditions.push(item.weather[0].id);
  }

  return Object.entries(days).slice(0, 7).map(([date, d]) => {
    const dateObj = new Date(date);
    const mainCondition = getMostFrequent(d.conditions);
    return {
      date,
      day: dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }),
      temp_min: Math.round(Math.min(...d.temps)),
      temp_max: Math.round(Math.max(...d.temps)),
      humidity: Math.round(d.humidity.reduce((a, b) => a + b) / d.humidity.length),
      rain_mm: Math.round(d.rain),
      rain_probability: d.rain > 0 ? Math.min(95, Math.round(30 + d.rain * 5)) : 5,
      condition: mapWeatherCondition(mainCondition)
    };
  });
}

function mapWeatherCondition(code) {
  if (code >= 200 && code < 300) return 'storm';
  if (code >= 300 && code < 500) return 'drizzle';
  if (code >= 500 && code < 600) return 'rain';
  if (code >= 600 && code < 700) return 'rain';
  if (code >= 700 && code < 800) return 'haze';
  if (code === 800) return 'sunny';
  return 'cloudy';
}

function getMostFrequent(arr) {
  const counts = {};
  arr.forEach(v => counts[v] = (counts[v] || 0) + 1);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export { fetchRealWeather };
