const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  location: string;
  forecast: Array<{
    day: string;
    temp: string;
    condition: string;
    rain: string;
  }>;
}

export async function fetchWeatherForLocation(
  lat: number = 12.5218,
  lng: number = 76.8951
): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    // Return mock weather data if API key is not yet set
    return {
      temperature: 28,
      condition: "Partly Cloudy",
      humidity: 68,
      windSpeed: 14,
      rainProbability: 75,
      location: "Mandya, KA",
      forecast: [
        { day: "Today", temp: "28°C / 20°C", condition: "Cloudy", rain: "75%" },
        { day: "Thu", temp: "30°C / 21°C", condition: "Sunny", rain: "10%" },
        { day: "Fri", temp: "29°C / 19°C", condition: "Partly Cloudy", rain: "30%" },
        { day: "Sat", temp: "27°C / 18°C", condition: "Heavy Rain", rain: "90%" },
        { day: "Sun", temp: "28°C / 20°C", condition: "Sunny", rain: "15%" },
      ],
    };
  }

  const res = await fetch(
    `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lng}&days=7&aqi=no`
  );

  if (!res.ok) {
    throw new Error(`Weather API error: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;
  const location = data.location;
  const forecastDays = data.forecast?.forecastday || [];

  return {
    temperature: Math.round(current.temp_c),
    condition: current.condition.text,
    humidity: current.humidity,
    windSpeed: Math.round(current.wind_kph),
    rainProbability: forecastDays[0]?.day?.daily_chance_of_rain || 0,
    location: `${location.name}, ${location.region}`,
    forecast: forecastDays.slice(0, 5).map((f: any) => ({
      day: new Date(f.date).toLocaleDateString("en-US", { weekday: "short" }),
      temp: `${Math.round(f.day.maxtemp_c)}°C / ${Math.round(f.day.mintemp_c)}°C`,
      condition: f.day.condition.text,
      rain: `${f.day.daily_chance_of_rain}%`,
    })),
  };
}
