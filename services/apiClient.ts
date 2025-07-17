import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL as ENV_API_URL, TOKEN_KEY as ENV_TOKEN_KEY, USER_KEY as ENV_USER_KEY } from "@env";

// Base URL for API requests
export const API_URL = ENV_API_URL; // From .env file
// If using a real device or iOS simulator, you might need to adjust this URL in your .env file
// For Android emulator: 'http://10.0.2.2:3000/'
// For iOS simulator: 'http://localhost:3000/'
// For real device: use your computer's actual IP address

export const TOKEN_KEY = ENV_TOKEN_KEY;
export const USER_KEY = ENV_USER_KEY;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      throw error;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
