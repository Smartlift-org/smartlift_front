import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./apiClient";
import type { User } from "../types";

interface AdminRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "coach" | "user";
}

class AdminService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem("authToken");
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`
      );
    }

    return response;
  }

  async registerUser(userData: AdminRegisterData): Promise<User> {
    const response = await this.makeAuthenticatedRequest("/admin/users", {
      method: "POST",
      body: JSON.stringify({ user: userData }),
    });

    const data = await response.json();
    return data.user || data;
  }

  async getCoaches(): Promise<User[]> {
    const response = await this.makeAuthenticatedRequest("/admin/coaches");
    const data = await response.json();
    return data.coaches || data;
  }

  async getUsers(): Promise<User[]> {
    const response = await this.makeAuthenticatedRequest("/admin/users");
    const data = await response.json();
    return data.users || data;
  }
}

export default new AdminService();
