import { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginResponse, RegisterData } from "../types";
import { apiClient, TOKEN_KEY, USER_KEY } from "./apiClient";

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const loginResponse = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const token = loginResponse.data.token;

      if (!token) {
        throw new Error("No token received from server");
      }

      await AsyncStorage.setItem(TOKEN_KEY, token);

      apiClient.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
          return config;
        }
      );

      const userResponse = await apiClient.get("/profile");
      const userData = userResponse.data;

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      return {
        token,
        user: userData,
      };
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<any> => {
    try {
      const response = await apiClient.post("/users", { user: userData });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      throw error;
    }
  },
  
  forgotPassword: async (email: string): Promise<{ message: string; email: string }> => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  validateToken: async (token: string): Promise<{ valid: boolean; message?: string; error?: string }> => {
    try {
      const response = await apiClient.get(`/auth/validate-token?token=${encodeURIComponent(token)}`);
      return response.data;
    } catch (error: any) {
      // Si hay un error HTTP, devolvemos un objeto con formato consistente
      return {
        valid: false,
        error: error.response?.data?.error || "Error al validar el token"
      };
    }
  },
  
  resetPassword: async (
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ message: string; user: { id: number; email: string; name: string } }> => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
