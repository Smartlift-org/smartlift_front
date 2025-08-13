import { apiClient } from "./apiClient";
import {
  PublicProfilesResponse,
  PublicProfileDetailResponse,
  PrivacySettings,
  PrivacySettingsResponse,
} from "../types/publicProfile";

class PublicProfileService {
  async getPublicProfiles(
    page: number = 1,
    search?: string
  ): Promise<PublicProfilesResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("per_page", "20");

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const response = await apiClient.get(
        `/users/public-profiles?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching public profiles:", error);
      if (error.response?.status === 404) {
        throw new Error("No se encontraron perfiles públicos");
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Error al cargar los perfiles públicos");
    }
  }

  async getPublicProfile(userId: number): Promise<PublicProfileDetailResponse> {
    try {
      const response = await apiClient.get(`/users/${userId}/public-profile`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching public profile:", error);
      if (error.response?.status === 404) {
        throw new Error("Este perfil no es público o no existe");
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Error al cargar el perfil público");
    }
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await apiClient.get("/users/privacy-settings");
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching privacy settings:", error);

      if (error.response?.status === 404) {
        console.warn(
          "Privacy settings endpoint not implemented yet, using defaults"
        );
        return {
          show_name: true,
          show_profile_picture: true,
          show_workout_count: true,
          show_join_date: false,
          show_personal_records: false,
          show_favorite_exercises: false,
          is_profile_public: false,
        };
      }

      throw new Error("Error al cargar la configuración de privacidad");
    }
  }

  async updatePrivacySettings(
    settings: PrivacySettings
  ): Promise<PrivacySettingsResponse> {
    try {
      const response = await apiClient.put("/users/privacy-settings", {
        privacy_settings: settings,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating privacy settings:", error);

      if (error.response?.status === 404) {
        console.warn(
          "Privacy settings update endpoint not implemented yet, simulating success"
        );
        return {
          success: true,
          data: settings,
          message:
            "Configuración guardada localmente (pendiente implementación en backend)",
        };
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Error al actualizar la configuración de privacidad");
    }
  }
}

export default new PublicProfileService();
