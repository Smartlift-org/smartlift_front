import trainerService from '../../services/trainerService';
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

describe('TrainerService', () => {
  const trainerId = '1';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembers', () => {
    it('should fetch members successfully', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@email.com',
          role: 'user',
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 2,
          first_name: 'María',
          last_name: 'García',
          email: 'maria.garcia@email.com',
          role: 'user',
          created_at: '2024-01-02T10:00:00Z'
        }
      ];
      const mockPaginatedResponse = {
        members: mockUsers,
        meta: { total_count: 2, current_page: 1, per_page: 20, total_pages: 1 }
      };
      const mockResponse = { data: mockPaginatedResponse };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMembers(trainerId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/trainers/${trainerId}/members`, { params: { page: 1, per_page: 20, search: '', status: '' } });
      expect(result).toEqual(mockPaginatedResponse);
      expect(result.members).toHaveLength(2);
    });

    it('should fetch members with filters', async () => {
      // Arrange
      const mockPaginatedResponse = {
        members: [],
        meta: { total_count: 0, current_page: 1, per_page: 10, total_pages: 0 }
      };
      const mockResponse = { data: mockPaginatedResponse };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMembers(trainerId, 1, 10, { search: 'Juan', status: 'active' });

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/trainers/${trainerId}/members`, { 
        params: { page: 1, per_page: 10, search: 'Juan', status: 'active' } 
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return empty members when no users assigned', async () => {
      // Arrange
      const mockPaginatedResponse = {
        members: [],
        meta: { total_count: 0, current_page: 1, per_page: 20, total_pages: 0 }
      };
      const mockResponse = { data: mockPaginatedResponse };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMembers(trainerId);

      // Assert
      expect(result.members).toEqual([]);
      expect(result.meta.total_count).toBe(0);
    });

    it('should handle API errors', async () => {
      // Arrange
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(trainerService.getMembers(trainerId)).rejects.toThrow('Network error');
    });
  });

  describe('getMemberProfile', () => {
    it('should fetch member profile successfully', async () => {
      // Arrange
      const userId = '1';
      const mockApiData = {
        id: userId,
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@email.com',
        role: 'user',
        stats: {
          consistency_score: 85,
          recent_workouts: 5,
          total_workouts: 15,
          avg_workout_duration: 45,
          personal_records: 3,
          favorite_exercises: ['Push-ups', 'Squats']
        },
        recent_activity: [
          {
            id: 1,
            name: 'Morning Workout',
            completed_at: '2024-01-01T11:00:00Z'
          }
        ]
      };
      const expectedResult = {
        id: userId,
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@email.com',
        stats: {
          consistency_score: 85,
          recent_workouts: 5,
          total_workouts: 15,
          avg_workout_duration: 45,
          personal_records: 3,
          favorite_exercises: ['Push-ups', 'Squats']
        },
        recent_activity: [
          {
            id: 1,
            name: 'Morning Workout',
            completed_at: '2024-01-01T11:00:00Z'
          }
        ]
      };
      const mockResponse = { data: mockApiData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMemberProfile(trainerId, userId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/trainers/${trainerId}/members/${userId}`);
      expect(result).toEqual(expectedResult);
    });

    it('should handle missing stats gracefully', async () => {
      // Arrange
      const userId = '1';
      const mockApiData = {
        id: userId,
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@email.com'
      };
      const expectedResult = {
        id: userId,
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@email.com',
        stats: {
          consistency_score: 0,
          recent_workouts: 0,
          total_workouts: 0,
          avg_workout_duration: 0,
          personal_records: 0,
          favorite_exercises: []
        },
        recent_activity: []
      };
      const mockResponse = { data: mockApiData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMemberProfile(trainerId, userId);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle user not found', async () => {
      // Arrange
      const userId = '999';
      const error = new Error('User not found');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(trainerService.getMemberProfile(trainerId, userId)).rejects.toThrow('User not found');
    });
  });

  describe('getMemberActivity', () => {
    it('should fetch member activity successfully', async () => {
      // Arrange
      const userId = '1';
      const mockWorkouts = [
        {
          id: 1,
          name: 'Push Day',
          status: 'completed',
          completed_at: '2024-01-01T11:00:00Z',
          duration: 2700
        },
        {
          id: 2,
          name: 'Pull Day',
          status: 'in_progress',
          started_at: '2024-01-02T10:00:00Z'
        }
      ];
      const mockResponse = { data: mockWorkouts };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMemberActivity(trainerId, userId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/trainers/${trainerId}/members/${userId}/activity`, { params: { page: 1, per_page: 10 } });
      expect(result).toEqual(mockWorkouts);
    });

    it('should handle empty activity list', async () => {
      // Arrange
      const userId = '1';
      const mockResponse = { data: [] };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMemberActivity(trainerId, userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getMemberRoutines', () => {
    it('should fetch member routines successfully', async () => {
      // Arrange
      const userId = '1';
      const mockRoutines = [
        {
          id: 1,
          name: 'Beginner Push Pull',
          difficulty: 'beginner',
          duration: 45,
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 2,
          name: 'Advanced Upper Body',
          difficulty: 'advanced',
          duration: 60,
          created_at: '2024-01-05T10:00:00Z'
        }
      ];
      const mockResponse = { data: mockRoutines };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getMemberRoutines(trainerId, userId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/trainers/${trainerId}/members/${userId}/routines`, { params: { page: 1, per_page: 10 } });
      expect(result).toEqual(mockRoutines);
    });
  });

  describe('assignRoutine', () => {
    it('should assign routine to user successfully', async () => {
      // Arrange
      const userId = '1';
      const routineId = '5';
      const customName = 'Custom Routine Name';
      const mockAssignment = {
        id: 10,
        user_id: userId,
        routine_id: routineId,
        custom_name: customName,
        assigned_at: '2024-01-15T14:00:00Z',
        status: 'active'
      };
      const mockResponse = { data: mockAssignment };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.assignRoutine(trainerId, userId, routineId, customName);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/trainers/${trainerId}/members/${userId}/assign_routine`,
        { routine_id: routineId, custom_name: customName }
      );
      expect(result).toEqual(mockAssignment);
    });

    it('should assign routine without custom name', async () => {
      // Arrange
      const userId = '1';
      const routineId = '5';
      const mockAssignment = {
        id: 10,
        user_id: userId,
        routine_id: routineId,
        assigned_at: '2024-01-15T14:00:00Z',
        status: 'active'
      };
      const mockResponse = { data: mockAssignment };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.assignRoutine(trainerId, userId, routineId);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/trainers/${trainerId}/members/${userId}/assign_routine`,
        { routine_id: routineId, custom_name: undefined }
      );
      expect(result).toEqual(mockAssignment);
    });

    it('should handle routine already assigned error', async () => {
      // Arrange
      const userId = '1';
      const routineId = '5';
      const error = new Error('Routine already assigned to user');
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        trainerService.assignRoutine(trainerId, userId, routineId)
      ).rejects.toThrow('Routine already assigned to user');
    });
  });

  describe('getDashboard', () => {
    it('should fetch trainer dashboard successfully', async () => {
      // Arrange
      const mockApiData = {
        dashboard: {
          overview: {
            total_members: 25,
            active_members: 20,
            total_workouts: 150,
            activity_rate: 85
          }
        }
      };
      const expectedResult = {
        ...mockApiData,
        total_members_count: 25,
        active_members_count: 20,
        total_workouts_count: 150,
        avg_member_consistency: 85
      };
      const mockResponse = { data: mockApiData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getDashboard(trainerId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/trainers/${trainerId}/dashboard`);
      expect(result).toEqual(expectedResult);
    });

    it('should handle missing dashboard data gracefully', async () => {
      // Arrange
      const mockApiData = {};
      const expectedResult = {
        total_members_count: 0,
        active_members_count: 0,
        total_workouts_count: 0,
        avg_member_consistency: 0
      };
      const mockResponse = { data: mockApiData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getDashboard(trainerId);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('assignMember', () => {
    it('should assign member to trainer successfully', async () => {
      // Arrange
      const userId = '1';
      const mockAssignment = {
        id: 10,
        trainer_id: trainerId,
        user_id: userId,
        assigned_at: '2024-01-15T14:00:00Z'
      };
      const mockResponse = { data: mockAssignment };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.assignMember(trainerId, userId);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/trainers/${trainerId}/members`,
        { user_id: userId }
      );
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('unassignMember', () => {
    it('should unassign member from trainer successfully', async () => {
      // Arrange
      const userId = '1';
      const mockResponse = { data: { message: 'Member unassigned successfully' } };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.unassignMember(trainerId, userId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/trainers/${trainerId}/members/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAvailableUsers', () => {
    it('should fetch available users successfully', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com' },
        { id: 2, first_name: 'María', last_name: 'García', email: 'maria@example.com' }
      ];
      const mockApiData = {
        available_users: mockUsers,
        pagination: { total_count: 2, current_page: 1, per_page: 20, total_pages: 1 }
      };
      const expectedResult = {
        members: mockUsers,
        meta: { total_count: 2, current_page: 1, per_page: 20, total_pages: 1 }
      };
      const mockResponse = { data: mockApiData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getAvailableUsers(trainerId, 1, 20, 'Juan');

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/trainers/${trainerId}/available_users`,
        { params: { page: 1, per_page: 20, search: 'Juan' } }
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRoutines', () => {
    it('should fetch trainer routines successfully', async () => {
      // Arrange
      const mockRoutines = {
        routines: [
          { id: 1, name: 'Beginner Routine', difficulty: 'beginner', duration: 30 },
          { id: 2, name: 'Advanced Routine', difficulty: 'advanced', duration: 60 }
        ],
        meta: { total_count: 2, current_page: 1, per_page: 20, total_pages: 1 }
      };
      const mockResponse = { data: mockRoutines };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.getRoutines(trainerId, 1, 20, 'beginner');

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/trainers/${trainerId}/routines`,
        { params: { page: 1, per_page: 20, difficulty: 'beginner' } }
      );
      expect(result).toEqual(mockRoutines);
    });
  });

  describe('deleteMemberRoutine', () => {
    it('should delete member routine successfully', async () => {
      // Arrange
      const memberId = '1';
      const routineId = '5';
      const mockResponse = { data: { message: 'Routine deleted successfully' } };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.deleteMemberRoutine(trainerId, memberId, routineId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/trainers/${trainerId}/members/${memberId}/routines/${routineId}`
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateMemberRoutine', () => {
    it('should update member routine successfully', async () => {
      // Arrange
      const memberId = '1';
      const routineId = '5';
      const routineData = { name: 'Updated Routine', difficulty: 'intermediate' };
      const mockUpdatedRoutine = { id: routineId, ...routineData };
      const mockResponse = { data: mockUpdatedRoutine };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await trainerService.updateMemberRoutine(trainerId, memberId, routineId, routineData);

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/trainers/${trainerId}/members/${memberId}/routines/${routineId}`,
        { routine: routineData }
      );
      expect(result).toEqual(mockUpdatedRoutine);
    });
  });
});
