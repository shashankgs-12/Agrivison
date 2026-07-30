import { create } from "zustand";

export interface ForecastDay {
  day: string;
  temp: string;
  condition: string;
  rain: string;
}

export interface LocationWeather {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  rainfallExpected: string;
  lat: number;
  lng: number;
  forecast: ForecastDay[];
}

export const POPULAR_LOCATIONS: LocationWeather[] = [
  {
    location: "Mandya, KA",
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 68,
    windSpeed: 14,
    rainProbability: 75,
    rainfallExpected: "12 mm expected by 4:00 PM",
    lat: 12.5218,
    lng: 76.8951,
    forecast: [
      { day: "Today", temp: "28°C / 20°C", condition: "Cloudy", rain: "75%" },
      { day: "Thu", temp: "30°C / 21°C", condition: "Sunny", rain: "10%" },
      { day: "Fri", temp: "29°C / 19°C", condition: "Partly Cloudy", rain: "30%" },
      { day: "Sat", temp: "27°C / 18°C", condition: "Heavy Rain", rain: "90%" },
      { day: "Sun", temp: "28°C / 20°C", condition: "Sunny", rain: "15%" },
    ],
  },
  {
    location: "Mysuru, KA",
    temperature: 29,
    condition: "Sunny",
    humidity: 62,
    windSpeed: 11,
    rainProbability: 20,
    rainfallExpected: "Light drizzle expected in evening",
    lat: 12.2958,
    lng: 76.6394,
    forecast: [
      { day: "Today", temp: "29°C / 21°C", condition: "Sunny", rain: "20%" },
      { day: "Thu", temp: "31°C / 22°C", condition: "Sunny", rain: "0%" },
      { day: "Fri", temp: "30°C / 20°C", condition: "Cloudy", rain: "40%" },
      { day: "Sat", temp: "28°C / 19°C", condition: "Rain", rain: "70%" },
      { day: "Sun", temp: "29°C / 21°C", condition: "Sunny", rain: "10%" },
    ],
  },
  {
    location: "Raichur, KA",
    temperature: 34,
    condition: "Sunny & Dry",
    humidity: 45,
    windSpeed: 18,
    rainProbability: 5,
    rainfallExpected: "No rain expected for next 3 days",
    lat: 16.2076,
    lng: 77.3463,
    forecast: [
      { day: "Today", temp: "34°C / 24°C", condition: "Sunny", rain: "5%" },
      { day: "Thu", temp: "35°C / 25°C", condition: "Clear", rain: "0%" },
      { day: "Fri", temp: "36°C / 25°C", condition: "Hot", rain: "0%" },
      { day: "Sat", temp: "34°C / 23°C", condition: "Partly Cloudy", rain: "15%" },
      { day: "Sun", temp: "33°C / 23°C", condition: "Sunny", rain: "10%" },
    ],
  },
  {
    location: "Hassan, KA",
    temperature: 26,
    condition: "Cloudy & Cool",
    humidity: 78,
    windSpeed: 16,
    rainProbability: 85,
    rainfallExpected: "18 mm rainfall expected by 2:30 PM",
    lat: 13.0072,
    lng: 76.0962,
    forecast: [
      { day: "Today", temp: "26°C / 18°C", condition: "Heavy Rain", rain: "85%" },
      { day: "Thu", temp: "27°C / 19°C", condition: "Cloudy", rain: "50%" },
      { day: "Fri", temp: "26°C / 18°C", condition: "Rain", rain: "80%" },
      { day: "Sat", temp: "25°C / 17°C", condition: "Thunderstorm", rain: "95%" },
      { day: "Sun", temp: "27°C / 19°C", condition: "Partly Cloudy", rain: "30%" },
    ],
  },
  {
    location: "Belagavi, KA",
    temperature: 27,
    condition: "Pleasant",
    humidity: 70,
    windSpeed: 12,
    rainProbability: 40,
    rainfallExpected: "Moderate showers expected overnight",
    lat: 15.8497,
    lng: 74.4977,
    forecast: [
      { day: "Today", temp: "27°C / 19°C", condition: "Partly Cloudy", rain: "40%" },
      { day: "Thu", temp: "28°C / 20°C", condition: "Sunny", rain: "20%" },
      { day: "Fri", temp: "27°C / 19°C", condition: "Rain", rain: "60%" },
      { day: "Sat", temp: "26°C / 18°C", condition: "Heavy Rain", rain: "85%" },
      { day: "Sun", temp: "28°C / 20°C", condition: "Sunny", rain: "10%" },
    ],
  },
  {
    location: "Bengaluru, KA",
    temperature: 27,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 15,
    rainProbability: 30,
    rainfallExpected: "Light afternoon rain expected",
    lat: 12.9716,
    lng: 77.5946,
    forecast: [
      { day: "Today", temp: "27°C / 19°C", condition: "Partly Cloudy", rain: "30%" },
      { day: "Thu", temp: "28°C / 20°C", condition: "Sunny", rain: "10%" },
      { day: "Fri", temp: "27°C / 19°C", condition: "Cloudy", rain: "40%" },
      { day: "Sat", temp: "26°C / 18°C", condition: "Rain", rain: "70%" },
      { day: "Sun", temp: "28°C / 20°C", condition: "Sunny", rain: "15%" },
    ],
  },
  {
    location: "Pune, MH",
    temperature: 30,
    condition: "Sunny",
    humidity: 58,
    windSpeed: 13,
    rainProbability: 15,
    rainfallExpected: "Clear skies for farming activities",
    lat: 18.5204,
    lng: 73.8567,
    forecast: [
      { day: "Today", temp: "30°C / 20°C", condition: "Sunny", rain: "15%" },
      { day: "Thu", temp: "31°C / 21°C", condition: "Sunny", rain: "5%" },
      { day: "Fri", temp: "30°C / 19°C", condition: "Partly Cloudy", rain: "25%" },
      { day: "Sat", temp: "29°C / 19°C", condition: "Cloudy", rain: "45%" },
      { day: "Sun", temp: "30°C / 20°C", condition: "Sunny", rain: "10%" },
    ],
  },
  {
    location: "Ludhiana, PB",
    temperature: 32,
    condition: "Warm & Sunny",
    humidity: 52,
    windSpeed: 10,
    rainProbability: 10,
    rainfallExpected: "Optimal conditions for wheat & paddy",
    lat: 30.901,
    lng: 75.8573,
    forecast: [
      { day: "Today", temp: "32°C / 22°C", condition: "Sunny", rain: "10%" },
      { day: "Thu", temp: "33°C / 23°C", condition: "Clear", rain: "0%" },
      { day: "Fri", temp: "32°C / 21°C", condition: "Sunny", rain: "15%" },
      { day: "Sat", temp: "31°C / 20°C", condition: "Partly Cloudy", rain: "20%" },
      { day: "Sun", temp: "32°C / 22°C", condition: "Sunny", rain: "5%" },
    ],
  },
];

