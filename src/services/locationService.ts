
const API_KEY = '51ca6243f7msh9902b1a86759ef4p18db50jsn69065123cb41';
const HOST = 'trueway-geocoding.p.rapidapi.com';

export const getAddressByCoords = async (lat: number, lon: number) => {
  const url = `https://${HOST}/ReverseGeocode?location=${lat}%2C${lon}&language=en`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': HOST
    }
  });

  if (!response.ok) throw new Error('Failed to get location');

  const json = await response.json();

  if (json.results && json.results.length > 0) {
    return {
      address: json.results[0].address,
      area: json.results[0].area
    };
  }

  throw new Error('Address not found.');
};