import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Definir a URL da API com base na variável de ambiente
const BASE_URL = process.env.REACT_APP_API_URL?.trim() || 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { data, config } = response;
    if (data?.token && config.url === '/auth/login') {
      localStorage.setItem('token', data.token);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Não autorizado");
    }
    return Promise.reject(error);
  }
);

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('lastEmail');
  localStorage.removeItem('refreshToken');
}

export function getToken() {
  return localStorage.getItem('token');
}
