import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Report } from '../../models/Report';
import { reportService } from '../../services/reportService';

interface ReportsState {
  items: Report[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReportsState = {
  items: [],
  status: 'idle',
  error: null,
};

// AÇÕES ASSÍNCRONAS

// BUSCAR DADOS (GET)
export const fetchReports = createAsyncThunk('reports/fetchReports', async () => {
  return await reportService.getAll();
});

// ADICIONAR REPORT (POST)
export const addReport = createAsyncThunk('reports/addReport', async (newReport: Omit<Report, 'state'>) => {

  // Prepara os dados
  const reportData = {
    ...newReport,
    address: newReport.address || "Address Unknown",
    area: newReport.area || "",
    weather: newReport.weather || null,
    photoBase64: newReport.photoBase64 || null,
    category: newReport.category || "General",
    state: "UNDER RESOLUTION"
  };

  return await reportService.create(reportData);
});

// APAGAR REPORT (DELETE)
export const deleteReport = createAsyncThunk('reports/deleteReport', async (reportId: string) => {
  await reportService.delete(reportId);
  return reportId; // Retorna o ID para o reducer remover da lista local
});

// ATUALIZAR REPORT
export const updateReport = createAsyncThunk('reports/updateReport', async (data: { id: string, updates: Partial<Report> }) => {
  const { id, updates } = data;
  const updatedRecord = await reportService.update(id, updates);


  return { id, updates: updatedRecord };
});


// SLICE (REDUCERS)
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchReports.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error';
      })
      // ADD
      .addCase(addReport.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // DELETE
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.items = state.items.filter(report =>
          report._id !== action.payload && report.id !== action.payload
        );
      })
      // UPDATE
      .addCase(updateReport.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.items.findIndex(r => r._id === id || r.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      });
  },
});

export default reportsSlice.reducer;