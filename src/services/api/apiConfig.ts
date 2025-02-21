import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// const BASE_URL = 'http://localhost:8080';
//URL Heroku
const BASE_URL = 'https://foodflow-b58096cef866.herokuapp.com/';

export const api = axios.create({
  // baseURL: BASE_URL,
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
