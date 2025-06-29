import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const userStatsService = {
  getUserStats: async (): Promise<UserStats | null> => {
    try {
      const response = await apiClient.get("/user_stats");
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
      const response = await apiClient.post("/user_stats", {
        user_stat: userStatsData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserStats: async (userStatsData: UserStats): Promise<UserStats> => {
    try {
      const response = await apiClient.put("/user_stats", {
        user_stat: userStatsData,
      });
      return response.data;
    } catch (error) {
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
