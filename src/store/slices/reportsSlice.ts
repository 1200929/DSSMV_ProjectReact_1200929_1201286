import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// CONFIGURAÇÃO DA RESTDB
const API_URL = 'https://dssmvprojectreact-5c80.restdb.io/rest/reports';
const API_KEY = '90130cb361a6aec41e818371bec1aac47303a';

export interface Report {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

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

  if (!response.ok) {
    throw new Error('Erro ao buscar dados da RestDB');
  }

  const data = await response.json();
  return data as Report[];
});

// ADICIONAR REPORT (POST)
export const addReport = createAsyncThunk('reports/addReport', async (newReport: Report) => {

  // dados necessários
  const reportData = {
    title: newReport.title,
    description: newReport.description,
    latitude: newReport.latitude,
    longitude: newReport.longitude,
    timestamp: newReport.timestamp
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

  if (!response.ok) {
    throw new Error('Erro ao enviar dados para a RestDB');
  }

  const savedReport = await response.json();
  return savedReport as Report;
});

// --- SLICE ---
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchReports.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro desconhecido';
      })
      // ADD
      .addCase(addReport.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default reportsSlice.reducer;