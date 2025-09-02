import { apiClient } from "../../services/apiClient";
import routineService from "../../services/routineService";

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

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("RoutineService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRoutines", () => {
    it("should fetch routines successfully", async () => {
      // Arrange
      const mockRoutines = [
        {
          id: 1,
          name: "Push Day",
          description: "Upper body push routine",
          difficulty: "beginner" as const,
          duration: 45,
        },
      ];
      const mockResponse = { data: mockRoutines };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.getRoutines();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/routines");
      expect(result).toEqual(mockRoutines);
    });

    it("should return empty array when no routines found", async () => {
      // Arrange
      const mockResponse = { data: [] };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.getRoutines();

      // Assert
      expect(result).toEqual([]);
    });

    it("should throw error on API failure", async () => {
      // Arrange
      const mockError = new Error("Server Error");
      mockApiClient.get.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(routineService.getRoutines()).rejects.toThrow(
        "Server Error"
      );
    });
  });

  describe("getRoutine", () => {
    it("should fetch routine by ID successfully", async () => {
      // Arrange
      const routineId = 1;
      const routineData = {
        id: 1,
        name: "Push Day",
        description: "Upper body push routine",
        difficulty: "beginner" as const,
        duration: 45,
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
      };
      const mockResponse = { data: routineData };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.getRoutine(routineId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/routines/${routineId}`);
      expect(result).toEqual(routineData);
    });

    it("should throw error when routine not found", async () => {
      // Arrange
      const routineId = 999;
      const mockError = new Error("Routine not found");
      mockApiClient.get.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(routineService.getRoutine(routineId)).rejects.toThrow(
        "Routine not found"
      );
    });
  });

  describe("createRoutine", () => {
    it("should create routine successfully", async () => {
      // Arrange
      const routineData = {
        name: "Nueva Rutina Test",
        description: "Descripción de test",
        difficulty: "beginner" as const,
        duration: 30,
        routine_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 1,
            name: "Push ups",
          },
        ],
      };
      const mockCreatedRoutine = {
        id: 1,
        name: "Nueva Rutina Test",
        description: "Descripción de test",
        difficulty: "beginner" as const,
        duration: 30,
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
      };
      const mockResponse = { data: mockCreatedRoutine };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.createRoutine(routineData);

      // Assert
      expect(result).toEqual(mockCreatedRoutine);
    });

    it("should handle validation errors on create", async () => {
      // Arrange
      const invalidRoutineData = {
        name: "", // Nombre vacío debería fallar
        description: "Test",
        difficulty: "beginner" as const,
        duration: 30,
      };
      const mockError = new Error("Validation failed");
      mockApiClient.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(
        routineService.createRoutine(invalidRoutineData)
      ).rejects.toThrow("Validation failed");
    });

    it("should create routine with multiple exercises", async () => {
      // Arrange
      const routineData = {
        name: "Rutina Completa",
        description: "Rutina con múltiples ejercicios",
        difficulty: "intermediate" as const,
        duration: 45,
        routine_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 1,
            name: "Push ups",
          },
          {
            exercise_id: 2,
            sets: 4,
            reps: 10,
            rest_time: 90,
            order: 2,
            name: "Pull ups",
          },
          {
            exercise_id: 3,
            sets: 3,
            reps: 15,
            rest_time: 45,
            order: 3,
            name: "Squats",
          },
        ],
      };
      const mockCreatedRoutine = {
        id: 2,
        name: "Rutina Completa",
        description: "Rutina con múltiples ejercicios",
        difficulty: "intermediate" as const,
        duration: 45,
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
      };
      const mockResponse = { data: mockCreatedRoutine };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.createRoutine(routineData);

      // Assert
      expect(result).toEqual(mockCreatedRoutine);
    });
  });

  describe("updateRoutine", () => {
    it("should update routine successfully", async () => {
      // Arrange
      const routineId = 1;
      const updateData = {
        name: "Rutina Actualizada",
        description: "Descripción actualizada",
        difficulty: "advanced" as const,
        duration: 60,
      };
      const mockUpdatedRoutine = {
        id: routineId,
        name: "Rutina Actualizada",
        description: "Descripción actualizada",
        difficulty: "advanced" as const,
        duration: 60,
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
      };
      const mockResponse = { data: mockUpdatedRoutine };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.updateRoutine(routineId, updateData);

      // Assert
      expect(result).toEqual(mockUpdatedRoutine);
    });

    it("should handle update of non-existent routine", async () => {
      // Arrange
      const routineId = 999;
      const updateData = {
        name: "Test Update",
        description: "Test",
        difficulty: "beginner" as const,
        duration: 30,
      };
      const mockError = new Error("Routine not found");
      mockApiClient.put.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(
        routineService.updateRoutine(routineId, updateData)
      ).rejects.toThrow("Routine not found");
    });

    it("should update routine with exercises", async () => {
      // Arrange
      const routineId = 1;
      const updateData = {
        name: "Rutina Modificada",
        description: "Descripción modificada",
        difficulty: "intermediate" as const,
        duration: 50,
        routine_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 4,
            reps: 8,
            rest_time: 90,
            order: 1,
            name: "Push ups",
          },
          {
            exercise_id: 3,
            sets: 3,
            reps: 20,
            rest_time: 30,
            order: 2,
            name: "Squats",
          },
        ],
      };
      const mockUpdatedRoutine = {
        id: routineId,
        name: "Rutina Modificada",
        description: "Descripción modificada",
        difficulty: "intermediate" as const,
        duration: 50,
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
      };
      const mockResponse = { data: mockUpdatedRoutine };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.updateRoutine(routineId, updateData);

      // Assert
      expect(result).toEqual(mockUpdatedRoutine);
    });
  });

  describe("deleteRoutine", () => {
    it("should delete routine successfully", async () => {
      // Arrange
      const routineId = 1;
      mockApiClient.delete.mockResolvedValueOnce({ data: null });

      // Act
      await routineService.deleteRoutine(routineId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/routines/${routineId}`
      );
    });

    it("should handle deletion of non-existent routine", async () => {
      // Arrange
      const routineId = 999;
      const mockError = new Error("Routine not found");
      mockApiClient.delete.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(routineService.deleteRoutine(routineId)).rejects.toThrow(
        "Routine not found"
      );
    });
  });

  describe("addExerciseToRoutine", () => {
    it("should add exercise to routine successfully", async () => {
      // Arrange
      const routineId = 1;
      const exerciseData = {
        exercise_id: 5,
        sets: 3,
        reps: 12,
        rest_time: 60,
        order: 1,
        name: "Squats",
      };
      const mockRoutineExercise = {
        id: 2,
        exercise_id: 5,
        sets: 3,
        reps: 12,
        rest_time: 60,
        order: 1,
        exercise: {
          id: 5,
          name: "Squats",
          description: "Lower body exercise",
          muscle_group: "legs",
          equipment: "bodyweight",
          instructions: [],
          video_url: null,
        },
      };
      const mockResponse = { data: mockRoutineExercise };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineService.addExerciseToRoutine(
        routineId,
        exerciseData
      );

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/routines/${routineId}/exercises`,
        { routine_exercise: exerciseData }
      );
      expect(result).toEqual(mockRoutineExercise);
    });

    it("should handle adding exercise to non-existent routine", async () => {
      // Arrange
      const routineId = 999;
      const exerciseData = {
        exercise_id: 1,
        sets: 3,
        reps: 12,
        rest_time: 60,
        order: 1,
        name: "Push ups",
      };
      const mockError = new Error("Routine not found");
      mockApiClient.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(
        routineService.addExerciseToRoutine(routineId, exerciseData)
      ).rejects.toThrow("Routine not found");
    });
  });

  describe("removeExerciseFromRoutine", () => {
    it("should remove exercise from routine successfully", async () => {
      // Arrange
      const routineId = 1;
      const exerciseId = 1;
      mockApiClient.delete.mockResolvedValueOnce({ data: null });

      // Act
      await routineService.removeExerciseFromRoutine(routineId, exerciseId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/routines/${routineId}/exercises/${exerciseId}`
      );
    });

    it("should handle removing exercise from non-existent routine", async () => {
      // Arrange
      const routineId = 999;
      const exerciseId = 1;
      const mockError = new Error("Routine not found");
      mockApiClient.delete.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(
        routineService.removeExerciseFromRoutine(routineId, exerciseId)
      ).rejects.toThrow("Routine not found");
    });
  });

  // Workout management tests
  describe("createWorkout", () => {
    it("should create workout successfully", async () => {
      const workoutData = {
        routine_id: 1,
        user_id: 1,
        status: "in_progress" as const,
        started_at: new Date().toISOString(),
      };
      const mockWorkout = { id: 1, ...workoutData };
      mockApiClient.post.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.createWorkout(workoutData);

      expect(mockApiClient.post).toHaveBeenCalledWith("/workouts", {
        workout: workoutData,
      });
      expect(result).toEqual(mockWorkout);
    });

    it("should handle create workout errors", async () => {
      const workoutData = { routine_id: 1 };
      const mockError = new Error("Creation failed");
      mockApiClient.post.mockRejectedValueOnce(mockError);

      await expect(routineService.createWorkout(workoutData)).rejects.toThrow(
        "Creation failed"
      );
    });
  });

  describe("pauseWorkout", () => {
    it("should pause workout successfully", async () => {
      const workoutId = 1;
      const reason = "Rest break";
      const mockWorkout = { id: workoutId, status: "paused" };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.pauseWorkout(workoutId, reason);

      expect(mockApiClient.put).toHaveBeenCalledWith("/workouts/1/pause", {
        reason,
      });
      expect(result).toEqual(mockWorkout);
    });

    it("should pause workout without reason", async () => {
      const workoutId = 1;
      const mockWorkout = { id: workoutId, status: "paused" };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.pauseWorkout(workoutId);

      expect(mockApiClient.put).toHaveBeenCalledWith("/workouts/1/pause", {
        reason: undefined,
      });
      expect(result).toEqual(mockWorkout);
    });

    it("should handle pause workout errors", async () => {
      const workoutId = 999;
      const mockError = new Error("Workout not found");
      mockApiClient.put.mockRejectedValueOnce(mockError);

      await expect(routineService.pauseWorkout(workoutId)).rejects.toThrow(
        "Workout not found"
      );
    });
  });

  describe("resumeWorkout", () => {
    it("should resume workout successfully", async () => {
      const workoutId = 1;
      const mockWorkout = { id: workoutId, status: "in_progress" };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.resumeWorkout(workoutId);

      expect(mockApiClient.put).toHaveBeenCalledWith("/workouts/1/resume", {});
      expect(result).toEqual(mockWorkout);
    });

    it("should handle resume workout errors", async () => {
      const workoutId = 999;
      const mockError = new Error("Workout not found");
      mockApiClient.put.mockRejectedValueOnce(mockError);

      await expect(routineService.resumeWorkout(workoutId)).rejects.toThrow(
        "Workout not found"
      );
    });
  });

  describe("completeWorkout", () => {
    it("should complete workout successfully with all data", async () => {
      const workoutId = 1;
      const completionData = {
        perceived_intensity: 8,
        energy_level: 7,
        mood: "good",
        notes: "Great workout!",
      };
      const mockWorkout = {
        id: workoutId,
        status: "completed" as const,
        ...completionData,
      };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.completeWorkout(
        workoutId,
        completionData
      );

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/workouts/1/complete",
        completionData
      );
      expect(result).toEqual(mockWorkout);
    });

    it("should complete workout with minimal data", async () => {
      const workoutId = 1;
      const completionData = { notes: "Finished" };
      const mockWorkout = { id: workoutId, status: "completed" };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.completeWorkout(
        workoutId,
        completionData
      );

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/workouts/1/complete",
        completionData
      );
      expect(result).toEqual(mockWorkout);
    });

    it("should handle complete workout errors", async () => {
      const workoutId = 999;
      const mockError = new Error("Workout not found");
      mockApiClient.put.mockRejectedValueOnce(mockError);

      await expect(
        routineService.completeWorkout(workoutId, {})
      ).rejects.toThrow("Workout not found");
    });
  });

  describe("abandonWorkout", () => {
    it("should abandon workout successfully", async () => {
      const workoutId = 1;
      const mockWorkout = { id: workoutId, status: "abandoned" };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.abandonWorkout(workoutId);

      expect(mockApiClient.put).toHaveBeenCalledWith("/workouts/1/abandon", {});
      expect(result).toEqual(mockWorkout);
    });

    it("should handle abandon workout errors", async () => {
      const workoutId = 999;
      const mockError = new Error("Workout not found");
      mockApiClient.put.mockRejectedValueOnce(mockError);

      await expect(routineService.abandonWorkout(workoutId)).rejects.toThrow(
        "Workout not found"
      );
    });
  });

  describe("updateWorkout", () => {
    it("should handle pause status update", async () => {
      const workoutId = 1;
      const workoutData = { status: "paused" as const };
      const mockWorkout = {
        id: workoutId,
        status: "paused" as const,
        routine_id: 1,
        routine_name: "Test Routine",
        date: "2024-01-01",
        start_time: "10:00:00",
        exercises: [],
      };

      // Mock pauseWorkout method
      const pauseWorkoutSpy = jest
        .spyOn(routineService, "pauseWorkout")
        .mockResolvedValue(mockWorkout);

      const result = await routineService.updateWorkout(workoutId, workoutData);

      expect(pauseWorkoutSpy).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(mockWorkout);

      pauseWorkoutSpy.mockRestore();
    });

    it("should handle resume status update", async () => {
      const workoutId = 1;
      const workoutData = { status: "in_progress" as const };
      const mockWorkout = {
        id: workoutId,
        status: "in_progress" as const,
        routine_id: 1,
        routine_name: "Test Routine",
        date: "2024-01-01",
        start_time: "10:00:00",
        exercises: [],
      };

      const resumeWorkoutSpy = jest
        .spyOn(routineService, "resumeWorkout")
        .mockResolvedValue(mockWorkout);

      const result = await routineService.updateWorkout(workoutId, workoutData);

      expect(resumeWorkoutSpy).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(mockWorkout);

      resumeWorkoutSpy.mockRestore();
    });

    it("should handle complete status update", async () => {
      const workoutId = 1;
      const workoutData = {
        status: "completed" as const,
        notes: "Great workout!",
      };
      const mockWorkout = {
        id: workoutId,
        status: "completed" as const,
        routine_id: 1,
        routine_name: "Test Routine",
        date: "2024-01-01",
        start_time: "10:00:00",
        exercises: [],
      };

      const completeWorkoutSpy = jest
        .spyOn(routineService, "completeWorkout")
        .mockResolvedValue(mockWorkout);

      const result = await routineService.updateWorkout(workoutId, workoutData);

      expect(completeWorkoutSpy).toHaveBeenCalledWith(workoutId, {
        notes: "Great workout!",
      });
      expect(result).toEqual(mockWorkout);

      completeWorkoutSpy.mockRestore();
    });

    it("should handle abandon status update", async () => {
      const workoutId = 1;
      const workoutData = { status: "abandoned" as const };
      const mockWorkout = {
        id: workoutId,
        status: "abandoned" as const,
        routine_id: 1,
        routine_name: "Test Routine",
        date: "2024-01-01",
        start_time: "10:00:00",
        exercises: [],
      };

      const abandonWorkoutSpy = jest
        .spyOn(routineService, "abandonWorkout")
        .mockResolvedValue(mockWorkout);

      const result = await routineService.updateWorkout(workoutId, workoutData);

      expect(abandonWorkoutSpy).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(mockWorkout);

      abandonWorkoutSpy.mockRestore();
    });

    it("should handle general workout update", async () => {
      const workoutId = 1;
      const workoutData = { notes: "Updated notes", duration: 60 };
      const mockWorkout = { id: workoutId, ...workoutData };
      mockApiClient.put.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.updateWorkout(workoutId, workoutData);

      expect(mockApiClient.put).toHaveBeenCalledWith("/workouts/1", {
        workout: workoutData,
      });
      expect(result).toEqual(mockWorkout);
    });

    it("should handle update workout errors", async () => {
      const workoutId = 999;
      const workoutData = { notes: "test" };
      const mockError = new Error("Update failed");
      mockApiClient.put.mockRejectedValueOnce(mockError);

      await expect(
        routineService.updateWorkout(workoutId, workoutData)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("getWorkouts", () => {
    it("should fetch all workouts successfully", async () => {
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkouts });

      const result = await routineService.getWorkouts();

      expect(mockApiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toEqual(mockWorkouts);
    });

    it("should handle get workouts errors", async () => {
      const mockError = new Error("Failed to fetch workouts");
      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(routineService.getWorkouts()).rejects.toThrow(
        "Failed to fetch workouts"
      );
    });
  });

  describe("getWorkout", () => {
    it("should fetch specific workout successfully", async () => {
      const workoutId = 1;
      const mockWorkout = {
        id: workoutId,
        routine_id: 1,
        routine_name: "Push Day",
        date: "2024-01-01",
        start_time: "09:00:00",
        status: "completed" as const,
        exercises: [],
      };
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkout });

      const result = await routineService.getWorkout(workoutId);

      expect(mockApiClient.get).toHaveBeenCalledWith("/workouts/1");
      expect(result).toEqual(mockWorkout);
    });

    it("should handle get workout errors", async () => {
      const workoutId = 999;
      const mockError = new Error("Workout not found");
      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(routineService.getWorkout(workoutId)).rejects.toThrow(
        "Workout not found"
      );
    });
  });

  describe("getWorkoutsByRoutine", () => {
    it("should fetch workouts for specific routine successfully", async () => {
      const routineId = 1;
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "paused" as const,
          exercises: [],
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkouts });

      const result = await routineService.getWorkoutsByRoutine(routineId);

      expect(mockApiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toEqual([
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "paused" as const,
          exercises: [],
        },
      ]);
    });

    it("should return empty array when no workouts found for routine", async () => {
      const routineId = 999;
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkouts });

      const result = await routineService.getWorkoutsByRoutine(routineId);

      expect(result).toEqual([]);
    });

    it("should handle get workouts by routine errors", async () => {
      const routineId = 1;
      const mockError = new Error("Failed to fetch workouts");
      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(
        routineService.getWorkoutsByRoutine(routineId)
      ).rejects.toThrow("Failed to fetch workouts");
    });
  });

  describe("isRoutineInUse", () => {
    it("should return true when routine has active workouts", async () => {
      const routineId = 1;
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "paused" as const,
          exercises: [],
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkouts });

      const result = await routineService.isRoutineInUse(routineId);

      expect(mockApiClient.get).toHaveBeenCalledWith("/workouts");
      expect(result).toBe(true);
    });

    it("should return false when routine has no active workouts", async () => {
      const routineId = 1;
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "abandoned" as const,
          exercises: [],
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkouts });

      const result = await routineService.isRoutineInUse(routineId);

      expect(result).toBe(false);
    });

    it("should return false when routine has no workouts", async () => {
      const routineId = 999;
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 3,
          routine_name: "Leg Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "abandoned" as const,
          exercises: [],
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockWorkouts });

      const result = await routineService.isRoutineInUse(routineId);

      expect(result).toBe(false);
    });

    it("should handle is routine in use errors", async () => {
      const routineId = 1;
      const mockError = new Error("Failed to check routine usage");
      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(routineService.isRoutineInUse(routineId)).rejects.toThrow(
        "Failed to check routine usage"
      );
    });
  });

  describe("getActiveWorkouts", () => {
    it("should fetch active workouts successfully", async () => {
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "paused" as const,
          exercises: [],
        },
        {
          id: 4,
          routine_id: 3,
          routine_name: "Leg Day",
          date: "2024-01-04",
          start_time: "12:00:00",
          status: "abandoned" as const,
          exercises: [],
        },
      ];

      const getWorkoutsSpy = jest
        .spyOn(routineService, "getWorkouts")
        .mockResolvedValue(mockWorkouts);

      const result = await routineService.getActiveWorkouts();

      expect(getWorkoutsSpy).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "in_progress" as const,
          exercises: [],
        },
        {
          id: 3,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-03",
          start_time: "11:00:00",
          status: "paused" as const,
          exercises: [],
        },
      ]);

      getWorkoutsSpy.mockRestore();
    });

    it("should return empty array when no active workouts", async () => {
      const mockWorkouts = [
        {
          id: 1,
          routine_id: 1,
          routine_name: "Push Day",
          date: "2024-01-01",
          start_time: "09:00:00",
          status: "completed" as const,
          exercises: [],
        },
        {
          id: 2,
          routine_id: 2,
          routine_name: "Pull Day",
          date: "2024-01-02",
          start_time: "10:00:00",
          status: "abandoned" as const,
          exercises: [],
        },
      ];

      const getWorkoutsSpy = jest
        .spyOn(routineService, "getWorkouts")
        .mockResolvedValue(mockWorkouts);

      const result = await routineService.getActiveWorkouts();

      expect(result).toEqual([]);

      getWorkoutsSpy.mockRestore();
    });

    it("should handle get active workouts errors", async () => {
      const mockError = new Error("Failed to fetch workouts");
      const getWorkoutsSpy = jest
        .spyOn(routineService, "getWorkouts")
        .mockRejectedValue(mockError);

      await expect(routineService.getActiveWorkouts()).rejects.toThrow(
        "Failed to fetch workouts"
      );

      getWorkoutsSpy.mockRestore();
    });
  });
});
