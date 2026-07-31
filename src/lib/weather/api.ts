export interface HourlyForecast {
  time: string;
  temp: number;
  humidity: number;
  rainProb: number;
  condition: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  rainProb: number;
  precipitation: number;
  uvIndex: number;
}

export interface DetailedWeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  rainProbability: number;
  soilMoisture: number; // percentage 0-100
  soilTemp: number;
  uvIndex: number;
  locationName: string;
  latitude: number;
  longitude: number;
  sunrise: string;
  sunset: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  agriculturalAdvice: {
    irrigationNeeded: boolean;
    irrigationReason: string;
    sprayingRecommended: boolean;
    sprayingReason: string;
    harvestingCondition: "Excellent" | "Fair" | "Poor";
  };
  lastUpdated: string;
}

function getWeatherConditionText(weatherCode: number, cloudCover: number = 0): string {
  // WMO Weather interpretation codes (WW)
  if (weatherCode === 0) return "Clear Sky";
  if (weatherCode === 1 || weatherCode === 2) return "Partly Cloudy";
  if (weatherCode === 3) return "Overcast";
  if (weatherCode >= 45 && weatherCode <= 48) return "Foggy";
  if (weatherCode >= 51 && weatherCode <= 55) return "Light Drizzle";
  if (weatherCode >= 61 && weatherCode <= 65) return "Rain Showers";
  if (weatherCode >= 71 && weatherCode <= 77) return "Snow Flurries";
  if (weatherCode >= 80 && weatherCode <= 82) return "Heavy Rain Showers";
  if (weatherCode >= 95 && weatherCode <= 99) return "Thunderstorm";
  if (cloudCover > 50) return "Cloudy";
  return "Sunny";
}

export async function fetchLiveWeather(
  lat: number = 12.9716,
  lng: number = 77.5946
): Promise<DetailedWeatherData> {
  try {
    // 1. Fetch reverse geocoding for human-readable location name
    let locationName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "AgriVisionAI/1.0" } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const address = geoData.address;
        const city = address.city || address.town || address.village || address.county || address.state_district || "Local Region";
        const state = address.state || address.country || "";
        locationName = state ? `${city}, ${state}` : city;
      }
    } catch (e) {
      console.warn("Geocoding fetch warning:", e);
    }

    // 2. Fetch Open-Meteo Hyperlocal Agricultural Weather
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto`;

    const res = await fetch(openMeteoUrl, { next: { revalidate: 1800 } });
    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const temp = Math.round(current.temperature_2m ?? 26);
    const feelsLike = Math.round(current.apparent_temperature ?? temp);
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const windSpeed = Math.round(current.wind_speed_10m ?? 10);
    const windDirection = Math.round(current.wind_direction_10m ?? 180);
    const soilTemp = Math.round(current.soil_temperature_0_to_7cm ?? 24);
    // soil_moisture_0_to_7cm is returned as m³/m³ (0.0 - 0.5 typical). Convert to percentage (0 - 100% saturation)
    const rawSoilMoisture = current.soil_moisture_0_to_7cm ?? 0.25;
    const soilMoisture = Math.min(100, Math.max(0, Math.round((rawSoilMoisture / 0.45) * 100)));

    const weatherCode = current.weather_code ?? 0;
    const condition = getWeatherConditionText(weatherCode);

    const rainProbability = daily.precipitation_probability_max?.[0] ?? 0;
    const uvIndex = daily.uv_index_max?.[0] ?? 5;

    // Parse Sunrise & Sunset
    const sunriseRaw = daily.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:00 AM";
    const sunsetRaw = daily.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "06:30 PM";

    // Build 24-hour hourly forecast
    const hourlyList: HourlyForecast[] = [];
    if (hourly.time && Array.isArray(hourly.time)) {
      const nowIdx = new Date().getHours();
      for (let i = nowIdx; i < Math.min(nowIdx + 24, hourly.time.length); i++) {
        hourlyList.push({
          time: new Date(hourly.time[i]).toLocaleTimeString([], { hour: "numeric", hour12: true }),
          temp: Math.round(hourly.temperature_2m[i]),
          humidity: Math.round(hourly.relative_humidity_2m[i]),
          rainProb: Math.round(hourly.precipitation_probability[i] ?? 0),
          condition: getWeatherConditionText(hourly.weather_code[i]),
        });
      }
    }

    // Build 7-day daily forecast
    const dailyList: DailyForecast[] = [];
    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const d = new Date(daily.time[i]);
        const dayName = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
        dailyList.push({
          date: daily.time[i],
          dayName,
          maxTemp: Math.round(daily.temperature_2m_max[i]),
          minTemp: Math.round(daily.temperature_2m_min[i]),
          condition: getWeatherConditionText(daily.weather_code[i]),
          rainProb: daily.precipitation_probability_max[i] ?? 0,
          precipitation: daily.precipitation_sum[i] ?? 0,
          uvIndex: daily.uv_index_max[i] ?? 5,
        });
      }
    }

    // Compute dynamic agricultural advice based on real parameters
    let irrigationNeeded = soilMoisture < 45 && rainProbability < 40;
    let irrigationReason = irrigationNeeded
      ? `Soil moisture is low (${soilMoisture}%) with low rain probability (${rainProbability}%). Irrigation recommended.`
      : rainProbability >= 40
      ? `High rain probability (${rainProbability}%). Hold off irrigation to conserve water.`
      : `Soil moisture levels (${soilMoisture}%) are optimal. No immediate irrigation needed.`;

    let sprayingRecommended = windSpeed < 15 && rainProbability < 30 && temp < 32;
    let sprayingReason = sprayingRecommended
      ? `Wind speed (${windSpeed} km/h) and temperature (${temp}°C) are ideal for pesticide/fertilizer spraying.`
      : windSpeed >= 15
      ? `High wind speed (${windSpeed} km/h) will cause spray drift. Postpone spraying.`
      : `High rain risk (${rainProbability}%) may wash away foliar applications.`;

    let harvestingCondition: "Excellent" | "Fair" | "Poor" =
      rainProbability < 20 && humidity < 70 ? "Excellent" : rainProbability < 50 ? "Fair" : "Poor";

    return {
      temperature: temp,
      feelsLike,
      condition,
      humidity,
      windSpeed,
      windDirection,
      rainProbability,
      soilMoisture,
      soilTemp,
      uvIndex,
      locationName,
      latitude: lat,
      longitude: lng,
      sunrise: sunriseRaw,
      sunset: sunsetRaw,
      hourly: hourlyList,
      daily: dailyList,
      agriculturalAdvice: {
        irrigationNeeded,
        irrigationReason,
        sprayingRecommended,
        sprayingReason,
        harvestingCondition,
      },
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  } catch (error: any) {
    console.error("Live Weather Fetch Error:", error);
    throw new Error(`Failed to fetch live weather data: ${error.message}`);
  }
}
