
import { WeatherData } from './Weather';

export type ReportStatus = 'RESOLVIDO' | 'EM RESOLUÇÃO';

export interface Report {
  _id?: string;
  id?: string;

  title: string;
  description: string;

  latitude: number;
  longitude: number;

  address?: string;
  area?: string;

  weather?: WeatherData;

  timestamp: string;
  state: ReportStatus;
}