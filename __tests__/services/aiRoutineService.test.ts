import aiRoutineService from '../../services/aiRoutineService';
import { apiClient } from '../../services/apiClient';

// Mock dependencies
jest.mock('../../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AIRoutineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRoutines', () => {
    it('should generate AI routines successfully', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'muscle_gain',
        preferences: 'dumbbells, barbell, chest, back'
      };
      const mockRoutines = [
        {
          descripcion: 'Rutina generada por IA',
          routine: {
            name: 'Rutina IA - Principiante',
            description: 'Rutina generada por IA para principiantes',
            difficulty: 'beginner' as const,
            duration: 45,
            source_type: 'ai_generated' as const,
            validation_status: 'pending' as const,
            routine_exercises_attributes: [
              {
                exercise_id: 1,
                sets: 3,
                reps: 12,
                rest_time: 60,
                order: 1
              }
            ]
          }
        }
      ];
      const mockResponse = { 
        data: { 
          success: true, 
          data: { 
            routines: mockRoutines 
          } 
        } 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await aiRoutineService.generateRoutines(routineParams);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/workout_routines', routineParams);
      expect(result).toEqual(mockRoutines);
    });

    it('should handle AI generation failure', async () => {
      // Arrange
      const routineParams = {
        age: 30,
        gender: 'female' as const,
        weight: 60,
        height: 165,
        experience_level: 'intermediate' as const,
        frequency_per_week: 4,
        time_per_session: 30,
        goal: 'weight_loss'
      };
      const error = new Error('Error de conexión. Verifica tu internet.');
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams)).rejects.toThrow('Error de conexión. Verifica tu internet.');
    });

    it('should handle invalid parameters', async () => {
      // Arrange
      const invalidParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: -1,
        time_per_session: -10,
        goal: 'invalid_goal'
      };
      const validationError = { 
        response: { 
          status: 422, 
          data: { errors: ['Invalid fitness goal', 'Invalid time'] } 
        } 
      };
      mockApiClient.post.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(invalidParams)).rejects.toThrow('Error en la respuesta de IA. Intenta nuevamente.');
    });
  });

  describe('saveGeneratedRoutines', () => {
    it('should save generated routines successfully', async () => {
      // Arrange
      const mockRoutines = [
        {
          descripcion: 'Rutina para tren superior',
          routine: {
            name: 'Rutina IA - Upper Body',
            description: 'Rutina para tren superior',
            difficulty: 'intermediate' as const,
            duration: 45,
            source_type: 'ai_generated' as const,
            validation_status: 'pending' as const,
            exercises: [
              {
                exercise_id: 1,
                sets: 3,
                reps: 12,
                rest_time: 60,
                order: 1
              }
            ]
          }
        }
      ];
      const mockResponse = { data: { id: 1, name: 'Rutina IA - Upper Body' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await aiRoutineService.saveGeneratedRoutines(mockRoutines as any);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/routines', {
        routine: {
          name: 'Rutina IA - Upper Body',
          description: 'Rutina para tren superior',
          difficulty: 'intermediate',
          duration: 45,
          source_type: 'ai_generated',
          validation_status: 'pending',
          routine_exercises_attributes: [
            {
              exercise_id: 1,
              sets: 3,
              reps: 12,
              rest_time: 60,
              order: 1
            }
          ]
        }
      });
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle save failures', async () => {
      // Arrange
      const mockRoutines = [
        {
          descripcion: 'Rutina que fallará',
          routine: {
            name: 'Rutina IA - Failed',
            description: 'Rutina que fallará',
            difficulty: 'beginner' as const,
            duration: 30,
            source_type: 'ai_generated' as const,
            validation_status: 'pending' as const,
            routine_exercises_attributes: []
          }
        }
      ];
      const error = new Error('Save failed');
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act
      const result = await aiRoutineService.saveGeneratedRoutines(mockRoutines);

      // Assert
      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.results[0].success).toBe(false);
    });

    it('should handle routine without exercises', async () => {
      // Arrange
      const mockRoutines = [
        {
          descripcion: 'Rutina sin ejercicios',
          routine: {
            name: 'Rutina IA - No Exercises',
            description: 'Rutina sin ejercicios',
            difficulty: 'beginner' as const,
            duration: 30,
            source_type: 'ai_generated' as const,
            validation_status: 'pending' as const
            // No exercises field
          }
        }
      ];
      const mockResponse = { data: { id: 1, name: 'Rutina IA - No Exercises' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await aiRoutineService.saveGeneratedRoutines(mockRoutines as any);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/routines', {
        routine: {
          name: 'Rutina IA - No Exercises',
          description: 'Rutina sin ejercicios',
          difficulty: 'beginner',
          duration: 30,
          source_type: 'ai_generated',
          validation_status: 'pending',
          routine_exercises_attributes: []
        }
      });
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle exercises with missing rest_time and order', async () => {
      // Arrange
      const mockRoutines = [
        {
          descripcion: 'Rutina con ejercicios incompletos',
          routine: {
            name: 'Rutina IA - Incomplete Exercises',
            description: 'Rutina con ejercicios incompletos',
            difficulty: 'beginner' as const,
            duration: 30,
            source_type: 'ai_generated' as const,
            validation_status: 'pending' as const,
            exercises: [
              {
                exercise_id: 1,
                sets: 3,
                reps: 12
                // Missing rest_time and order
              },
              {
                exercise_id: 2,
                sets: 3,
                reps: 10,
                rest_time: 0, // Falsy rest_time
                order: 0 // Falsy order
              }
            ]
          }
        }
      ];
      const mockResponse = { data: { id: 1, name: 'Rutina IA - Incomplete Exercises' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await aiRoutineService.saveGeneratedRoutines(mockRoutines as any);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/routines', {
        routine: {
          name: 'Rutina IA - Incomplete Exercises',
          description: 'Rutina con ejercicios incompletos',
          difficulty: 'beginner',
          duration: 30,
          source_type: 'ai_generated',
          validation_status: 'pending',
          routine_exercises_attributes: [
            {
              exercise_id: 1,
              sets: 3,
              reps: 12,
              rest_time: 0, // Default value
              order: 1 // Default value
            },
            {
              exercise_id: 2,
              sets: 3,
              reps: 10,
              rest_time: 0, // Falsy becomes 0
              order: 1 // Falsy becomes 1
            }
          ]
        }
      });
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle save error with response data', async () => {
      // Arrange
      const mockRoutines = [
        {
          descripcion: 'Rutina que fallará',
          routine: {
            name: 'Rutina IA - Failed',
            description: 'Rutina que fallará',
            difficulty: 'beginner' as const,
            duration: 30,
            exercises: []
          }
        }
      ];
      const error = {
        response: {
          data: { error: 'Validation failed', details: ['Name is required'] }
        },
        message: 'Request failed'
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act
      const result = await aiRoutineService.saveGeneratedRoutines(mockRoutines as any);

      // Assert
      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toEqual(error.response.data);
    });
  });

  describe('generateAndSaveRoutines', () => {
    it('should generate and save routines successfully', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'muscle_gain'
      };
      const mockRoutines = [
        {
          descripcion: 'Rutina completa generada',
          routine: {
            name: 'Rutina IA - Complete',
            description: 'Rutina completa generada',
            difficulty: 'beginner' as const,
            duration: 45,
            source_type: 'ai_generated' as const,
            validation_status: 'pending' as const,
            routine_exercises_attributes: []
          }
        }
      ];
      const mockGenerateResponse = { 
        data: { 
          success: true, 
          data: { 
            routines: mockRoutines 
          } 
        } 
      };
      const mockSaveResponse = { data: { id: 1, name: 'Rutina IA - Complete' } };
      
      mockApiClient.post
        .mockResolvedValueOnce(mockGenerateResponse)
        .mockResolvedValueOnce(mockSaveResponse);

      // Act
      const result = await aiRoutineService.generateAndSaveRoutines(routineParams);

      // Assert
      expect(result.routines).toEqual(mockRoutines);
      expect(result.savedResults.success).toBe(1);
      expect(result.savedResults.failed).toBe(0);
    });

    it('should handle generation failure in combined method', async () => {
      // Arrange
      const routineParams = {
        age: 30,
        gender: 'female' as const,
        weight: 60,
        height: 165,
        experience_level: 'intermediate' as const,
        frequency_per_week: 4,
        time_per_session: 30,
        goal: 'weight_loss'
      };
      const error = new Error('Generation failed');
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateAndSaveRoutines(routineParams)).rejects.toThrow('Generation failed');
    });
  });

  describe('error handling', () => {
    it('should handle 400 Bad Request with details', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'invalid'
      };
      const error = {
        response: {
          status: 400,
          data: {
            details: {
              goal: ['debe ser un objetivo válido'],
              time_per_session: ['debe ser mayor a 15 minutos']
            }
          }
        }
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Datos inválidos:\ngoal: debe ser un objetivo válido\ntime_per_session: debe ser mayor a 15 minutos');
    });

    it('should handle 503 Service Unavailable', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'muscle_gain'
      };
      const error = {
        response: {
          status: 503,
          data: {}
        }
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Servicio de IA temporalmente no disponible. Intenta más tarde.');
    });

    it('should handle 500 Internal Server Error', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'muscle_gain'
      };
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Error interno del servidor. Intenta más tarde.');
    });

    it('should handle response with success false', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'muscle_gain'
      };
      const mockResponse = { 
        data: { 
          success: false, 
          data: { routines: [] } 
        } 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Respuesta inválida del servidor');
    });

    it('should handle response without routines data', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'muscle_gain'
      };
      const mockResponse = { 
        data: { 
          success: true, 
          data: {} 
        } 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Respuesta inválida del servidor');
    });

    it('should handle 400 error without details', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'invalid'
      };
      const error = {
        response: {
          status: 400,
          data: {} // No details field
        }
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Verifica que todos los campos estén correctos');
    });

    it('should handle 400 error with non-array field errors', async () => {
      // Arrange
      const routineParams = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        experience_level: 'beginner' as const,
        frequency_per_week: 3,
        time_per_session: 45,
        goal: 'invalid'
      };
      const error = {
        response: {
          status: 400,
          data: {
            details: {
              goal: 'debe ser un objetivo válido', // String instead of array
              age: ['debe ser mayor a 0']
            }
          }
        }
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(aiRoutineService.generateRoutines(routineParams))
        .rejects.toThrow('Datos inválidos:\nage: debe ser mayor a 0');
    });
  });
});