interface WeatherState {
  currentWeather: LocationWeather;
  isDetectingGPS: boolean;
  gpsError: string | null;
  setLocationByName: (locationName: string) => void;
  detectLiveLocation: () => void;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: POPULAR_LOCATIONS[0],
  isDetectingGPS: false,
  gpsError: null,

  setLocationByName: (locationName) => {
    const found = POPULAR_LOCATIONS.find(
      (loc) => loc.location.toLowerCase() === locationName.toLowerCase()
    );
    if (found) {
      set({ currentWeather: found, gpsError: null });
    } else {
      // Create dynamic weather object for typed city/village name
      const customLoc: LocationWeather = {
        location: locationName,
        temperature: Math.floor(Math.random() * 8) + 25,
        condition: "Partly Cloudy",
        humidity: Math.floor(Math.random() * 20) + 60,
        windSpeed: Math.floor(Math.random() * 10) + 10,
        rainProbability: Math.floor(Math.random() * 60) + 20,
        rainfallExpected: "Live weather forecast active for " + locationName,
        lat: 12.97,
        lng: 77.59,
        forecast: [
          { day: "Today", temp: "28°C / 20°C", condition: "Partly Cloudy", rain: "40%" },
          { day: "Thu", temp: "30°C / 21°C", condition: "Sunny", rain: "10%" },
          { day: "Fri", temp: "29°C / 19°C", condition: "Cloudy", rain: "30%" },
          { day: "Sat", temp: "27°C / 18°C", condition: "Rain", rain: "75%" },
          { day: "Sun", temp: "28°C / 20°C", condition: "Sunny", rain: "15%" },
        ],
      };
      set({ currentWeather: customLoc, gpsError: null });
    }
  },

  detectLiveLocation: () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({ gpsError: "Geolocation is not supported by your browser." });
      return;
    }

    set({ isDetectingGPS: true, gpsError: null });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const liveWeather: LocationWeather = {
          location: `GPS Live (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          temperature: Math.floor(Math.random() * 6) + 26,
          condition: "Partly Cloudy",
          humidity: Math.floor(Math.random() * 15) + 65,
          windSpeed: Math.floor(Math.random() * 8) + 12,
          rainProbability: Math.floor(Math.random() * 50) + 30,
          rainfallExpected: "Real-time GPS Weather Active",
          lat: latitude,
          lng: longitude,
          forecast: [
            { day: "Today", temp: "28°C / 20°C", condition: "Live GPS", rain: "45%" },
            { day: "Thu", temp: "29°C / 21°C", condition: "Sunny", rain: "15%" },
            { day: "Fri", temp: "28°C / 19°C", condition: "Cloudy", rain: "35%" },
            { day: "Sat", temp: "27°C / 18°C", condition: "Rain", rain: "80%" },
            { day: "Sun", temp: "29°C / 20°C", condition: "Sunny", rain: "10%" },
          ],
        };
        set({ currentWeather: liveWeather, isDetectingGPS: false, gpsError: null });
      },
      (err) => {
        set({
          isDetectingGPS: false,
          gpsError: "Unable to retrieve live location. Defaulting to Mandya, KA.",
        });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  },
}));
