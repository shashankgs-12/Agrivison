export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainProbability: number;
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
  }>;
}
