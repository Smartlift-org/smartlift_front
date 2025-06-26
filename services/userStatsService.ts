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
  experience_level: string;  // Required field
  available_days?: number;
  equipment_available?: boolean;
  activity_level: string;    // Required field
  physical_limitations: string; // Required field
  created_at?: string;
  updated_at?: string;
}

const userStatsService = {
  getUserStats: async (): Promise<UserStats | null> => {
    try {
      const response = await apiClient.get("/user_stats");
      return response.data;
    } catch (error) {
      // If 404, the user hasn't completed their profile yet
      if ((error as AxiosError).response?.status === 404) {
        console.log("User has not completed profile yet");
        return null;
      }

      console.error(
        "Get user stats error:",
        (error as AxiosError).response?.data || (error as Error).message
      );
      
      // For any other errors, we'll also return null to indicate the profile isn't complete
      // But we'll log the error for debugging
      return null;
    }
  },

  createUserStats: async (userStatsData: UserStats): Promise<UserStats> => {
    try {
      const response = await apiClient.post("/user_stats", { user_stat: userStatsData });
      return response.data;
    } catch (error) {
      console.error(
        "Create user stats error:",
        (error as AxiosError).response?.data || (error as Error).message
      );
      throw error;
    }
  },

  updateUserStats: async (userStatsData: UserStats): Promise<UserStats> => {
    try {
      const response = await apiClient.put("/user_stats", { user_stat: userStatsData });
      return response.data;
    } catch (error) {
      console.error(
        "Update user stats error:",
        (error as AxiosError).response?.data || (error as Error).message
      );
      throw error;
    }
  },

  hasCompletedProfile: async (): Promise<boolean> => {
    try {
      const stats = await userStatsService.getUserStats();
      // Check if stats exists and has all required fields
      if (stats && 
          stats.experience_level && 
          stats.activity_level && 
          stats.physical_limitations) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Profile check error:", error);
      return false;
    }
  }
};

export default userStatsService;
