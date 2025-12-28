
import { WeatherData } from './Weather';

export type ReportStatus = 'RESOLVED' | 'UNDER RESOLUTION';

export interface Report {
  _id?: string;
  id?: string;

  title: string;
  description: string;

  category: string;

  latitude: number;
  longitude: number;

  address?: string;
  area?: string;

  weather?: WeatherData;

  photoBase64?: string;

  timestamp: string;
  state: ReportStatus;
}