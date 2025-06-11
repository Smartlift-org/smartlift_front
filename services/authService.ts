import { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginResponse, RegisterData } from "../types";
import { apiClient, TOKEN_KEY, USER_KEY } from "./apiClient";

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      // First get the token from login endpoint
      const loginResponse = await apiClient.post("/auth/login", {
        email,
        password,
      });
      
      const token = loginResponse.data.token;
      
      if (!token) {
        throw new Error("No token received from server");
      }
      
      // Save the token
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Set the token in headers for subsequent requests
      apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
      });
      
      // Now fetch the user data with the token using the profile endpoint
      const userResponse = await apiClient.get("/profile");
      const userData = userResponse.data;
      
      // Save user data
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Return the combined response
      return {
        token,
        user: userData
      };
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
