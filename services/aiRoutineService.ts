import { apiClient } from "./apiClient";
import { AIRoutineRequest, AIRoutineResponse } from "../types/aiRoutines";

const aiRoutineService = {
  // Solicitar al backend que genere rutinas con IA
  generateRoutines: async (request: AIRoutineRequest): Promise<AIRoutineResponse[]> => {
    try {
      const response = await apiClient.post("/ai/generate_routines", request);
      return response.data;
    } catch (error) {
      console.error("Error generando rutinas con IA:", error);
      throw error;
    }
  },

  // Guardar las rutinas generadas en el backend
  saveGeneratedRoutines: async (routines: AIRoutineResponse[]): Promise<any> => {
    try {
      const promises = routines.map(routine => 
        apiClient.post("/routines", { routine: routine.routine })
      );
      
      return Promise.all(promises);
    } catch (error) {
      console.error("Error guardando rutinas generadas:", error);
      throw error;
    }
  }
};

export default aiRoutineService;
