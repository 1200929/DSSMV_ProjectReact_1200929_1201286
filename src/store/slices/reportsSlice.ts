import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Report } from '../../models/Report';


// CONFIGURAÇÃO DA RESTDB
const API_URL = 'https://dssmvprojectreact-5c80.restdb.io/rest/reports';
const API_KEY = '90130cb361a6aec41e818371bec1aac47303a';


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


// AÇÕES ASSÍNCRONAS (THUNKS)

// BUSCAR DADOS (GET)
export const fetchReports = createAsyncThunk('reports/fetchReports', async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-apikey': API_KEY,
      'cache-control': 'no-cache'
    }
  });

  if (!response.ok) throw new Error('Error getting data');
  return (await response.json()) as Report[];
});

// ADICIONAR REPORT (POST)
export const addReport = createAsyncThunk('reports/addReport', async (newReport: Omit<Report, 'state'>) => {

  const reportData = {
    ...newReport,
    address: newReport.address || "Address Unknown",
    area: newReport.area || "",

    weather: newReport.weather || null,

    photoBase64:newReport.photoBase64 || null,

    category: newReport.category || "General",

    state: "UNDER RESOLUTION"
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apikey': API_KEY,
      'cache-control': 'no-cache'
    },
    body: JSON.stringify(reportData)
  });

  if (!response.ok) throw new Error('Error creating report');
  return (await response.json()) as Report;
});

// APAGAR REPORT (DELETE)
export const deleteReport = createAsyncThunk('reports/deleteReport', async (reportId: string) => {
  const response = await fetch(`${API_URL}/${reportId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-apikey': API_KEY,
      'cache-control': 'no-cache'
    }
  });

  if (!response.ok) throw new Error('Error deleting');
  return reportId;
});

// ATUALIZAR REPORT
// Recebe um objeto com o ID e os campos a mudar (Partial<Report>)
export const updateReport = createAsyncThunk('reports/updateReport', async (data: { id: string, updates: Partial<Report> }) => {
  const { id, updates } = data;

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-apikey': API_KEY,
      'cache-control': 'no-cache'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) throw new Error('Error updating');

  // A API devolve o objeto atualizado ou o ID. Devolve os dados para atualizar o Redux.
  const updatedRecord = await response.json();
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
        state.error = action.error.message || 'Erro';
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
        // Encontra o item na lista e atualiza os seus campos
        const index = state.items.findIndex(r => r._id === id || r.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      });
  },
});

export default reportsSlice.reducer;