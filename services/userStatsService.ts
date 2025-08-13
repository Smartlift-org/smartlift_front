import { AxiosError } from "axios";
import { apiClient } from "./apiClient";

export interface UserStats {
  id?: string;
  user_id?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  fitness_goal?: string;
  experience_level: string;
  available_days?: number;
  equipment_available?: boolean;
  activity_level: string;
  physical_limitations: string;
  created_at?: string;
  updated_at?: string;
}

export const GENDER_TO_BACKEND: { [key: string]: string } = {
  Hombre: "male",
  Mujer: "female",
  Otro: "other",
};

export const GENDER_TO_FRONTEND: { [key: string]: string } = {
  male: "Hombre",
  female: "Mujer",
  other: "Otro",
};

export const GENDER_OPTIONS = ["Hombre", "Mujer", "Otro"];

export const translateGenderToBackend = (frontendGender: string): string => {
  return GENDER_TO_BACKEND[frontendGender] || frontendGender;
};

export const translateGenderToFrontend = (backendGender: string): string => {
  return GENDER_TO_FRONTEND[backendGender] || backendGender;
};

const userStatsService = {
  getUserStats: async (): Promise<UserStats | null> => {
    try {
      const response = await apiClient.get("/user_stats");

      if (response.data && response.data.error) {
        return null;
      }

      if (response.data && response.data.gender) {
        response.data.gender = translateGenderToFrontend(response.data.gender);
      }

      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }

      return null;
    }
  },

  createUserStats: async (userStatsData: UserStats): Promise<UserStats> => {
    try {
      const dataToSend = { ...userStatsData };
      if (dataToSend.gender) {
        dataToSend.gender = translateGenderToBackend(dataToSend.gender);
      }

      const response = await apiClient.post("/user_stats", {
        user_stat: dataToSend,
      });

      if (response.data && response.data.gender) {
        response.data.gender = translateGenderToFrontend(response.data.gender);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserStats: async (userStatsData: UserStats): Promise<UserStats> => {
    try {
      const dataToSend = { ...userStatsData };
      if (dataToSend.gender) {
        dataToSend.gender = translateGenderToBackend(dataToSend.gender);
      }

      const requestPayload = {
        user_stat: dataToSend,
      };

      const response = await apiClient.put("/user_stats", requestPayload);

      if (response.data && response.data.gender) {
        response.data.gender = translateGenderToFrontend(response.data.gender);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  hasCompletedProfile: async (): Promise<boolean> => {
    try {
      const stats = await userStatsService.getUserStats();
      if (
        stats &&
        stats.experience_level &&
        stats.activity_level &&
        stats.physical_limitations
      ) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
};

export default userStatsService;
