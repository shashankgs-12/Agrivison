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
  source: "live" | "fallback";
  temperature: number;
  feelsLike: number | null;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number | null;
  rainProbability: number;
  soilMoisture: number | null; // volumetric water content in m³/m³, null when unavailable
  soilTemp: number | null;
  uvIndex: number | null;
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

function formatForecastTime(value: string): string {
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (!match) return value;

  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
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

    const readFinite = (value: unknown): number | null =>
      typeof value === "number" && Number.isFinite(value) ? value : null;
    const requiredCurrent = [
      current.temperature_2m,
      current.relative_humidity_2m,
      current.wind_speed_10m,
      daily.precipitation_probability_max?.[0],
    ].map(readFinite);
    if (requiredCurrent.some((value) => value === null)) {
      throw new Error("Weather provider response is missing required live measurements.");
    }

    const temp = Math.round(requiredCurrent[0]!);
    const humidity = Math.round(requiredCurrent[1]!);
    const windSpeed = Math.round(requiredCurrent[2]!);
    const rainProbability = Math.round(requiredCurrent[3]!);
    const feelsLikeValue = readFinite(current.apparent_temperature);
    const feelsLike = feelsLikeValue === null ? null : Math.round(feelsLikeValue);
    const windDirectionValue = readFinite(current.wind_direction_10m);
    const windDirection = windDirectionValue === null ? null : Math.round(windDirectionValue);
    const soilTempValue = readFinite(current.soil_temperature_0_to_7cm);
    const soilTemp = soilTempValue === null ? null : Math.round(soilTempValue);
    // Soil moisture is volumetric water content (m³/m³); preserve the provider's unit.
    const rawSoilMoisture = readFinite(current.soil_moisture_0_to_7cm);
    const soilMoisture = rawSoilMoisture !== null && rawSoilMoisture >= 0 && rawSoilMoisture <= 1
      ? rawSoilMoisture
      : null;

    const weatherCode = readFinite(current.weather_code);
    if (weatherCode === null) {
      throw new Error("Weather provider response is missing the current condition code.");
    }
    const condition = getWeatherConditionText(weatherCode);
    const uvIndexValue = readFinite(daily.uv_index_max?.[0]);
    const uvIndex = uvIndexValue === null ? null : Math.round(uvIndexValue);

    // Parse Sunrise & Sunset
    const sunriseRaw = daily.sunrise?.[0] ? formatForecastTime(daily.sunrise[0]) : "06:00 AM";
    const sunsetRaw = daily.sunset?.[0] ? formatForecastTime(daily.sunset[0]) : "06:30 PM";

    // Build 24-hour hourly forecast
    const hourlyList: HourlyForecast[] = [];
    if (hourly.time && Array.isArray(hourly.time)) {
      const currentHour = typeof current.time === "string" ? current.time.slice(0, 13) : "";
      const matchingHourIndex = currentHour
        ? hourly.time.findIndex((time: string) => time.slice(0, 13) === currentHour)
        : -1;
      const nowIdx = matchingHourIndex >= 0 ? matchingHourIndex : new Date().getHours();
      for (let i = nowIdx; i < Math.min(nowIdx + 24, hourly.time.length); i++) {
        const hourTemp = readFinite(hourly.temperature_2m?.[i]);
        const hourHumidity = readFinite(hourly.relative_humidity_2m?.[i]);
        const hourRainProb = readFinite(hourly.precipitation_probability?.[i]);
        const hourWeatherCode = readFinite(hourly.weather_code?.[i]);
        if (hourTemp === null || hourHumidity === null || hourRainProb === null || hourWeatherCode === null) {
          continue;
        }
        hourlyList.push({
          time: formatForecastTime(hourly.time[i]),
          temp: Math.round(hourTemp),
          humidity: Math.round(hourHumidity),
          rainProb: Math.round(hourRainProb),
          condition: getWeatherConditionText(hourWeatherCode),
        });
      }
    }

    // Build 7-day daily forecast
    const dailyList: DailyForecast[] = [];
    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const maxTemp = readFinite(daily.temperature_2m_max?.[i]);
        const minTemp = readFinite(daily.temperature_2m_min?.[i]);
        const dayWeatherCode = readFinite(daily.weather_code?.[i]);
        const dayRainProb = readFinite(daily.precipitation_probability_max?.[i]);
        const precipitation = readFinite(daily.precipitation_sum?.[i]);
        const dayUvIndex = readFinite(daily.uv_index_max?.[i]);
        if ([maxTemp, minTemp, dayWeatherCode, dayRainProb, precipitation, dayUvIndex].some((value) => value === null)) {
          continue;
        }
        const dayName = i === 0
          ? "Today"
          : new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
              new Date(`${daily.time[i]}T12:00:00Z`)
            );
        dailyList.push({
          date: daily.time[i],
          dayName,
          maxTemp: Math.round(maxTemp!),
          minTemp: Math.round(minTemp!),
          condition: getWeatherConditionText(dayWeatherCode!),
          rainProb: Math.round(dayRainProb!),
          precipitation: precipitation!,
          uvIndex: Math.round(dayUvIndex!),
        });
      }
    }

    // Compute dynamic agricultural advice based on real parameters
    const irrigationNeeded = false;
    const irrigationReason = soilMoisture === null
      ? `Live soil-moisture data is unavailable. Check field conditions before deciding whether to irrigate; forecast rain probability is ${rainProbability}%.`
      : `The provider models volumetric soil water at ${soilMoisture.toFixed(2)} m³/m³. This is not a field sensor reading and needs crop- and soil-specific thresholds; check field conditions before deciding. Forecast rain probability is ${rainProbability}%.`;

    const sprayingRecommended = windSpeed < 15 && rainProbability < 30 && temp < 32;
    const sprayingReason = sprayingRecommended
      ? `Wind speed (${windSpeed} km/h) and temperature (${temp}°C) are ideal for pesticide/fertilizer spraying.`
      : windSpeed >= 15
      ? `High wind speed (${windSpeed} km/h) will cause spray drift. Postpone spraying.`
      : `High rain risk (${rainProbability}%) may wash away foliar applications.`;

    const harvestingCondition: "Excellent" | "Fair" | "Poor" =
      rainProbability < 20 && humidity < 70 ? "Excellent" : rainProbability < 50 ? "Fair" : "Poor";

    return {
      source: "live",
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
  } catch (error: unknown) {
    console.warn("Live Weather Fetch Warning (using fallback):", error);

    // Resilient Fallback Weather Payload when offline or API is unreachable
    return {
      source: "fallback",
      temperature: 27,
      feelsLike: 28,
      condition: "Partly Cloudy",
      humidity: 58,
      windSpeed: 12,
      windDirection: 180,
      rainProbability: 25,
      soilMoisture: null,
      soilTemp: 24,
      uvIndex: 6,
      locationName: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      latitude: lat,
      longitude: lng,
      sunrise: "06:12 AM",
      sunset: "06:38 PM",
      hourly: Array.from({ length: 24 }).map((_, idx) => ({
        time: `${(idx % 12) || 12}:00 ${idx >= 12 ? "PM" : "AM"}`,
        temp: 22 + Math.floor(Math.sin(idx / 3) * 6),
        humidity: 50 + (idx % 20),
        rainProb: (idx * 5) % 40,
        condition: idx > 12 && idx < 17 ? "Sunny" : "Partly Cloudy",
      })),
      daily: ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => ({
        date: new Date(Date.now() + idx * 86400000).toISOString().split("T")[0],
        dayName,
        maxTemp: 31 - idx % 3,
        minTemp: 21 + idx % 2,
        condition: idx === 2 ? "Rain Showers" : "Partly Cloudy",
        rainProb: idx === 2 ? 65 : 20,
        precipitation: idx === 2 ? 12 : 0,
        uvIndex: 7,
      })),
      agriculturalAdvice: {
        irrigationNeeded: false,
        irrigationReason: "Soil moisture levels (48%) are currently optimal for crop health.",
        sprayingRecommended: true,
        sprayingReason: "Wind speed (12 km/h) and temperature (27°C) are ideal for foliar applications.",
        harvestingCondition: "Excellent",
      },
      lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }
}
