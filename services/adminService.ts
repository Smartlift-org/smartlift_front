import { apiClient, TOKEN_KEY, USER_KEY } from "./apiClient";
import type { User } from "../types/index";

interface AdminRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "coach" | "user";
}

class AdminService {
  private async makeAuthenticatedRequest(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<any> {
    try {
      let response;
      if (method === "GET") {
        response = await apiClient.get(endpoint);
      } else if (method === "POST") {
        response = await apiClient.post(endpoint, data);
      } else if (method === "PUT") {
        response = await apiClient.put(endpoint, data);
      } else if (method === "PATCH") {
        response = await (apiClient as any).patch(endpoint, data);
      } else if (method === "DELETE") {
        response = await apiClient.delete(endpoint);
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          "Error en la solicitud";

        if (status === 401) {
          throw new Error("No autorizado. Por favor inicia sesión nuevamente.");
        } else if (status === 403) {
          throw new Error(
            "Acceso denegado. Solo administradores pueden realizar esta acción."
          );
        } else if (status === 404) {
          throw new Error(
            "Recurso no encontrado. Verifica que el backend esté funcionando correctamente."
          );
        } else {
          throw new Error(errorMessage);
        }
      } else {
        throw new Error("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  }

  async registerUser(userData: AdminRegisterData): Promise<User> {
    const data = await this.makeAuthenticatedRequest("/admin/users", "POST", {
      user: userData,
    });
    return data.user || data;
  }

  async getCoaches(): Promise<User[]> {
    try {
      const data = await this.makeAuthenticatedRequest("/admin/coaches");

      let coaches: User[] = [];
      if (Array.isArray(data)) {
        coaches = data;
      } else if (data && Array.isArray(data.coaches)) {
        coaches = data.coaches;
      } else if (data && Array.isArray(data.data)) {
        coaches = data.data;
      } else {
        return [];
      }

      return coaches.map((coach) => ({ ...coach, role: "coach" as const }));
    } catch (error) {
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const data = await this.makeAuthenticatedRequest("/admin/users");

      let users: User[] = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data && Array.isArray(data.users)) {
        users = data.users;
      } else if (data && Array.isArray(data.data)) {
        users = data.data;
      } else {
        return [];
      }

      return users.map((user) => ({ ...user, role: "user" as const }));
    } catch (error) {
      throw error;
    }
  }

  async getCoachDetails(
    coachId: string
  ): Promise<{ coach: User; assignedUsers: User[] }> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/admin/coaches/${coachId}`
      );
      return {
        coach: { ...data.coach, role: "coach" as const },
        assignedUsers:
          data.assigned_users?.map((user: User) => ({
            ...user,
            role: "user" as const,
          })) || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<User> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/admin/users/${userId}`
      );
      return { ...data, role: data.role || ("user" as const) };
    } catch (error) {
      throw error;
    }
  }

  async updateCoach(coachId: string, userData: Partial<User>): Promise<User> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/admin/coaches/${coachId}`,
        "PATCH",
        { user: userData }
      );
      return { ...data, role: "coach" as const };
    } catch (error: any) {
      if (
        error.message === "Network request failed" ||
        error.message.includes("conexión")
      ) {
        throw new Error(
          "Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible."
        );
      }
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/admin/users/${userId}`,
        "PATCH",
        { user: userData }
      );
      return { ...data, role: data.role || ("user" as const) };
    } catch (error) {
      throw error;
    }
  }

  async getAvailableUsers(): Promise<User[]> {
    try {
      const data = await this.makeAuthenticatedRequest(
        "/admin/available-users"
      );

      let users: User[] = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data && Array.isArray(data.users)) {
        users = data.users;
      } else if (data && Array.isArray(data.data)) {
        users = data.data;
      } else {
        return [];
      }

      return users.map((user) => ({ ...user, role: "user" as const }));
    } catch (error) {
      throw error;
    }
  }

  async assignUsersToCoach(
    coachId: string,
    userIds: string[]
  ): Promise<{ coach: User; assignedUsers: User[] }> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/admin/coaches/${coachId}/assign-users`,
        "POST",
        { user_ids: userIds }
      );
      return {
        coach: { ...data.coach, role: "coach" as const },
        assignedUsers:
          data.assigned_users?.map((user: User) => ({
            ...user,
            role: "user" as const,
          })) || [],
      };
    } catch (error) {
      throw error;
    }
  }

  async unassignUserFromCoach(coachId: string, userId: string): Promise<void> {
    try {
      await this.makeAuthenticatedRequest(
        `/admin/coaches/${coachId}/users/${userId}`,
        "DELETE"
      );
    } catch (error) {
      throw error;
    }
  }

  async deactivateCoach(
    coachId: string
  ): Promise<{ message: string; unassignedUsersCount: number }> {
    try {
      const data = await this.makeAuthenticatedRequest(
        `/admin/coaches/${coachId}`,
        "DELETE"
      );
      return {
        message: data.message || "Entrenador desactivado exitosamente",
        unassignedUsersCount: data.unassigned_users_count || 0,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();
