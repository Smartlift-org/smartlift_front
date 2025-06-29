import { apiClient } from "./apiClient";
import { AIRoutineRequest, AIRoutineResponse } from "../types/aiRoutines";

const aiRoutineService = {
  generateRoutines: async (
    request: AIRoutineRequest
  ): Promise<AIRoutineResponse[]> => {
    try {
      const response = await apiClient.post("/ai/generate_routines", request);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  saveGeneratedRoutines: async (
    routines: AIRoutineResponse[]
  ): Promise<any> => {
    try {
      const promises = routines.map((routine) =>
        apiClient.post("/routines", { routine: routine.routine })
      );

      return Promise.all(promises);
    } catch (error) {
      throw error;
    }
  },
};

export default aiRoutineService;
