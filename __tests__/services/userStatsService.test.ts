import userStatsService, { translateGenderToBackend, translateGenderToFrontend } from '../../services/userStatsService';
import { apiClient } from '../../services/apiClient';

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

describe('UserStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('should fetch user stats successfully', async () => {
      // Arrange
      const userStats = {
        id: '1',
        user_id: '1',
        weight: 70,
        height: 175,
        gender: 'Hombre',
        age: 25,
        activity_level: 'moderately_active',
        experience_level: 'beginner',
        physical_limitations: 'none',
        fitness_goal: 'muscle_gain'
      };
      const mockResponse = { data: userStats };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await userStatsService.getUserStats();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/user_stats');
      expect(result).toEqual(userStats);
      expect(result!.weight).toBe(70);
      expect(result!.height).toBe(175);
      expect(result!.gender).toBe('Hombre');
    });

    it('should return null when user has no stats', async () => {
      // Arrange
      const mockResponse = { data: null };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await userStatsService.getUserStats();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle API errors and return null', async () => {
      // Arrange
      const notFoundError = {
        response: { status: 404, data: { error: 'Usuario no encontrado' } }
      };
      (apiClient.get as jest.Mock).mockRejectedValueOnce(notFoundError);

      // Act
      const result = await userStatsService.getUserStats();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createUserStats', () => {
    it('should create user stats successfully', async () => {
      // Arrange
      const newStatsData = {
        weight: 70,
        height: 175,
        gender: 'Hombre',
        age: 25,
        activity_level: 'moderately_active',
        experience_level: 'beginner',
        physical_limitations: 'none',
        fitness_goal: 'muscle_gain'
      };
      const createdStats = {
        id: '1',
        user_id: '1',
        ...newStatsData
      };
      const mockResponse = { data: createdStats };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await userStatsService.createUserStats(newStatsData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/user_stats', {
        user_stat: expect.objectContaining({
          gender: 'male' // Should be translated to backend format
        })
      });
      expect(result).toEqual(createdStats);
    });

    it('should handle creation errors', async () => {
      // Arrange
      const invalidData = {
        weight: -10,
        height: 0,
        gender: 'Hombre',
        age: -5,
        activity_level: 'invalid',
        experience_level: 'beginner',
        physical_limitations: 'none'
      };
      const validationError = {
        response: {
          status: 422,
          data: { 
            errors: ['El peso debe ser mayor a 0', 'La altura debe ser mayor a 0']
          }
        }
      };
      (apiClient.post as jest.Mock).mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(userStatsService.createUserStats(invalidData)).rejects.toEqual(validationError);
    });
  });

  describe('updateUserStats', () => {
    it('should update user stats successfully', async () => {
      // Arrange
      const updateData = {
        weight: 72,
        height: 175,
        gender: 'Hombre',
        age: 26,
        activity_level: 'very_active',
        experience_level: 'intermediate',
        physical_limitations: 'knee_issues',
        fitness_goal: 'muscle_gain'
      };
      const updatedStats = {
        id: '1',
        user_id: '1',
        ...updateData
      };
      const mockResponse = { data: updatedStats };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await userStatsService.updateUserStats(updateData);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith('/user_stats', { 
        user_stat: expect.objectContaining({
          gender: 'male' // Should be translated to backend format
        })
      });
      expect(result).toEqual(updatedStats);
      expect(result.weight).toBe(72);
    });

    it('should handle update errors', async () => {
      // Arrange
      const invalidData = {
        weight: -10,
        activity_level: 'invalid',
        experience_level: 'beginner',
        physical_limitations: 'none'
      };
      const validationError = {
        response: {
          status: 422,
          data: { 
            errors: ['El peso debe ser mayor a 0']
          }
        }
      };
      (apiClient.put as jest.Mock).mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(userStatsService.updateUserStats(invalidData)).rejects.toEqual(validationError);
    });
  });

  describe('hasCompletedProfile', () => {
    it('should return true when profile is completed', async () => {
      // Arrange
      const completedStats = {
        id: '1',
        user_id: '1',
        experience_level: 'intermediate',
        activity_level: 'moderately_active',
        physical_limitations: 'none'
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: completedStats });

      // Act
      const result = await userStatsService.hasCompletedProfile();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when profile is incomplete', async () => {
      // Arrange
      const incompleteStats = {
        id: '1',
        user_id: '1',
        experience_level: 'intermediate',
        activity_level: '',
        physical_limitations: null
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: incompleteStats });

      // Act
      const result = await userStatsService.hasCompletedProfile();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when no stats exist', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: null });

      // Act
      const result = await userStatsService.hasCompletedProfile();

      // Assert
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const error = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

      // Act
      const result = await userStatsService.hasCompletedProfile();

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe('Gender Translation Functions', () => {
  describe('translateGenderToBackend', () => {
    it('should translate Spanish gender to backend format', () => {
      expect(translateGenderToBackend('Hombre')).toBe('male');
      expect(translateGenderToBackend('Mujer')).toBe('female');
      expect(translateGenderToBackend('Otro')).toBe('other');
    });

    it('should return original value if no translation exists', () => {
      expect(translateGenderToBackend('unknown')).toBe('unknown');
      expect(translateGenderToBackend('')).toBe('');
    });
  });

  describe('translateGenderToFrontend', () => {
    it('should translate backend gender to Spanish format', () => {
      expect(translateGenderToFrontend('male')).toBe('Hombre');
      expect(translateGenderToFrontend('female')).toBe('Mujer');
      expect(translateGenderToFrontend('other')).toBe('Otro');
    });

    it('should return original value if no translation exists', () => {
      expect(translateGenderToFrontend('unknown')).toBe('unknown');
      expect(translateGenderToFrontend('')).toBe('');
    });
  });
});
