import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginResponse, RegisterData } from "../types";

// Base URL for API requests
const API_URL = "http://10.0.2.2:3000/"; // For Android emulator pointing to localhost
// If using a real device or iOS simulator, you might need to adjust this URL
// For iOS simulator: 'http://localhost:3000/'
// For real device: use your computer's actual IP address

const TOKEN_KEY = "@smartfit_token";
const USER_KEY = "@smartfit_user";

const apiClient: AxiosInstance = axios.create({
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
      console.error("Error getting token from AsyncStorage:", error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = (await apiClient.post("/auth/login", {
        email,
        password,
      })) as { data: LoginResponse };

      if (response.data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);

        if (response.data.user) {
          await AsyncStorage.setItem(
            USER_KEY,
            JSON.stringify(response.data.user)
          );
        }
      }

      return response.data;
    } catch (error) {
      console.error(
        "Login error:",
        (error as AxiosError).response?.data || (error as Error).message
      );
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<any> => {
    try {
      const response = await apiClient.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error(
        "Register error:",
        (error as AxiosError).response?.data || (error as Error).message
      );
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error("Authentication check error:", error);
      return false;
    }
  },
};

export default authService;
