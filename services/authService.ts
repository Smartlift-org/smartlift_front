import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginResponse, RegisterData } from "../types/index";
import { apiClient, TOKEN_KEY, USER_KEY } from "./apiClient";
import notificationService from "./notificationService";
import logger from "../utils/logger";

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const loginResponse = await apiClient.post("/auth/login", {
        email,
        password,
      });

      if (loginResponse.status >= 400) {
        throw new Error(
          "Credenciales incorrectas. Verifica tu email y contraseña."
        );
      }

      const token = loginResponse.data.token;

      if (!token) {
        throw new Error(
          "No se pudo obtener el token de autenticación del servidor"
        );
      }

      await AsyncStorage.setItem(TOKEN_KEY, token);

      const userResponse = await apiClient.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = userResponse.data;

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      try {
        await notificationService.initialize();
        await notificationService.registerForPushNotifications();
      } catch (notificationError) {
        logger.warn(
          "Failed to register push notifications:",
          notificationError
        );
      }

      return {
        token,
        user: userData,
      };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data?.error || error.response.data?.message;

        if (status === 401 || status === 422) {
          throw new Error(
            "Credenciales incorrectas. Verifica tu email y contraseña."
          );
        } else if (status === 404) {
          throw new Error("Usuario no encontrado.");
        } else if (errorMessage) {
          throw new Error(errorMessage);
        } else {
          throw new Error("Error al iniciar sesión. Inténtalo de nuevo.");
        }
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Error de conexión. Verifica tu conexión a internet.");
      }
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
      try {
        await notificationService.unregister();
        notificationService.cleanup();
      } catch (notificationError) {
        logger.warn("Failed to cleanup push notifications:", notificationError);
      }

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

  forgotPassword: async (
    email: string
  ): Promise<{ message: string; email: string }> => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  validateToken: async (
    token: string
  ): Promise<{ valid: boolean; message?: string; error?: string }> => {
    try {
      const response = await apiClient.get(
        `/auth/validate-token?token=${encodeURIComponent(token)}`
      );
      return response.data;
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.error || "Error al validar el token",
      };
    }
  },

  resetPassword: async (
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{
    message: string;
    user: { id: number; email: string; name: string };
  }> => {
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

  updateProfilePicture: async (imageUri: string): Promise<User> => {
    try {
      const formData = new FormData();

      formData.append("profile_picture", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      const response = await apiClient.post(
        "/users/profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = response.data.user;
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  getProfilePicture: async (
    userId: string
  ): Promise<{
    profile_picture_url: string | null;
    user_id: string;
    full_name: string;
  }> => {
    try {
      const response = await apiClient.get(`/users/${userId}/profile-picture`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
