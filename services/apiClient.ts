import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL for API requests
export const API_URL = "http://10.0.2.2:3000/"; // For Android emulator pointing to localhost
// If using a real device or iOS simulator, you might need to adjust this URL
// For iOS simulator: 'http://localhost:3000/'
// For real device: use your computer's actual IP address

export const TOKEN_KEY = "@smartlift_token";
export const USER_KEY = "@smartlift_user";

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
