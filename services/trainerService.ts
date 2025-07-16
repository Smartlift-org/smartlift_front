import { apiClient } from "./apiClient";
import type {
  PaginatedResponse,
  Member,
  TrainerDashboard,
  AvailableUser,
  TrainerRoutine,
  PaginatedRoutinesResponse
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
      const data = response.data;
      
      // Mapear los datos anidados a los campos de nivel superior que espera el componente
      return {
        ...data,
        // Campos a nivel superior que necesita el componente
        total_members_count: data.dashboard?.overview?.total_members || 0,
        active_members_count: data.dashboard?.overview?.active_members || 0,
        total_workouts_count: data.dashboard?.overview?.total_workouts || 0,
        avg_member_consistency: data.dashboard?.overview?.activity_rate || 0
      };
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
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
      
      // El nuevo controlador devuelve los datos directamente en la raíz
      const memberData = response.data;
      
      return {
        id: memberData.id,
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        stats: {
          consistency_score: memberData.stats?.consistency_score || 0,
          recent_workouts: memberData.stats?.recent_workouts || 0,
          total_workouts: memberData.stats?.total_workouts || 0,
          avg_workout_duration: memberData.stats?.avg_workout_duration || 0,
          personal_records: memberData.stats?.personal_records || 0,
          favorite_exercises: memberData.stats?.favorite_exercises || []
        },
        recent_activity: memberData.recent_activity || []
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
  },
  
  getRoutines: async (
    trainerId: string,
    page: number = 1,
    perPage: number = 20,
    difficulty?: string
  ): Promise<PaginatedRoutinesResponse> => {
    try {
      const response = await apiClient.get(`/api/v1/trainers/${trainerId}/routines`, {
        params: {
          page,
          per_page: perPage,
          difficulty: difficulty || ""
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  assignRoutine: async (
    trainerId: string, 
    userId: string, 
    routineId: string, 
    customName?: string
  ): Promise<TrainerRoutine> => {
    try {
      const response = await apiClient.post(
        `/api/v1/trainers/${trainerId}/members/${userId}/assign_routine`, 
        { 
          routine_id: routineId,
          custom_name: customName 
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getMemberRoutines: async (
    trainerId: string,
    memberId: string,
    page: number = 1,
    perPage: number = 10
  ) => {
    try {
      // Usamos la ruta del nuevo controlador que tiene formato similar
      const response = await apiClient.get(
        `/api/v1/trainers/${trainerId}/members/${memberId}/routines`,
        {
          params: {
            page,
            per_page: perPage
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteMemberRoutine: async (
    trainerId: string,
    memberId: string,
    routineId: string
  ) => {
    try {
      const response = await apiClient.delete(
        `/api/v1/trainers/${trainerId}/members/${memberId}/routines/${routineId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateMemberRoutine: async (
    trainerId: string,
    memberId: string,
    routineId: string,
    routineData: any
  ) => {
    try {
      const response = await apiClient.put(
        `/api/v1/trainers/${trainerId}/members/${memberId}/routines/${routineId}`,
        { routine: routineData }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default trainerService;
