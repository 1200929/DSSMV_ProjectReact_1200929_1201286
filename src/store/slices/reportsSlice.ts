import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Report } from '../../models/Report';

interface ReportsState {
  items: Report[];
}

const initialState: ReportsState = {
  items: [],
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    addReport: (state, action: PayloadAction<Report>) => {
      state.items.push(action.payload);
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(report => report.id !== action.payload);
    },
  },
});

export const { addReport, removeReport } = reportsSlice.actions;
export default reportsSlice.reducer;