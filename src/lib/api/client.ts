import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && !error.config.__isRetryRequest && !isAuthEndpoint) {
      try {
        const refreshResponse = await apiClient.post("/auth/refresh");
        setAccessToken(refreshResponse.data.accessToken);
        error.config.__isRetryRequest = true;
        error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
