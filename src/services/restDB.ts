import axios from 'axios';

const API_KEY = '90130cb361a6aec41e818371bec1aac47303a';

const BASE_URL = 'https://dssmvprojectreact-5c80.restdb.io/rest';

export const restDB = axios.create({
  baseURL: BASE_URL,
  headers: {
    'content-type': 'application/json',
    'x-apikey': API_KEY,
    'cache-control': 'no-cache',
  },
});