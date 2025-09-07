import workoutService from "../../services/workoutService";
import { apiClient } from "../../services/apiClient";

// Mock dependencies
jest.mock("../../services/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("WorkoutService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWorkouts", () => {
    it("should fetch all workouts successfully", async () => {
      // Arrange
      const workouts = [
        {
          id: 1,
          name: "Morning Workout",
          status: "completed",
          routine_id: 1,
          created_at: "2024-01-01T10:00:00Z",
        },
      ];
      const mockResponse = { data: workouts };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getWorkouts();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toEqual(workouts);
    });

    it("should handle API errors", async () => {
      // Arrange
      const error = new Error("Error de conexión");
      (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(workoutService.getWorkouts()).rejects.toThrow(
        "Error de conexión"
      );
    });
  });

  describe("getActiveWorkouts", () => {
    it("should fetch active workouts successfully", async () => {
      // Arrange
      const allWorkouts = [
        { id: 1, name: "Workout 1", status: "completed" },
        { id: 2, name: "Workout 2", status: "in_progress" },
        { id: 3, name: "Workout 3", status: "paused" },
      ];
      const expectedActiveWorkouts = [
        { id: 2, name: "Workout 2", status: "in_progress" },
        { id: 3, name: "Workout 3", status: "paused" },
      ];
      const mockResponse = { data: allWorkouts };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getActiveWorkouts();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toEqual(expectedActiveWorkouts);
    });

    it("should return empty array when no active workouts", async () => {
      // Arrange
      const allWorkouts = [{ id: 1, name: "Workout 1", status: "completed" }];
      const mockResponse = { data: allWorkouts };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getActiveWorkouts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getWorkout", () => {
    it("should fetch workout by ID successfully", async () => {
      // Arrange
      const workoutId = 1;
      const workoutData = {
        id: 1,
        name: "Upper Body Workout",
        status: "in_progress",
        routine_id: 1,
        created_at: "2024-01-01T10:00:00Z",
      };
      const mockResponse = { data: workoutData };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getWorkout(workoutId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/workouts/${workoutId}`);
      expect(result).toEqual(workoutData);
    });

    it("should handle API errors", async () => {
      // Arrange
      const workoutId = 999;
      const error = new Error("Error de conexión");
      (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(workoutService.getWorkout(workoutId)).rejects.toThrow(
        "Error de conexión"
      );
    });
  });

  describe("createWorkout", () => {
    it("should create workout successfully", async () => {
      // Arrange
      const workoutData = {
        name: "New Workout",
        routine_id: 1,
      };
      const createdWorkout = {
        id: 1,
        name: "New Workout",
        routine_id: 1,
        status: "created",
        created_at: "2024-01-01T10:00:00Z",
      };
      const mockResponse = { data: createdWorkout };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.createWorkout(workoutData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith("/workouts", {
        workout: workoutData,
      });
      expect(result).toEqual(createdWorkout);
    });

    it("should handle creation errors", async () => {
      // Arrange
      const workoutData = { name: "", routine_id: 1 };
      const error = new Error("Datos inválidos");
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(workoutService.createWorkout(workoutData)).rejects.toThrow(
        "Datos inválidos"
      );
    });
  });

  describe("createFreeWorkout", () => {
    it("should create free workout successfully", async () => {
      // Arrange
      const workoutName = "Free Style Workout";
      const createdWorkout = {
        id: 1,
        name: workoutName,
        status: "created",
        created_at: "2024-01-01T10:00:00Z",
      };
      const mockResponse = { data: createdWorkout };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.createFreeWorkout(workoutName);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith("/workouts/free", {
        workout: { name: workoutName },
      });
      expect(result).toEqual(createdWorkout);
    });
  });

  describe("completeWorkout", () => {
    it("should complete workout successfully", async () => {
      // Arrange
      const workoutId = 1;
      const completionData = {
        duration: 2700,
        notes: "Great workout!",
      };
      const completedWorkout = {
        id: workoutId,
        name: "Morning Workout",
        status: "completed",
        duration: 2700,
        completed_at: "2024-01-01T11:00:00Z",
      };
      const mockResponse = { data: completedWorkout };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.completeWorkout(
        workoutId,
        completionData
      );

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workouts/${workoutId}/complete`,
        completionData
      );
      expect(result).toEqual(completedWorkout);
      expect(result.status).toBe("completed");
    });

    it("should complete workout without completion data", async () => {
      // Arrange
      const workoutId = 1;
      const completedWorkout = {
        id: workoutId,
        name: "Morning Workout",
        status: "completed",
        completed_at: "2024-01-01T11:00:00Z",
      };
      const mockResponse = { data: completedWorkout };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.completeWorkout(workoutId);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workouts/${workoutId}/complete`,
        {}
      );
      expect(result).toEqual(completedWorkout);
    });
  });

  describe("pauseWorkout", () => {
    it("should pause workout successfully", async () => {
      // Arrange
      const workoutId = 1;
      const pausedWorkout = {
        id: workoutId,
        name: "Morning Workout",
        status: "paused",
        paused_at: "2024-01-01T10:30:00Z",
      };
      const mockResponse = { data: pausedWorkout };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.pauseWorkout(workoutId);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workouts/${workoutId}/pause`,
        { reason: undefined }
      );
      expect(result).toEqual(pausedWorkout);
      expect(result.status).toBe("paused");
    });

    it("should pause workout with reason", async () => {
      // Arrange
      const workoutId = 1;
      const reason = "Taking a break";
      const pausedWorkout = {
        id: workoutId,
        name: "Morning Workout",
        status: "paused",
        paused_at: "2024-01-01T10:30:00Z",
      };
      const mockResponse = { data: pausedWorkout };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.pauseWorkout(workoutId, reason);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workouts/${workoutId}/pause`,
        { reason }
      );
      expect(result).toEqual(pausedWorkout);
    });
  });

  describe("resumeWorkout", () => {
    it("should resume workout successfully", async () => {
      // Arrange
      const workoutId = 1;
      const resumedWorkout = {
        id: workoutId,
        name: "Morning Workout",
        status: "in_progress",
        resumed_at: "2024-01-01T10:35:00Z",
      };
      const mockResponse = { data: resumedWorkout };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.resumeWorkout(workoutId);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workouts/${workoutId}/resume`,
        {}
      );
      expect(result).toEqual(resumedWorkout);
      expect(result.status).toBe("in_progress");
    });
  });

  describe("abandonWorkout", () => {
    it("should abandon workout successfully", async () => {
      // Arrange
      const workoutId = 1;
      const abandonedWorkout = {
        id: workoutId,
        name: "Morning Workout",
        status: "abandoned",
        abandoned_at: "2024-01-01T10:30:00Z",
      };
      const mockResponse = { data: abandonedWorkout };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.abandonWorkout(workoutId);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workouts/${workoutId}/abandon`,
        {}
      );
      expect(result).toEqual(abandonedWorkout);
      expect(result.status).toBe("abandoned");
    });
  });

  describe("recordExerciseSet", () => {
    it("should record exercise set successfully", async () => {
      // Arrange
      const workoutExerciseId = 1;
      const setData = {
        reps: 12,
        weight: 50,
        rest_time: 60,
      };
      const recordedSet = {
        id: 1,
        workout_exercise_id: workoutExerciseId,
        reps: 12,
        weight: 50,
        rest_time: 60,
        completed: true,
      };
      const mockResponse = { data: recordedSet };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.recordExerciseSet(
        workoutExerciseId,
        setData
      );

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        `/workout/exercises/${workoutExerciseId}/record_set`,
        { set: setData }
      );
      expect(result).toEqual(recordedSet);
    });
  });

  describe("getSets", () => {
    it("should fetch sets for exercise successfully", async () => {
      // Arrange
      const exerciseId = 1;
      const sets = [
        { id: 1, reps: 12, weight: 50, completed: true },
        { id: 2, reps: 10, weight: 55, completed: true },
      ];
      const mockResponse = { data: sets };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getSets(exerciseId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(
        `/workout/exercises/${exerciseId}/sets`
      );
      expect(result).toEqual(sets);
    });
  });

  describe("createSet", () => {
    it("should create set successfully", async () => {
      // Arrange
      const exerciseId = 1;
      const setData = {
        reps: 12,
        weight: 50,
        target_reps: 12,
      };
      const createdSet = {
        id: 1,
        workout_exercise_id: exerciseId,
        reps: 12,
        weight: 50,
        target_reps: 12,
      };
      const mockResponse = { data: createdSet };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.createSet(exerciseId, setData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        `/workout/exercises/${exerciseId}/sets`,
        { set: setData }
      );
      expect(result).toEqual(createdSet);
    });
  });

  describe("getWorkoutsByRoutine", () => {
    it("should fetch workouts and filter by routine successfully", async () => {
      // Arrange
      const routineId = 1;
      const allWorkouts = [
        {
          id: 1,
          name: "Morning Workout",
          status: "completed",
          routine_id: 1,
          completed_at: "2024-01-01T10:00:00Z",
        },
        {
          id: 2,
          name: "Evening Workout",
          status: "in_progress",
          routine_id: 1,
          started_at: "2024-01-02T18:00:00Z",
        },
        {
          id: 3,
          name: "Other Workout",
          status: "pending",
          routine_id: 2,
          created_at: "2024-01-03T12:00:00Z",
        },
      ];
      const expectedFilteredWorkouts = [
        {
          id: 1,
          name: "Morning Workout",
          status: "completed",
          routine_id: 1,
          completed_at: "2024-01-01T10:00:00Z",
        },
        {
          id: 2,
          name: "Evening Workout",
          status: "in_progress",
          routine_id: 1,
          started_at: "2024-01-02T18:00:00Z",
        },
      ];
      const mockResponse = { data: allWorkouts };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getWorkoutsByRoutine(routineId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toEqual(expectedFilteredWorkouts);
      expect(result).toHaveLength(2);
      expect(result.every((w) => w.routine_id === routineId)).toBe(true);
    });

    it("should return empty array when no workouts found for routine", async () => {
      // Arrange
      const routineId = 999;
      const allWorkouts = [
        { id: 1, name: "Workout 1", routine_id: 1, status: "completed" },
        { id: 2, name: "Workout 2", routine_id: 2, status: "pending" },
      ];
      const mockResponse = { data: allWorkouts };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getWorkoutsByRoutine(routineId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      // Arrange
      const routineId = 1;
      const error = new Error("Error de conexión");
      (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        workoutService.getWorkoutsByRoutine(routineId)
      ).rejects.toThrow("Error de conexión");
    });
  });

  describe("getWorkoutExercises", () => {
    it("should fetch workout exercises successfully", async () => {
      // Arrange
      const workoutId = 1;
      const mockExercises = [
        {
          id: 1,
          workout_id: workoutId,
          exercise: { id: 1, name: "Push-ups" },
          sets: 3,
          reps: 12,
          status: "completed",
        },
        {
          id: 2,
          workout_id: workoutId,
          exercise: { id: 2, name: "Squats" },
          sets: 4,
          reps: 15,
          status: "pending",
        },
      ];
      const mockResponse = { data: mockExercises };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.getWorkoutExercises(workoutId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith("/workout/exercises", {
        params: { workout_id: workoutId },
      });
      expect(result).toEqual(mockExercises);
      expect(result).toHaveLength(2);
    });

    it("should handle workout not found", async () => {
      // Arrange
      const workoutId = 999;
      const error = new Error("Error de conexión");
      (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        workoutService.getWorkoutExercises(workoutId)
      ).rejects.toThrow("Error de conexión");
    });
  });

  describe("addWorkoutExercise", () => {
    it("should add exercise to workout successfully", async () => {
      // Arrange
      const workoutId = 1;
      const exerciseData = {
        exercise_id: 5,
        sets: 3,
        reps: 12,
        rest_time: 60,
        weight: 20,
      };
      const mockWorkoutExercise = {
        id: 10,
        workout_id: workoutId,
        exercise_id: 5,
        sets: 3,
        reps: 12,
        rest_time: 60,
        weight: 20,
        status: "pending",
        exercise: { id: 5, name: "Bench Press" },
      };
      const mockResponse = { data: mockWorkoutExercise };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.addWorkoutExercise(
        workoutId,
        exerciseData
      );

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith("/workout/exercises", {
        workout_id: workoutId,
        workout_exercise: exerciseData,
      });
      expect(result).toEqual(mockWorkoutExercise);
    });

    it("should handle validation errors", async () => {
      // Arrange
      const workoutId = 1;
      const invalidData = { exercise_id: null };
      const error = new Error("Datos inválidos");
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        workoutService.addWorkoutExercise(workoutId, invalidData)
      ).rejects.toThrow("Datos inválidos");
    });
  });

  describe("createWorkoutExercise", () => {
    it("should create workout exercise successfully", async () => {
      // Arrange
      const workoutId = 1;
      const exerciseData = {
        exercise_id: 3,
        order: 1,
        target_sets: 4,
        target_reps: 8,
        suggested_weight: 50,
        notes: "Focus on form",
        group_type: "regular",
      };
      const mockCreatedExercise = {
        id: 15,
        workout_id: workoutId,
        exercise_id: 3,
        order: 1,
        target_sets: 4,
        target_reps: 8,
        suggested_weight: 50,
        notes: "Focus on form",
        group_type: "regular",
        status: "pending",
        created_at: "2024-01-15T14:00:00Z",
      };
      const mockResponse = { data: mockCreatedExercise };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.createWorkoutExercise(
        workoutId,
        exerciseData
      );

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith("/workout/exercises", {
        workout_id: workoutId,
        workout_exercise: {
          exercise_id: exerciseData.exercise_id,
          order: exerciseData.order,
          target_sets: exerciseData.target_sets,
          target_reps: exerciseData.target_reps,
          group_type: "regular",
          suggested_weight: exerciseData.suggested_weight,
          notes: exerciseData.notes,
        },
      });
      expect(result).toEqual(mockCreatedExercise);
    });

    it("should handle workout not found", async () => {
      // Arrange
      const workoutId = 999;
      const exerciseData = { exercise_id: 1, target_sets: 3, target_reps: 12 };
      const error = new Error("Error de conexión");
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        workoutService.createWorkoutExercise(workoutId, exerciseData)
      ).rejects.toThrow("Error de conexión");
    });
  });

  describe("completeExercise", () => {
    it("should complete exercise successfully", async () => {
      // Arrange
      const workoutExerciseId = 5;
      const mockCompletedExercise = {
        id: workoutExerciseId,
        status: "completed",
        completed_at: "2024-01-15T15:30:00Z",
      };
      const mockResponse = { data: mockCompletedExercise };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.completeExercise(workoutExerciseId);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workout/exercises/${workoutExerciseId}/complete`,
        {}
      );
      expect(result).toEqual(mockCompletedExercise);
    });

    it("should handle exercise already completed", async () => {
      // Arrange
      const workoutExerciseId = 5;
      const error = new Error("Error de conexión");
      (apiClient.put as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        workoutService.completeExercise(workoutExerciseId)
      ).rejects.toThrow("Error de conexión");
    });
  });

  describe("completeSet", () => {
    it("should complete set successfully", async () => {
      // Arrange
      const exerciseId = 5;
      const setId = 10;
      const completionData = {
        reps_completed: 12,
        weight_used: 25,
        notes: "Good form",
      };
      const mockCompletedSet = {
        id: setId,
        reps_completed: 12,
        weight_used: 25,
        notes: "Good form",
        status: "completed",
        completed_at: "2024-01-15T16:00:00Z",
      };
      const mockResponse = { data: mockCompletedSet };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.completeSet(
        exerciseId,
        setId,
        completionData
      );

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workout/exercises/${exerciseId}/sets/${setId}/complete`,
        { set: completionData }
      );
      expect(result).toEqual(mockCompletedSet);
    });

    it("should handle set not found", async () => {
      // Arrange
      const exerciseId = 5;
      const setId = 999;
      const completionData = { reps_completed: 10 };
      const error = new Error("Error de conexión");
      (apiClient.put as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        workoutService.completeSet(exerciseId, setId, completionData)
      ).rejects.toThrow("Error de conexión");
    });
  });

  describe("startSet", () => {
    it("should start set successfully", async () => {
      // Arrange
      const exerciseId = 5;
      const setId = 8;
      const mockStartedSet = {
        id: setId,
        status: "in_progress",
        started_at: "2024-01-15T16:30:00Z",
      };
      const mockResponse = { data: mockStartedSet };
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await workoutService.startSet(exerciseId, setId);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/workout/exercises/${exerciseId}/sets/${setId}/start`,
        {}
      );
      expect(result).toEqual(mockStartedSet);
    });

    it("should handle set already started", async () => {
      // Arrange
      const exerciseId = 5;
      const setId = 8;
      const error = new Error("Error de conexión");
      (apiClient.put as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(workoutService.startSet(exerciseId, setId)).rejects.toThrow(
        "Error de conexión"
      );
    });

    it("should handle set not found", async () => {
      // Arrange
      const exerciseId = 5;
      const setId = 999;
      const error = new Error("Error de conexión");
      (apiClient.put as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(workoutService.startSet(exerciseId, setId)).rejects.toThrow(
        "Error de conexión"
      );
    });
  });
});
