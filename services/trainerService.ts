import { apiClient } from "./apiClient";
import type {
  PaginatedResponse,
  Member,
  TrainerDashboard,
  AvailableUser
} from "../types/declarations/trainer";

const trainerService = {
  getMembers: async (
    trainerId: string, 
    page: number = 1, 
    perPage: number = 20, 
    filters: { search?: string; status?: string } = {}
  ): Promise<PaginatedResponse<Member>> => {
    try {
      const response = await apiClient.get(`/api/v1/trainers/${trainerId}/members`, {
        params: {
          page,
          per_page: perPage,
          search: filters.search || "",
          status: filters.status || ""
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getDashboard(trainerId: string): Promise<TrainerDashboard> {
    try {
      const response = await apiClient.get(`/api/v1/trainers/${trainerId}/dashboard`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  assignMember: async (trainerId: string, userId: string) => {
    try {
      const response = await apiClient.post(`/api/v1/trainers/${trainerId}/members`, { user_id: userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  unassignMember: async (trainerId: string, userId: string) => {
    try {
      const response = await apiClient.delete(`/api/v1/trainers/${trainerId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMemberProfile: async (trainerId: string, memberId: string) => {
    try {
      const response = await apiClient.get(`/api/v1/trainers/${trainerId}/members/${memberId}`);
      
      const memberData = response.data.member_profile;
      
      return {
        id: memberData.id,
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        stats: {
          consistency_score: memberData.metrics?.active_streak || 0,
          recent_workouts: memberData.metrics?.recent_activity?.filter((day: {workout_count: number}) => day.workout_count > 0)?.length || 0,
          total_workouts: memberData.metrics?.total_workouts || 0,
          avg_workout_duration: 0,
          personal_records: memberData.personal_records?.length || 0,
          volume_lifted: 0,
          favorite_exercises: []
        },
        recent_activity: memberData.recent_workouts?.map((workout: {
          id: string;
          name?: string;
          status: string;
          duration: number;
          exercises_count: number;
          created_at: string;
          completed_at?: string;
        }) => ({
          id: workout.id,
          type: workout.name || 'Entrenamiento',
          status: workout.status,
          duration: workout.duration,
          exercises_count: workout.exercises_count,
          created_at: workout.created_at,
          completed_at: workout.completed_at
        })) || []
      };
    } catch (error) {
      throw error;
    }
  },

  getMemberActivity: async (trainerId: string, memberId: string, page: number = 1, perPage: number = 10) => {
    try {
      const response = await apiClient.get(`/api/v1/trainers/${trainerId}/members/${memberId}/activity`, {
        params: {
          page,
          per_page: perPage
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAvailableUsers: async (
    trainerId: string,
    page: number = 1,
    perPage: number = 20,
    search: string = ""
  ): Promise<PaginatedResponse<AvailableUser>> => {
    try {
      const response = await apiClient.get(`/api/v1/trainers/${trainerId}/available_users`, {
        params: {
          page,
          per_page: perPage,
          search
        }
      });
      
      return {
        members: response.data.available_users || [],
        meta: response.data.pagination || {}
      };
    } catch (error) {
      throw error;
    }
  }
};

export default trainerService;
