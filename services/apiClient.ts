import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_URL as ENV_API_URL,
  TOKEN_KEY as ENV_TOKEN_KEY,
  USER_KEY as ENV_USER_KEY,
  WEBSOCKET_URL as ENV_WEBSOCKET_URL,
  EXPO_PROJECT_ID as ENV_EXPO_PROJECT_ID,
} from "@env";
import logger from "../utils/logger";

export const API_URL = ENV_API_URL;
export const TOKEN_KEY = ENV_TOKEN_KEY;
export const USER_KEY = ENV_USER_KEY;
export const WEBSOCKET_URL = ENV_WEBSOCKET_URL;
export const EXPO_PROJECT_ID = ENV_EXPO_PROJECT_ID;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
  validateStatus: (status: number) => status < 500,
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
      logger.error("Request interceptor error:", error);
      throw error;
    }
  },
  (error: AxiosError) => {
    logger.error("Request error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: AxiosError) => {
    logger.error("API Error:", {
      message: error.message,
      code: (error as any).code,
      status: error.response?.status,
      url: (error as any).config?.url,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      logger.warn("Authentication failed - clearing stored credentials");
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
      } catch (storageError) {
        logger.error("Error clearing storage:", storageError);
      }
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retry_after;
      logger.warn(`Rate limited. Retry after: ${retryAfter} seconds`);
    }

    if (error.response?.status === 503) {
      logger.warn("Service temporarily unavailable");
    }

    if (
      (error as any).code === "NETWORK_ERROR" ||
      error.message === "Network Error"
    ) {
      logger.error("Network connectivity issue detected");
    }

    return Promise.reject(error);
  }
);
