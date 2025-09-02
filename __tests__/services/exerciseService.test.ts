import exerciseService, { ExerciseFormData } from '../../services/exerciseService';
import { apiClient } from '../../services/apiClient';
import { Exercise } from '../../types/exercise';

// Skip @env mock for now

// Declare mockApiClient after import
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock dependencies
jest.mock('../../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('ExerciseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExercises', () => {
    it('should fetch exercises successfully', async () => {
      // Arrange
      const mockExercises = [
        {
          id: 1,
          name: 'Push-ups',
          muscle_group: 'chest',
          equipment: 'body weight',
          description: 'Classic push-up exercise',
          instructions: ['Get in push-up position', 'Lower body', 'Push back up'],
        }
      ];
      const mockResponse = { data: mockExercises };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.getExercises();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/exercises');
      expect(result).toEqual(mockExercises);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('muscle_group');
    });

    it('should handle exercises in nested structure', async () => {
      // Arrange
      const mockExercises = [
        {
          id: 1,
          name: 'Push-ups',
          muscle_group: 'chest',
          equipment: 'body weight',
          description: 'Classic push-up exercise',
          instructions: ['Get in push-up position'],
        },
      ];
      const mockResponse = { data: { exercises: mockExercises } };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.getExercises();

      // Assert
      expect(result).toEqual(mockExercises);
    });


    it('should return empty array when no exercises found', async () => {
      // Arrange
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.getExercises();

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw auth error on 401', async () => {
      // Arrange
      const authError = { response: { status: 401 } };
      mockApiClient.get.mockRejectedValueOnce(authError);

      // Act & Assert
      await expect(exerciseService.getExercises()).rejects.toThrow('No hay token de autenticación');
    });

    it('should throw not found error on 404', async () => {
      // Arrange
      const notFoundError = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(exerciseService.getExercises()).rejects.toThrow('No se encontraron ejercicios');
    });

    it('should throw error on API failure', async () => {
      // Arrange
      const serverError = { response: { status: 500 } };
      mockApiClient.get.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(exerciseService.getExercises()).rejects.toThrow();
    });
  });

  describe('getExercise', () => {
    it('should fetch exercise by ID successfully', async () => {
      // Arrange
      const exerciseId = 1;
      const exerciseData = { 
        id: 1, 
        name: 'Push Up', 
        muscle_group: 'Chest', 
        equipment: 'Body Weight' 
      };
      const mockResponse = { data: exerciseData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.getExercise(exerciseId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/exercises/${exerciseId}`);
      expect(result).toEqual(exerciseData);
    });

    it('should throw error when exercise not found', async () => {
      // Arrange
      const exerciseId = 999;
      const notFoundError = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(exerciseService.getExercise(exerciseId)).rejects.toThrow('Ejercicio no encontrado');
    });

    it('should throw generic error on server error', async () => {
      // Arrange
      const exerciseId = 1;
      const serverError = { response: { status: 500, data: { error: 'Server error' } } };
      mockApiClient.get.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(exerciseService.getExercise(exerciseId)).rejects.toThrow('Server error');
    });
  });

  // searchExercises method does not exist in the real service - removed these tests
  describe('createExercise', () => {
    it('should create exercise successfully', async () => {
      // Arrange
      const exerciseData: ExerciseFormData = {
        name: 'New Exercise',
        equipment: 'dumbbell',
        category: 'strength',
        difficulty: 'intermediate',
        primary_muscles: ['chest', 'triceps'],
        image_urls: ['https://example.com/image1.jpg']
      };
      const createdExercise = { 
        id: 5, 
        ...exerciseData,
        created_at: '2024-01-15T12:00:00.000Z' 
      };
      const mockResponse = { data: createdExercise };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.createExercise(exerciseData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/exercises', { exercise: exerciseData });
      expect(result).toEqual(createdExercise);
    });

    it('should handle validation errors on create', async () => {
      // Arrange
      const invalidData: ExerciseFormData = {
        name: '',
        equipment: '',
        category: '',
        difficulty: '',
        primary_muscles: [],
        image_urls: []
      };
      const validationError = { response: { status: 400, data: { error: 'Validation failed' } } };
      mockApiClient.post.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.createExercise(invalidData)).rejects.toThrow();
    });

    it('should throw auth error on 401 for create', async () => {
      // Arrange
      const exerciseData: ExerciseFormData = {
        name: 'New Exercise',
        equipment: 'dumbbell',
        category: 'strength',
        difficulty: 'intermediate',
        primary_muscles: ['chest'],
        image_urls: []
      };
      const authError = { response: { status: 401 } };
      mockApiClient.post.mockRejectedValueOnce(authError);

      // Act & Assert
      await expect(exerciseService.createExercise(exerciseData)).rejects.toThrow('No tienes permisos para crear ejercicios');
    });

    it('should handle 422 validation errors with error array', async () => {
      // Arrange
      const exerciseData: ExerciseFormData = {
        name: '',
        equipment: '',
        category: 'invalid',
        difficulty: 'invalid',
        primary_muscles: [],
        image_urls: []
      };
      const validationError = { response: { status: 422, data: { errors: ['Name is required', 'Equipment is required'] } } };
      mockApiClient.post.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.createExercise(exerciseData)).rejects.toThrow('Error de validación: Name is required, Equipment is required');
    });

    it('should handle 422 validation errors without error array', async () => {
      // Arrange
      const exerciseData: ExerciseFormData = {
        name: '',
        equipment: '',
        category: '',
        difficulty: '',
        primary_muscles: [],
        image_urls: []
      };
      const validationError = { response: { status: 422, data: {} } };
      mockApiClient.post.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.createExercise(exerciseData)).rejects.toThrow('Datos de ejercicio inválidos');
    });
  });

  describe('updateExercise', () => {
    it('should update exercise successfully', async () => {
      // Arrange
      const exerciseId = 1;
      const updateData: Partial<ExerciseFormData> = {
        name: 'Updated Exercise',
        difficulty: 'advanced'
      };
      const updatedExercise = { 
        id: exerciseId, 
        ...updateData,
        updated_at: '2024-01-15T12:30:00.000Z' 
      };
      const mockResponse = { data: updatedExercise };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.updateExercise(exerciseId, updateData);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(`/exercises/${exerciseId}`, { exercise: updateData });
      expect(result).toEqual(updatedExercise);
    });

    it('should handle exercise not found on update', async () => {
      // Arrange
      const nonExistentId = 999;
      const updateData = { name: 'New Name' };
      const notFoundError = { response: { status: 404 } };
      mockApiClient.put.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(exerciseService.updateExercise(nonExistentId, updateData)).rejects.toThrow('Ejercicio no encontrado');
    });

    it('should throw auth error on 401 for update', async () => {
      // Arrange
      const exerciseId = 1;
      const updateData = { name: 'Updated Name' };
      const authError = { response: { status: 401 } };
      mockApiClient.put.mockRejectedValueOnce(authError);

      // Act & Assert
      await expect(exerciseService.updateExercise(exerciseId, updateData)).rejects.toThrow('No tienes permisos para editar ejercicios');
    });

    it('should handle 422 validation errors with error array on update', async () => {
      // Arrange
      const exerciseId = 1;
      const updateData = { name: '', difficulty: 'invalid' };
      const validationError = { response: { status: 422, data: { errors: ['Name cannot be empty', 'Invalid difficulty'] } } };
      mockApiClient.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.updateExercise(exerciseId, updateData)).rejects.toThrow('Error de validación: Name cannot be empty, Invalid difficulty');
    });

    it('should handle 422 validation errors without error array on update', async () => {
      // Arrange
      const exerciseId = 1;
      const updateData = { name: '' };
      const validationError = { response: { status: 422, data: {} } };
      mockApiClient.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.updateExercise(exerciseId, updateData)).rejects.toThrow('Datos de ejercicio inválidos');
    });

    it('should handle generic error on update', async () => {
      // Arrange
      const exerciseId = 1;
      const updateData = { name: 'Updated Name' };
      const serverError = { response: { status: 500, data: { error: 'Internal server error' } } };
      mockApiClient.put.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(exerciseService.updateExercise(exerciseId, updateData)).rejects.toThrow('Internal server error');
    });
  });

  describe('deleteExercise', () => {
    it('should delete exercise successfully', async () => {
      // Arrange
      const exerciseId = 3;
      mockApiClient.delete.mockResolvedValueOnce({ data: {} });

      // Act
      await exerciseService.deleteExercise(exerciseId);

      // Assert
      expect(apiClient.delete).toHaveBeenCalledWith(`/exercises/${exerciseId}`);
      // deleteExercise returns void in the real service
    });

    it('should handle exercise not found on delete', async () => {
      // Arrange
      const nonExistentId = 999;
      const notFoundError = { response: { status: 404 } };
      mockApiClient.delete.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(exerciseService.deleteExercise(nonExistentId)).rejects.toThrow('Ejercicio no encontrado');
    });

    it('should throw auth error on 401 for delete', async () => {
      // Arrange
      const exerciseId = 1;
      const authError = { response: { status: 401 } };
      mockApiClient.delete.mockRejectedValueOnce(authError);

      // Act & Assert
      await expect(exerciseService.deleteExercise(exerciseId)).rejects.toThrow('No tienes permisos para eliminar ejercicios');
    });

    it('should handle generic error on delete', async () => {
      // Arrange
      const exerciseId = 1;
      const serverError = { response: { status: 500, data: { error: 'Internal server error' } } };
      mockApiClient.delete.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(exerciseService.deleteExercise(exerciseId)).rejects.toThrow('Internal server error');
    });
  });

  describe('updateVideoUrl', () => {
    it('should update video URL successfully', async () => {
      // Arrange
      const exerciseId = 1;
      const videoUrl = 'https://www.youtube.com/watch?v=example123';
      const updatedExercise = {
        id: exerciseId,
        name: 'Push Up',
        video_url: videoUrl
      };
      const mockResponse = { data: updatedExercise };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await exerciseService.updateVideoUrl(exerciseId, videoUrl);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(`/exercises/${exerciseId}/video_url`, { video_url: videoUrl });
      expect(result).toEqual(updatedExercise);
    });

    it('should handle exercise not found for video update', async () => {
      // Arrange
      const nonExistentId = 999;
      const videoUrl = 'https://www.youtube.com/watch?v=example123';
      const notFoundError = { response: { status: 404 } };
      mockApiClient.put.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(exerciseService.updateVideoUrl(nonExistentId, videoUrl)).rejects.toThrow('Ejercicio no encontrado');
    });

    it('should throw auth error on 401 for video update', async () => {
      // Arrange
      const exerciseId = 1;
      const videoUrl = 'https://www.youtube.com/watch?v=example123';
      const authError = { response: { status: 401 } };
      mockApiClient.put.mockRejectedValueOnce(authError);

      // Act & Assert
      await expect(exerciseService.updateVideoUrl(exerciseId, videoUrl)).rejects.toThrow('No tienes permisos para editar ejercicios');
    });

    it('should handle 422 error with details array', async () => {
      // Arrange
      const exerciseId = 1;
      const videoUrl = 'invalid-url';
      const validationError = { response: { status: 422, data: { details: ['Invalid URL format', 'URL too long'] } } };
      mockApiClient.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.updateVideoUrl(exerciseId, videoUrl)).rejects.toThrow('Datos inválidos: Invalid URL format, URL too long');
    });

    it('should handle 422 error without details', async () => {
      // Arrange
      const exerciseId = 1;
      const videoUrl = 'invalid-url';
      const validationError = { response: { status: 422, data: {} } };
      mockApiClient.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(exerciseService.updateVideoUrl(exerciseId, videoUrl)).rejects.toThrow('URL de video inválida');
    });

    it('should handle generic error for video update', async () => {
      // Arrange
      const exerciseId = 1;
      const videoUrl = 'https://www.youtube.com/watch?v=example123';
      const serverError = { response: { status: 500, data: { error: 'Internal server error' } } };
      mockApiClient.put.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(exerciseService.updateVideoUrl(exerciseId, videoUrl)).rejects.toThrow('Internal server error');
    });
  });

  // Only 6 methods exist in the real exerciseService:
  // getExercises, getExercise, updateVideoUrl, createExercise, updateExercise, deleteExercise
  // Removed tests for non-existent methods: getMuscleGroups, getEquipmentTypes, getExerciseStats
});
