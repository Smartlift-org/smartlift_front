import workoutStatsService from "../../services/workoutStatsService";
import workoutService from "../../services/workoutService";

// Mock dependencies
jest.mock("../../services/workoutService", () => ({
  __esModule: true,
  default: {
    getWorkouts: jest.fn(),
  },
}));

const mockWorkoutService = workoutService as jest.Mocked<typeof workoutService>;

describe("WorkoutStatsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getGeneralStats", () => {
    it("should calculate general stats successfully", async () => {
      // Arrange
      const mockWorkouts = [
        {
          id: 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          date: "2024-01-01T10:00:00Z",
          total_duration_seconds: 3600,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T11:00:00Z",
        },
        {
          id: 2,
          user_id: 1,
          routine_id: 2,
          status: "completed" as "completed",
          date: "2024-01-02T10:00:00Z",
          total_duration_seconds: 2700,
          created_at: "2024-01-02T10:00:00Z",
          updated_at: "2024-01-02T11:00:00Z",
        },
        {
          id: 3,
          user_id: 1,
          routine_id: 3,
          status: "in_progress" as "in_progress",
          date: "2024-01-03T10:00:00Z",
          created_at: "2024-01-03T10:00:00Z",
          updated_at: "2024-01-03T11:00:00Z",
        },
      ];
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(mockWorkouts);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(mockWorkoutService.getWorkouts).toHaveBeenCalled();
      expect(result.totalWorkouts).toBe(3);
      expect(result.completedWorkouts).toBe(2);
      expect(result.totalTime).toBe(6300);
    });

    it("should handle empty workouts array", async () => {
      // Arrange
      mockWorkoutService.getWorkouts.mockResolvedValueOnce([]);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.totalWorkouts).toBe(0);
      expect(result.completedWorkouts).toBe(0);
      expect(result.totalTime).toBe(0);
      expect(result.avgWorkoutsPerWeek).toBe(0);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
    });

    it("should handle workoutService errors", async () => {
      // Arrange
      const error = new Error("Workout service error");
      mockWorkoutService.getWorkouts.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(workoutStatsService.getGeneralStats()).rejects.toThrow(
        "Workout service error"
      );
    });

    it("should handle null workouts array", async () => {
      // Arrange
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(null as any);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.totalWorkouts).toBe(0);
      expect(result.completedWorkouts).toBe(0);
      expect(result.totalTime).toBe(0);
      expect(result.avgWorkoutsPerWeek).toBe(0);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
    });

    it("should calculate stats with single workout", async () => {
      // Arrange
      const mockWorkouts = [
        {
          id: 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          date: "2024-01-01T10:00:00Z",
          total_duration_seconds: 3600,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T11:00:00Z",
        },
      ];
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(mockWorkouts);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.totalWorkouts).toBe(1);
      expect(result.completedWorkouts).toBe(1);
      expect(result.avgWorkoutsPerWeek).toBe(1);
    });

    it("should handle workouts with different duration fields", async () => {
      // Arrange
      const mockWorkouts = [
        {
          id: 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          date: "2024-01-01T10:00:00Z",
          effective_duration: 1800,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T11:00:00Z",
        },
        {
          id: 2,
          user_id: 1,
          routine_id: 2,
          status: "completed" as "completed",
          date: "2024-01-02T10:00:00Z",
          total_duration: 2400,
          created_at: "2024-01-02T10:00:00Z",
          updated_at: "2024-01-02T11:00:00Z",
        },
        {
          id: 3,
          user_id: 1,
          routine_id: 3,
          status: "completed" as "completed",
          date: "2024-01-03T10:00:00Z",
          created_at: "2024-01-03T10:00:00Z",
          updated_at: "2024-01-03T11:00:00Z",
        },
      ];
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(mockWorkouts);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.totalTime).toBe(4200); // 1800 + 2400 + 0
    });

    it("should calculate current streak when last workout was today", async () => {
      // Arrange
      const today = new Date();
      const yesterday = new Date(today.getTime() - 86400000);
      
      const mockWorkouts = [
        {
          id: 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          date: today.toISOString(),
          total_duration_seconds: 3600,
          created_at: today.toISOString(),
          updated_at: today.toISOString(),
        },
        {
          id: 2,
          user_id: 1,
          routine_id: 2,
          status: "completed" as "completed",
          date: yesterday.toISOString(),
          total_duration_seconds: 3600,
          created_at: yesterday.toISOString(),
          updated_at: yesterday.toISOString(),
        },
      ];
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(mockWorkouts);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.currentStreak).toBeGreaterThan(0);
    });

    it("should reset current streak when last workout was more than 1 day ago", async () => {
      // Arrange
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
      
      const mockWorkouts = [
        {
          id: 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          date: threeDaysAgo.toISOString(),
          total_duration_seconds: 3600,
          created_at: threeDaysAgo.toISOString(),
          updated_at: threeDaysAgo.toISOString(),
        },
        {
          id: 2,
          user_id: 1,
          routine_id: 2,
          status: "completed" as "completed",
          date: fourDaysAgo.toISOString(),
          total_duration_seconds: 3600,
          created_at: fourDaysAgo.toISOString(),
          updated_at: fourDaysAgo.toISOString(),
        },
      ];
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(mockWorkouts);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.currentStreak).toBe(0);
    });

    it("should calculate best streak correctly", async () => {
      // Arrange
      const dates = [];
      const baseDate = new Date('2024-01-01');
      
      // Create 5 consecutive days of workouts
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate.getTime() + i * 86400000);
        dates.push({
          id: i + 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          date: date.toISOString(),
          total_duration_seconds: 3600,
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
        });
      }
      
      // Add a workout 3 days later (breaking the streak)
      const laterDate = new Date(baseDate.getTime() + 8 * 86400000);
      dates.push({
        id: 6,
        user_id: 1,
        routine_id: 1,
        status: "completed" as "completed",
        date: laterDate.toISOString(),
        total_duration_seconds: 3600,
        created_at: laterDate.toISOString(),
        updated_at: laterDate.toISOString(),
      });
      
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(dates);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.bestStreak).toBeGreaterThanOrEqual(5);
    });

    it("should handle workouts with created_at dates when date is missing", async () => {
      // Arrange
      const mockWorkouts = [
        {
          id: 1,
          user_id: 1,
          routine_id: 1,
          status: "completed" as "completed",
          total_duration_seconds: 3600,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T11:00:00Z",
        },
        {
          id: 2,
          user_id: 1,
          routine_id: 2,
          status: "completed" as "completed",
          total_duration_seconds: 2700,
          created_at: "2024-01-02T10:00:00Z",
          updated_at: "2024-01-02T11:00:00Z",
        },
      ];
      mockWorkoutService.getWorkouts.mockResolvedValueOnce(mockWorkouts);

      // Act
      const result = await workoutStatsService.getGeneralStats();

      // Assert
      expect(result.totalWorkouts).toBe(2);
      expect(result.completedWorkouts).toBe(2);
      expect(result.totalTime).toBe(6300);
    });
  });
});
