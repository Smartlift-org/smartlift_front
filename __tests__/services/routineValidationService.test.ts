import routineValidationService from '../../services/routineValidationService';
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

describe('RoutineValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPendingRoutines', () => {
    it('should fetch pending routines successfully', async () => {
      // Arrange
      const mockRoutines = [
        {
          id: 1,
          routine_id: 1,
          status: 'pending_validation',
          user: { id: 1, first_name: 'Juan', last_name: 'Pérez' },
          routine: {
            id: 1,
            name: 'Rutina AI Generada',
            description: 'Rutina generada por IA',
            difficulty: 'beginner',
            duration: 45
          }
        }
      ];
      const mockResponse = { 
        data: { 
          success: true, 
          data: { routines: mockRoutines } 
        } 
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineValidationService.getPendingRoutines();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/routine_validations');
      expect(result).toEqual(mockRoutines);
    });

    it('should handle empty pending routines list', async () => {
      // Arrange
      const mockResponse = { 
        data: { 
          success: true, 
          data: { routines: [] } 
        } 
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineValidationService.getPendingRoutines();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle 403 forbidden error', async () => {
      // Arrange
      const error = { response: { status: 403 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.getPendingRoutines()).rejects.toThrow('Acceso denegado. Solo los entrenadores pueden validar rutinas.');
    });

    it('should handle 401 unauthorized error', async () => {
      // Arrange
      const error = { response: { status: 401 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.getPendingRoutines()).rejects.toThrow('No hay token de autenticación');
    });

    it('should handle invalid server response', async () => {
      // Arrange
      const mockResponse = { data: { success: false } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(routineValidationService.getPendingRoutines()).rejects.toThrow('Respuesta inválida del servidor');
    });
  });

  describe('getRoutineDetails', () => {
    it('should fetch routine validation details successfully', async () => {
      // Arrange
      const validationId = 1;
      const mockValidation = {
        id: validationId,
        routine_id: 1,
        status: 'pending_validation',
        user: { id: 1, first_name: 'Juan', last_name: 'Pérez' },
        routine: {
          id: 1,
          name: 'Rutina AI Generada',
          description: 'Rutina generada por IA',
          difficulty: 'beginner',
          duration: 45,
          routine_exercises: [
            {
              id: 1,
              exercise: { id: 1, name: 'Push ups' },
              sets: 3,
              reps: 12,
              rest_time: 60
            }
          ]
        }
      };
      const mockResponse = { 
        data: { 
          success: true, 
          data: { routine: mockValidation } 
        } 
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineValidationService.getRoutineDetails(validationId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/routine_validations/${validationId}`);
      expect(result).toEqual(mockValidation);
    });

    it('should handle routine validation not found', async () => {
      // Arrange
      const validationId = 999;
      const error = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.getRoutineDetails(validationId)).rejects.toThrow('Rutina no encontrada o no es una rutina generada por IA');
    });

    it('should handle 403 forbidden error', async () => {
      // Arrange
      const validationId = 1;
      const error = { response: { status: 403 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.getRoutineDetails(validationId)).rejects.toThrow('Acceso denegado. Solo los entrenadores pueden validar rutinas.');
    });

    it('should handle invalid server response', async () => {
      // Arrange
      const validationId = 1;
      const mockResponse = { data: { success: false } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(routineValidationService.getRoutineDetails(validationId)).rejects.toThrow('Respuesta inválida del servidor');
    });
  });

  describe('approveRoutine', () => {
    it('should approve routine successfully', async () => {
      // Arrange
      const validationId = 1;
      const notes = 'Rutina aprobada sin cambios';
      const mockResponse = { 
        data: { 
          success: true
        } 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      await routineValidationService.approveRoutine(validationId, notes);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/routine_validations/${validationId}/approve`,
        { notes: notes }
      );
    });

    it('should approve routine without notes', async () => {
      // Arrange
      const validationId = 1;
      const mockResponse = { 
        data: { 
          success: true
        } 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      await routineValidationService.approveRoutine(validationId);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/routine_validations/${validationId}/approve`,
        { notes: undefined }
      );
    });

    it('should handle already validated routine', async () => {
      // Arrange
      const validationId = 1;
      const error = { response: { status: 422 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.approveRoutine(validationId)).rejects.toThrow('Esta rutina ya ha sido validada');
    });

    it('should handle 403 forbidden error', async () => {
      // Arrange
      const validationId = 1;
      const error = { response: { status: 403 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.approveRoutine(validationId)).rejects.toThrow('Acceso denegado. Solo los entrenadores pueden validar rutinas.');
    });

    it('should handle failed response', async () => {
      // Arrange
      const validationId = 1;
      const mockResponse = { data: { success: false, error: 'Error al aprobar' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(routineValidationService.approveRoutine(validationId)).rejects.toThrow('Error al aprobar');
    });
  });

  describe('rejectRoutine', () => {
    it('should reject routine successfully', async () => {
      // Arrange
      const validationId = 1;
      const reason = 'Ejercicios no apropiados para el nivel del usuario';
      const mockResponse = { 
        data: { 
          success: true
        } 
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      await routineValidationService.rejectRoutine(validationId, reason);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/routine_validations/${validationId}/reject`,
        { notes: reason.trim() }
      );
    });

    it('should handle empty notes', async () => {
      // Arrange
      const validationId = 1;
      const emptyNotes = '';

      // Act & Assert
      await expect(routineValidationService.rejectRoutine(validationId, emptyNotes)).rejects.toThrow('Las notas de rechazo son obligatorias');
    });

    it('should handle whitespace-only notes', async () => {
      // Arrange
      const validationId = 1;
      const whitespaceNotes = '   ';

      // Act & Assert
      await expect(routineValidationService.rejectRoutine(validationId, whitespaceNotes)).rejects.toThrow('Las notas de rechazo son obligatorias');
    });

    it('should handle 422 already validated', async () => {
      // Arrange
      const validationId = 1;
      const notes = 'Valid notes';
      const error = { response: { status: 422 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.rejectRoutine(validationId, notes)).rejects.toThrow('Esta rutina ya ha sido validada');
    });

    it('should handle 403 forbidden error', async () => {
      // Arrange
      const validationId = 1;
      const notes = 'Valid notes';
      const error = { response: { status: 403 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(routineValidationService.rejectRoutine(validationId, notes)).rejects.toThrow('Acceso denegado. Solo los entrenadores pueden validar rutinas.');
    });

    it('should handle failed response', async () => {
      // Arrange
      const validationId = 1;
      const notes = 'Valid notes';
      const mockResponse = { data: { success: false, error: 'Error al rechazar' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(routineValidationService.rejectRoutine(validationId, notes)).rejects.toThrow('Error al rechazar');
    });
  });

  describe('editRoutine', () => {
    it('should edit routine successfully', async () => {
      // Arrange
      const validationId = 1;
      const routineData = {
        name: 'Rutina Modificada',
        description: 'Rutina ajustada por entrenador',
        difficulty: 'intermediate' as const,
        duration: 50,
        routine_exercises_attributes: [
          {
            id: 1,
            exercise_id: 1,
            sets: 4,
            reps: 10,
            rest_time: 90,
            order: 1
          }
        ]
      };
      const mockResponse = { 
        data: { 
          success: true,
          data: { routine: { ...routineData, id: 1 } }
        } 
      };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineValidationService.editRoutine(validationId, routineData);

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/routine_validations/${validationId}/edit`,
        routineData
      );
      expect(result).toEqual({ ...routineData, id: 1 });
    });

    it('should edit routine with auto-validation', async () => {
      // Arrange
      const validationId = 1;
      const routineData = {
        name: 'Rutina Auto-Validada',
        description: 'Rutina editada y aprobada automáticamente',
        difficulty: 'advanced' as const,
        duration: 60,
        auto_validate: true,
        validation_notes: 'Rutina editada y aprobada por el entrenador'
      };
      const mockResponse = { 
        data: { 
          success: true,
          data: { routine: { ...routineData, id: 1 } }
        } 
      };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineValidationService.editRoutine(validationId, routineData);

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/routine_validations/${validationId}/edit`,
        routineData
      );
      expect(result).toEqual({ ...routineData, id: 1 });
    });

    it('should handle 422 non-pending routine', async () => {
      // Arrange
      const validationId = 1;
      const routineData = { name: 'Test' };
      const error = { response: { status: 422 } };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineValidationService.editRoutine(validationId, routineData)
      ).rejects.toThrow('Solo se pueden editar rutinas pendientes de validación');
    });

    it('should handle 400 invalid data with details', async () => {
      // Arrange
      const validationId = 1;
      const invalidData = { name: '' };
      const error = { 
        response: { 
          status: 400, 
          data: { details: ['Name cannot be blank', 'Duration must be positive'] } 
        } 
      };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineValidationService.editRoutine(validationId, invalidData)
      ).rejects.toThrow('Datos inválidos: Name cannot be blank, Duration must be positive');
    });

    it('should handle 400 without details', async () => {
      // Arrange
      const validationId = 1;
      const invalidData = { name: '' };
      const error = { response: { status: 400 } };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineValidationService.editRoutine(validationId, invalidData)
      ).rejects.toThrow('Datos de edición inválidos');
    });

    it('should handle 403 forbidden error', async () => {
      // Arrange
      const validationId = 1;
      const routineData = { name: 'Test' };
      const error = { response: { status: 403 } };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineValidationService.editRoutine(validationId, routineData)
      ).rejects.toThrow('Acceso denegado. Solo los entrenadores pueden editar rutinas.');
    });

    it('should handle 404 routine not found', async () => {
      // Arrange
      const validationId = 999;
      const routineData = { name: 'Test' };
      const error = { response: { status: 404 } };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineValidationService.editRoutine(validationId, routineData)
      ).rejects.toThrow('Rutina no encontrada');
    });

    it('should handle failed response', async () => {
      // Arrange
      const validationId = 1;
      const routineData = { name: 'Test' };
      const mockResponse = { data: { success: false, error: 'Error al editar' } };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        routineValidationService.editRoutine(validationId, routineData)
      ).rejects.toThrow('Error al editar');
    });
  });
});
