import { restDB } from './restDB.ts';
import { Report } from '../models/Report';

const COLLECTION = '/reports';

export const reportService = {
  // GET ALL
  getAll: async () => {
    const response = await restDB.get(COLLECTION);
    return response.data;
  },

  // POST (Create)
  create: async (data: any) => {
    const response = await restDB.post(COLLECTION, data);
    return response.data;
  },

  // DELETE
  delete: async (id: string) => {
    const response = await restDB.delete(`${COLLECTION}/${id}`);
    return response.data;
  },

  // PATCH (Update)
  update: async (id: string, updates: Partial<Report>) => {
    const response = await restDB.patch(`${COLLECTION}/${id}`, updates);
    return response.data;
  }
};