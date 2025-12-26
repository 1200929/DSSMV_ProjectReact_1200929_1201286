
import { WeatherData } from '../models/Weather';

const API_KEY = '51ca6243f7msh9902b1a86759ef4p18db50jsn69065123cb41';
const HOST = 'open-weather13.p.rapidapi.com';

export const getWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://${HOST}/latlon?latitude=${lat}&longitude=${lon}&lang=en`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': HOST
    }
  });

  if (!response.ok) throw new Error('Failed to get weather');

  const json = await response.json();


  if (json.main && json.weather && json.weather.length > 0) {
    return {
      temp: `${(json.main.temp - 273.15).toFixed(1)}ºC`,
      description: json.weather[0].description,
      wind: `${json.wind.speed} m/s`
    };
  }

  throw new Error("Weather data not found.");
};