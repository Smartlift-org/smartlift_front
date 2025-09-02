import routineModificationService from "../../services/routineModificationService";
import { apiClient } from "../../services/apiClient";

// Mock dependencies
jest.mock("../../services/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("RoutineModificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserAIRoutines", () => {
    it("should fetch AI routines successfully", async () => {
      // Arrange
      const mockRoutines = [
        {
          id: 1,
          name: "Rutina IA 1",
          description: "Rutina generada por IA",
          ai_generated: true,
          difficulty: "intermediate",
          duration: 45,
        },
        {
          id: 2,
          name: "Rutina Manual",
          description: "Rutina manual",
          ai_generated: false,
          difficulty: "beginner",
          duration: 30,
        },
        {
          id: 3,
          name: "Rutina IA 2",
          description: "Otra rutina IA",
          ai_generated: true,
          difficulty: "advanced",
          duration: 60,
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockRoutines });

      // Act
      const result = await routineModificationService.getUserAIRoutines();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/routines");
      expect(result).toHaveLength(2); // Solo las AI routines
      expect(result[0].ai_generated).toBe(true);
      expect(result[1].ai_generated).toBe(true);
    });

    it("should return empty array when no AI routines", async () => {
      // Arrange
      const mockRoutines = [
        {
          id: 1,
          name: "Rutina Manual",
          ai_generated: false,
        },
      ];
      mockApiClient.get.mockResolvedValueOnce({ data: mockRoutines });

      // Act
      const result = await routineModificationService.getUserAIRoutines();

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle 401 error", async () => {
      // Arrange
      const error = { response: { status: 401 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getUserAIRoutines()
      ).rejects.toThrow("No hay token de autenticación");
    });

    it("should handle 404 error", async () => {
      // Arrange
      const error = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getUserAIRoutines()
      ).rejects.toThrow("No se encontraron rutinas");
    });

    it("should handle generic error with response data", async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          data: { error: "Server error" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getUserAIRoutines()
      ).rejects.toThrow("Server error");
    });

    it("should handle generic error without response data", async () => {
      // Arrange
      const error = new Error("Network error");
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getUserAIRoutines()
      ).rejects.toThrow("Network error");
    });
  });

  describe("modifyExercises", () => {
    it("should modify exercises successfully", async () => {
      // Arrange
      const payload = {
        user_message: "Hacer los ejercicios más fáciles",
        exercises: [
          {
            name: "Push ups",
            sets: 3,
            reps: 10,
            rest_time: 60,
            order: 1,
          },
        ],
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            exercises: [
              {
                exercise_id: 1,
                sets: 2,
                reps: 8,
                rest_time: 60,
              },
            ],
          },
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineModificationService.modifyExercises(payload);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/ai/workout_routines/modify",
        payload
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle 503 service unavailable", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const error = { response: { status: 503 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("Servicio de IA temporalmente no disponible");
    });

    it("should handle response.data.success false", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const mockResponse = {
        data: {
          success: false,
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("Error al modificar los ejercicios");
    });

    it("should handle 400 error with non-array details", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const error = {
        response: {
          status: 400,
          data: {
            details: {
              user_message: "invalid message",
            },
          },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("Datos inválidos: user_message: invalid message");
    });

    it("should handle 400 error with details as non-object", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const error = {
        response: {
          status: 400,
          data: {
            details: "invalid details format",
          },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("Datos de modificación inválidos");
    });

    it("should handle 400 error with null details", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const error = {
        response: {
          status: 400,
          data: {
            details: null,
          },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("Datos de modificación inválidos");
    });

    it("should handle 422 error", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const error = { response: { status: 422 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("Servicio de IA devolvió respuesta inválida");
    });

    it("should handle 401 error", async () => {
      // Arrange
      const payload = { user_message: "test", exercises: [] };
      const error = { response: { status: 401 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyExercises(payload)
      ).rejects.toThrow("No hay token de autenticación");
    });
  });

  describe("modifyRoutine", () => {
    it("should modify routine successfully", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [
            {
              exercise_id: 1,
              sets: 3,
              reps: 10,
              rest_time: 60,
              order: 1,
              needs_modification: false,
            },
          ],
        },
        modification_message: "Hacer más difícil",
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            routine: {
              name: "Modified Routine",
              description: "Modified description",
              difficulty: "advanced",
              duration: 60,
            },
          },
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineModificationService.modifyRoutine(payload);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/ai/workout_routines/modify",
        payload
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle validation errors", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "",
          routine_exercises_attributes: [],
        },
        modification_message: "",
      } as any;
      const error = {
        response: {
          status: 400,
          data: {
            details: {
              routine: ["is required"],
              modification_message: ["cannot be empty"],
            },
          },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyRoutine(payload)
      ).rejects.toThrow(
        "Datos inválidos: routine: is required; modification_message: cannot be empty"
      );
    });

    it("should handle 400 error with non-object details in modifyRoutine", async () => {
      // Test case to cover line 111 branch
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Test modification",
      };
      const error = {
        response: {
          status: 400,
          data: {
            details: "invalid details format",
          },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyRoutine(payload)
      ).rejects.toThrow("Datos de modificación inválidos");
    });

    it("should handle response.data.success false in modifyRoutine", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Test modification",
      };
      const mockResponse = {
        data: {
          success: false,
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        routineModificationService.modifyRoutine(payload)
      ).rejects.toThrow("Error al modificar la rutina");
    });

    it("should handle 422 error in modifyRoutine", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Test modification",
      };
      const error = { response: { status: 422 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyRoutine(payload)
      ).rejects.toThrow("Servicio de IA devolvió respuesta inválida");
    });

    it("should handle 503 error in modifyRoutine", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Test modification",
      };
      const error = { response: { status: 503 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyRoutine(payload)
      ).rejects.toThrow("Servicio de IA temporalmente no disponible");
    });

    it("should handle 401 error in modifyRoutine", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Test modification",
      };
      const error = { response: { status: 401 } };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.modifyRoutine(payload)
      ).rejects.toThrow("No hay token de autenticación");
    });
  });

  describe("getRoutineDetails", () => {
    it("should fetch routine details successfully", async () => {
      // Arrange
      const routineId = 1;
      const mockRoutine = {
        id: routineId,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate",
        duration: 45,
        routine_exercises: [],
      };
      mockApiClient.get.mockResolvedValueOnce({ data: mockRoutine });

      // Act
      const result = await routineModificationService.getRoutineDetails(
        routineId
      );

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/routines/${routineId}`);
      expect(result).toEqual(mockRoutine);
    });

    it("should handle routine not found", async () => {
      // Arrange
      const routineId = 999;
      const error = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getRoutineDetails(routineId)
      ).rejects.toThrow("Rutina no encontrada");
    });

    it("should handle generic error in getRoutineDetails", async () => {
      // Arrange - to cover line 135
      const routineId = 1;
      const error = {
        response: {
          status: 500,
          data: { error: "Server error" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getRoutineDetails(routineId)
      ).rejects.toThrow("Server error");
    });

    it("should handle network error in getRoutineDetails", async () => {
      // Arrange - to cover line 135 else branch
      const routineId = 1;
      const error = new Error("Network timeout");
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.getRoutineDetails(routineId)
      ).rejects.toThrow("Network timeout");
    });
  });

  describe("saveModifiedRoutine", () => {
    it("should save new routine successfully", async () => {
      // Arrange
      const routineData = {
        name: "New Routine",
        description: "New description",
        difficulty: "beginner",
        duration: 30,
        routine_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 3,
            reps: 10,
            rest_time: 60,
            order: 1,
          },
        ],
      };
      const mockResponse = { data: { id: 1, ...routineData } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineModificationService.saveModifiedRoutine(
        routineData
      );

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith("/routines", {
        routine: expect.objectContaining({
          name: "New Routine",
          description: "New description",
          difficulty: "beginner",
          duration: 30,
        }),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should update existing routine successfully", async () => {
      // Arrange
      const routineId = 1;
      const routineData = {
        name: "Updated Routine",
        description: "Updated description",
        difficulty: "intermediate",
        duration: 45,
      };
      const mockResponse = { data: { id: routineId, ...routineData } };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await routineModificationService.saveModifiedRoutine(
        routineData,
        routineId
      );

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(`/routines/${routineId}`, {
        routine: expect.objectContaining({
          name: "Updated Routine",
          description: "Updated description",
        }),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle validation errors", async () => {
      // Arrange
      const routineData = { name: "" };
      const error = {
        response: {
          status: 422,
          data: { errors: ["Name cannot be blank"] },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutine(routineData)
      ).rejects.toThrow("Error de validación: Name cannot be blank");
    });

    it("should handle 404 error in saveModifiedRoutine", async () => {
      // Arrange
      const routineData = { name: "Test Routine" };
      const routineId = 999;
      const error = { response: { status: 404 } };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutine(routineData, routineId)
      ).rejects.toThrow("Rutina no encontrada para actualizar");
    });

    it("should handle 422 error with non-array errors", async () => {
      // Arrange
      const routineData = { name: "" };
      const error = {
        response: {
          status: 422,
          data: { errors: "Name cannot be blank" },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutine(routineData)
      ).rejects.toThrow("Error de validación: Datos de rutina inválidos para guardar");
    });

    it("should handle generic error in saveModifiedRoutine", async () => {
      // Arrange - to cover line 196
      const routineData = { name: "Test Routine" };
      const error = {
        response: {
          status: 500,
          data: { error: "Database error" },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutine(routineData)
      ).rejects.toThrow("Database error");
    });

    it("should handle network error in saveModifiedRoutine", async () => {
      // Arrange - to cover line 196 else branch
      const routineData = { name: "Test Routine" };
      const error = new Error("Connection failed");
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutine(routineData)
      ).rejects.toThrow("Connection failed");
    });
  });

  describe("cleanRoutineForAI", () => {
    it("should clean routine data for AI processing", () => {
      // Arrange
      const routine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate",
        duration: 45,
        user_id: 1,
        created_at: "2024-01-01",
        routine_exercises: [
          {
            id: 1,
            exercise_id: 10,
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 1,
            exercise: {
              id: 10,
              name: "Push ups",
              description: "Chest exercise",
            },
            needs_modification: true,
          },
          {
            id: 2,
            exercise_id: 20,
            sets: 4,
            reps: 8,
            rest_time: 90,
            order: 2,
            exercise: {
              id: 20,
              name: "Pull ups",
              description: "Back exercise",
            },
          },
        ],
      };

      // Act
      const result = routineModificationService.cleanRoutineForAI(routine);

      // Assert
      expect(result).toEqual({
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate",
        duration: 45,
        routine_exercises_attributes: [
          {
            exercise_id: 10,
            name: "Push ups",
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 1,
            needs_modification: true,
          },
          {
            exercise_id: 20,
            name: "Pull ups",
            sets: 4,
            reps: 8,
            rest_time: 90,
            order: 2,
            needs_modification: false,
          },
        ],
      });
    });

    it("should handle routine with no exercises", () => {
      // Arrange
      const routine = {
        name: "Empty Routine",
        description: "No exercises",
        difficulty: "beginner",
        duration: 30,
        routine_exercises: null,
      };

      // Act
      const result = routineModificationService.cleanRoutineForAI(routine);

      // Assert
      expect(result).toEqual({
        name: "Empty Routine",
        description: "No exercises",
        difficulty: "beginner",
        duration: 30,
        routine_exercises_attributes: [],
      });
    });
  });

  describe("mergeAIResponseWithOriginal", () => {
    it("should merge AI response with original routine", () => {
      // Arrange
      const aiResponse = {
        routine: {
          name: "Modified Routine",
          description: "AI modified description",
          difficulty: "advanced",
          duration: 60,
          routine_exercises_attributes: [
            {
              exercise_id: 1,
              sets: 4,
              reps: 10,
              rest_time: 75,
            },
          ],
        },
      };
      const originalRoutine = {
        id: 1,
        user_id: 123,
        created_at: "2024-01-01T00:00:00Z",
        name: "Original Routine",
        description: "Original description",
      };

      // Act
      const result = routineModificationService.mergeAIResponseWithOriginal(
        aiResponse,
        originalRoutine
      );

      // Assert
      expect(result).toEqual({
        id: 1,
        user_id: 123,
        created_at: "2024-01-01T00:00:00Z",
        name: "Modified Routine",
        description: "AI modified description",
        difficulty: "advanced",
        duration: 60,
        source_type: "ai_generated",
        ai_generated: true,
        validation_status: "pending",
        routine_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 4,
            reps: 10,
            rest_time: 75,
            order: 1,
          },
        ],
      });
    });

    it("should handle AI response without nested routine object", () => {
      // Arrange
      const aiResponse = {
        name: "Direct Response",
        description: "Direct description",
        difficulty: "beginner",
        duration: 30,
        routine_exercises_attributes: [],
      };
      const originalRoutine = {
        id: 2,
        user_id: 456,
        created_at: "2024-01-02T00:00:00Z",
      };

      // Act
      const result = routineModificationService.mergeAIResponseWithOriginal(
        aiResponse,
        originalRoutine
      );

      // Assert
      expect(result).toEqual({
        id: 2,
        user_id: 456,
        created_at: "2024-01-02T00:00:00Z",
        name: "Direct Response",
        description: "Direct description",
        difficulty: "beginner",
        duration: 30,
        source_type: "ai_generated",
        ai_generated: true,
        validation_status: "pending",
        routine_exercises_attributes: [],
      });
    });
  });

  describe("saveModifiedRoutineWithReplacement", () => {
    it("should save routine with exercise replacement successfully", async () => {
      // Arrange
      const routineUpdateData = {
        name: "Updated Routine",
        description: "Updated description",
        difficulty: "intermediate",
        duration: 50,
        selectedExerciseIds: [1, 2],
        newExercises: [
          {
            exercise_id: 10,
            sets: 3,
            reps: 12,
            rest_time: 60,
          },
          {
            exercise_id: 11,
            sets: 4,
            reps: 8,
            rest_time: 90,
          },
        ],
      };
      const originalRoutine = {
        id: 1,
        name: "Original Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };

      const updatedRoutineResponse = {
        data: {
          routine_exercises: [
            { id: 3, order: 3 },
            { id: 4, order: 5 },
          ],
        },
      };
      const finalResponse = { data: { id: 1, name: "Final Routine" } };

      mockApiClient.put
        .mockResolvedValueOnce({ data: null }) // Delete step
        .mockResolvedValueOnce(finalResponse); // Add step
      mockApiClient.get.mockResolvedValueOnce(updatedRoutineResponse);

      // Act
      const result =
        await routineModificationService.saveModifiedRoutineWithReplacement(
          routineUpdateData,
          originalRoutine
        );

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledTimes(2);
      expect(mockApiClient.get).toHaveBeenCalledWith("/routines/1");
      expect(result).toEqual(finalResponse.data);
    });

    it("should handle validation errors during replacement", async () => {
      // Arrange
      const routineUpdateData = {
        selectedExerciseIds: [1],
        newExercises: [{ exercise_id: 10, sets: 0 }], // Invalid sets
      };
      const originalRoutine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };
      const error = {
        response: {
          status: 422,
          data: { errors: ["Sets must be greater than 0"] },
        },
      };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutineWithReplacement(
          routineUpdateData,
          originalRoutine
        )
      ).rejects.toThrow("Error de validación: Sets must be greater than 0");
    });

    it("should handle non-array error details in saveModifiedRoutineWithReplacement", async () => {
      // Arrange
      const routineUpdateData = {
        selectedExerciseIds: [1],
        newExercises: [{ exercise_id: 10, sets: 1 }],
      };
      const originalRoutine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };
      const error = {
        response: {
          status: 422,
          data: { errors: "Exercise validation failed" },
        },
      };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutineWithReplacement(
          routineUpdateData,
          originalRoutine
        )
      ).rejects.toThrow("Error de validación: Error de validación al reemplazar ejercicios");
    });

    it("should handle generic error in saveModifiedRoutineWithReplacement", async () => {
      // Arrange - to cover line 355
      const routineUpdateData = {
        selectedExerciseIds: [1],
        newExercises: [{ exercise_id: 10, sets: 1 }],
      };
      const originalRoutine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };
      const error = {
        response: {
          status: 500,
          data: { error: "Internal server error" },
        },
      };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutineWithReplacement(
          routineUpdateData,
          originalRoutine
        )
      ).rejects.toThrow("Internal server error");
    });

    it("should handle network error in saveModifiedRoutineWithReplacement", async () => {
      // Arrange - to cover line 355 else branch
      const routineUpdateData = {
        selectedExerciseIds: [1],
        newExercises: [{ exercise_id: 10, sets: 1 }],
      };
      const originalRoutine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };
      const error = new Error("Network connection failed");
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        routineModificationService.saveModifiedRoutineWithReplacement(
          routineUpdateData,
          originalRoutine
        )
      ).rejects.toThrow("Network connection failed");
    });

    it("should handle findAvailableOrders with many needed orders", async () => {
      // Arrange - to cover lines 309-310 (the while loop that fills remaining orders)
      const routineUpdateData = {
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate",
        duration: 45,
        selectedExerciseIds: [1, 2],
        newExercises: [
          { exercise_id: 10, sets: 3, reps: 12, rest_time: 60 },
          { exercise_id: 11, sets: 4, reps: 8, rest_time: 90 },
          { exercise_id: 12, sets: 2, reps: 15, rest_time: 45 },
          { exercise_id: 13, sets: 3, reps: 10, rest_time: 75 },
        ],
      };
      const originalRoutine = {
        id: 1,
        name: "Original Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };

      // Mock responses: delete step, get updated routine with sparse orders, final save
      const updatedRoutineResponse = {
        data: {
          routine_exercises: [
            { id: 3, order: 1 },  // Existing exercise at order 1
            { id: 4, order: 3 },  // Existing exercise at order 3
            // Orders 2, 4, 5, 6 should be available for the 4 new exercises
          ],
        },
      };
      const finalResponse = { data: { id: 1, name: "Final Routine" } };

      mockApiClient.put
        .mockResolvedValueOnce({ data: null })  // Delete step
        .mockResolvedValueOnce(finalResponse);  // Add step
      mockApiClient.get.mockResolvedValueOnce(updatedRoutineResponse);

      // Act
      const result = await routineModificationService.saveModifiedRoutineWithReplacement(
        routineUpdateData,
        originalRoutine
      );

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledTimes(2);
      expect(result).toEqual(finalResponse.data);
    });
  });

  describe("modifyExercisesAndSaveRoutine", () => {
    it("should modify exercises and save routine successfully", async () => {
      // Arrange
      const routine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };
      const selectedExercises = [
        {
          id: 1,
          exercise_id: 10,
          sets: 3,
          reps: 12,
          rest_time: 60,
          order: 1,
          exercise: {
            id: 10,
            name: "Push ups",
            primary_muscles: "Chest",
            images: [],
            difficulty_level: "beginner",
          },
        },
        {
          id: 2,
          exercise_id: 11,
          sets: 4,
          reps: 8,
          rest_time: 90,
          order: 2,
          exercise: {
            id: 11,
            name: "Pull ups",
            primary_muscles: "Back",
            images: [],
            difficulty_level: "intermediate",
          },
        },
      ];
      const userMessage = "Make exercises easier";

      const mockAiResponse = {
        success: true,
        data: {
          exercises: [
            {
              exercise_id: 12,
              sets: 2,
              reps: 8,
              rest_time: 60,
              name: "Modified Push ups",
              order: 1,
              group_type: "strength",
              group_order: 1,
              weight: 0,
            },
            {
              exercise_id: 13,
              sets: 3,
              reps: 6,
              rest_time: 90,
              name: "Modified Pull ups",
              order: 2,
              group_type: "strength",
              group_order: 2,
              weight: 0,
            },
          ],
          generated_at: "2024-01-01T00:00:00Z",
        },
      };
      const mockSavedRoutine = {
        id: 1,
        name: "Modified Routine",
        description: "Modified description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };

      // Mock the method calls
      jest
        .spyOn(routineModificationService, "modifyExercises")
        .mockResolvedValueOnce(mockAiResponse);
      jest
        .spyOn(routineModificationService, "saveModifiedRoutineWithReplacement")
        .mockResolvedValueOnce(mockSavedRoutine);

      // Act
      const result =
        await routineModificationService.modifyExercisesAndSaveRoutine(
          routine,
          selectedExercises,
          userMessage
        );

      // Assert
      expect(routineModificationService.modifyExercises).toHaveBeenCalledWith({
        user_message: "Make exercises easier",
        exercises: [
          { name: "Push ups", sets: 3, reps: 12, rest_time: 60, order: 1 },
          { name: "Pull ups", sets: 4, reps: 8, rest_time: 90, order: 2 },
        ],
      });
      expect(
        routineModificationService.saveModifiedRoutineWithReplacement
      ).toHaveBeenCalled();
      expect(result).toEqual(mockSavedRoutine);
    });

    it("should handle errors during exercise modification", async () => {
      // Arrange
      const routine = {
        id: 1,
        name: "Test Routine",
        description: "Test description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };
      const selectedExercises = [
        {
          id: 1,
          exercise_id: 10,
          sets: 3,
          reps: 12,
          rest_time: 60,
          order: 1,
          exercise: {
            id: 10,
            name: "Push ups",
            primary_muscles: "Chest",
            images: [],
            difficulty_level: "beginner",
          },
        },
      ];
      const userMessage = "Invalid modification";

      jest
        .spyOn(routineModificationService, "modifyExercises")
        .mockRejectedValueOnce(new Error("AI service error"));

      // Act & Assert
      await expect(
        routineModificationService.modifyExercisesAndSaveRoutine(
          routine,
          selectedExercises,
          userMessage
        )
      ).rejects.toThrow("AI service error");
    });
  });

  describe("replaceExercisesInRoutine", () => {
    it("should replace exercises in routine correctly", () => {
      // Arrange
      const originalRoutine = {
        id: 1,
        user: { id: 123, first_name: "John", last_name: "Doe" },
        name: "Original Routine",
        description: "Original description",
        difficulty: "intermediate" as const,
        duration: 45,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        routine_exercises: [
          {
            id: 1,
            exercise_id: 1,
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 1,
            exercise: {
              id: 1,
              name: "Exercise 1",
              primary_muscles: "Chest",
              images: [],
              difficulty_level: "beginner",
            },
          },
          {
            id: 2,
            exercise_id: 2,
            sets: 4,
            reps: 8,
            rest_time: 90,
            order: 2,
            exercise: {
              id: 2,
              name: "Exercise 2",
              primary_muscles: "Back",
              images: [],
              difficulty_level: "intermediate",
            },
          },
          {
            id: 3,
            exercise_id: 3,
            sets: 2,
            reps: 15,
            rest_time: 45,
            order: 3,
            exercise: {
              id: 3,
              name: "Exercise 3",
              primary_muscles: "Legs",
              images: [],
              difficulty_level: "advanced",
            },
          },
        ],
      };
      const originalExercises = [
        {
          id: 2,
          exercise_id: 2,
          sets: 4,
          reps: 8,
          rest_time: 90,
          order: 2,
          exercise: {
            id: 2,
            name: "Exercise 2",
            primary_muscles: "Back",
            images: [],
            difficulty_level: "intermediate",
          },
        },
      ];
      const newExercises = [
        {
          id: 10,
          exercise_id: 10,
          sets: 3,
          reps: 10,
          rest_time: 75,
          order: 1,
          exercise: {
            id: 10,
            name: "Exercise 10",
            primary_muscles: "Arms",
            images: [],
            difficulty_level: "beginner",
          },
        },
        {
          id: 11,
          exercise_id: 11,
          sets: 4,
          reps: 12,
          rest_time: 60,
          order: 2,
          exercise: {
            id: 11,
            name: "Exercise 11",
            primary_muscles: "Shoulders",
            images: [],
            difficulty_level: "intermediate",
          },
        },
      ];

      // Act
      const result = routineModificationService.replaceExercisesInRoutine(
        originalRoutine,
        originalExercises,
        newExercises
      );

      // Assert
      expect(result).toEqual({
        id: 1,
        user_id: 123,
        name: "Original Routine",
        description: "Original description",
        difficulty: "intermediate",
        duration: 45,
        source_type: "ai_generated",
        ai_generated: true,
        validation_status: "pending",
        routine_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 1,
            _destroy: false,
          },
          {
            exercise_id: 3,
            sets: 2,
            reps: 15,
            rest_time: 45,
            order: 2,
            _destroy: false,
          },
          {
            exercise_id: 10,
            sets: 3,
            reps: 10,
            rest_time: 75,
            order: 3,
            _destroy: false,
          },
          {
            exercise_id: 11,
            sets: 4,
            reps: 12,
            rest_time: 60,
            order: 4,
            _destroy: false,
          },
        ],
      });
    });

    it("should handle replacing all exercises", () => {
      // Arrange
      const originalRoutine = {
        id: 1,
        user: { id: 123, first_name: "John", last_name: "Doe" },
        name: "Test Routine",
        description: "Test description",
        difficulty: "beginner" as const,
        duration: 30,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        routine_exercises: [
          { 
            id: 1,
            exercise_id: 1, 
            sets: 3, 
            reps: 12, 
            rest_time: 60,
            order: 1,
            exercise: {
              id: 1,
              name: "Push-ups",
              primary_muscles: "Chest",
              images: [],
              difficulty_level: "beginner"
            }
          },
          { 
            id: 2,
            exercise_id: 2, 
            sets: 4, 
            reps: 8, 
            rest_time: 90,
            order: 2,
            exercise: {
              id: 2,
              name: "Squats",
              primary_muscles: "Legs",
              images: [],
              difficulty_level: "beginner"
            }
          },
        ],
      };
      const originalExercises = [
        { 
          id: 1,
          exercise_id: 1, 
          sets: 3, 
          reps: 12, 
          rest_time: 60,
          order: 1,
          exercise: {
            id: 1,
            name: "Push-ups",
            primary_muscles: "Chest",
            images: [],
            difficulty_level: "beginner"
          }
        },
        { 
          id: 2,
          exercise_id: 2, 
          sets: 4, 
          reps: 8, 
          rest_time: 90,
          order: 2,
          exercise: {
            id: 2,
            name: "Squats",
            primary_muscles: "Legs",
            images: [],
            difficulty_level: "beginner"
          }
        },
      ];
      const newExercises = [
        { 
          id: 10,
          exercise_id: 10, 
          sets: 2, 
          reps: 10, 
          rest_time: 45,
          order: 1,
          exercise: {
            id: 10,
            name: "Burpees",
            primary_muscles: "Full Body",
            images: [],
            difficulty_level: "intermediate"
          }
        },
      ];

      // Act
      const result = routineModificationService.replaceExercisesInRoutine(
        originalRoutine,
        originalExercises,
        newExercises
      );

      // Assert
      expect(result.routine_exercises_attributes).toEqual([
        {
          exercise_id: 10,
          sets: 2,
          reps: 10,
          rest_time: 45,
          order: 1,
          _destroy: false,
        },
      ]);
    });
  });

  describe("modifyAndSaveRoutine", () => {
    it("should modify and save routine successfully", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Original Routine",
          routine_exercises_attributes: [
            {
              exercise_id: 1,
              sets: 3,
              reps: 12,
              rest_time: 60,
              order: 1,
              needs_modification: false,
            },
          ],
        },
        modification_message: "Make it more challenging",
      };
      const originalRoutineId = 1;

      const mockAiResponse = {
        success: true,
        data: {
          routines: [
            {
              routine: {
                id: 1,
                name: "Modified Routine",
                description: "AI modified description",
                difficulty: "advanced" as const,
                duration: 60,
                ai_generated: true,
                validation_status: "pending" as const,
                created_at: "2024-01-01T00:00:00Z",
                formatted_created_at: "2024-01-01",
                formatted_updated_at: "2024-01-01",
                user: { id: 1, first_name: "John", last_name: "Doe" },
                routine_exercises: [],
              },
            },
          ],
          generated_at: "2024-01-01T00:00:00Z",
        },
      };
      const mockSavedRoutine = {
        id: 1,
        name: "Saved Modified Routine",
        description: "Saved description",
        difficulty: "advanced" as const,
        duration: 60,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };

      // Mock method calls
      jest
        .spyOn(routineModificationService, "cleanRoutineForAI")
        .mockReturnValueOnce({
          name: "Original Routine",
          routine_exercises_attributes: [],
        });
      jest
        .spyOn(routineModificationService, "modifyRoutine")
        .mockResolvedValueOnce(mockAiResponse);
      jest
        .spyOn(routineModificationService, "mergeAIResponseWithOriginal")
        .mockReturnValueOnce({
          id: 1,
          name: "Modified Routine",
          ai_generated: true,
        });
      jest
        .spyOn(routineModificationService, "saveModifiedRoutine")
        .mockResolvedValueOnce(mockSavedRoutine);

      // Act
      const result = await routineModificationService.modifyAndSaveRoutine(
        payload,
        originalRoutineId
      );

      // Assert
      expect(routineModificationService.cleanRoutineForAI).toHaveBeenCalledWith(
        payload.routine
      );
      expect(routineModificationService.modifyRoutine).toHaveBeenCalled();
      expect(
        routineModificationService.mergeAIResponseWithOriginal
      ).toHaveBeenCalled();
      expect(
        routineModificationService.saveModifiedRoutine
      ).toHaveBeenCalledWith(expect.any(Object), originalRoutineId);
      expect(result).toEqual({
        modifiedRoutine: mockSavedRoutine,
        aiResponse: mockAiResponse,
      });
    });

    it("should handle errors during modification and save", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Invalid modification",
      };

      jest
        .spyOn(routineModificationService, "cleanRoutineForAI")
        .mockReturnValueOnce({});
      jest
        .spyOn(routineModificationService, "modifyRoutine")
        .mockRejectedValueOnce(new Error("AI modification failed"));

      // Act & Assert
      await expect(
        routineModificationService.modifyAndSaveRoutine(payload)
      ).rejects.toThrow("AI modification failed");
    });

    it("should handle alternative AI response structure", async () => {
      // Arrange
      const payload = {
        routine: {
          name: "Test Routine",
          routine_exercises_attributes: [],
        },
        modification_message: "Test modification",
      };

      const mockAiResponse = {
        success: true,
        data: {
          routines: [
            {
              routine: {
                id: 1,
                name: "Direct Modified Routine",
                description: "Direct description",
                difficulty: "advanced" as const,
                duration: 60,
                ai_generated: true,
                validation_status: "pending" as const,
                created_at: "2024-01-01T00:00:00Z",
                formatted_created_at: "2024-01-01",
                formatted_updated_at: "2024-01-01",
                user: { id: 1, first_name: "John", last_name: "Doe" },
                routine_exercises: [],
              },
            },
          ],
          generated_at: "2024-01-01T00:00:00Z",
        },
      };
      const mockSavedRoutine = {
        id: 1,
        name: "Saved Routine",
        description: "Saved description",
        difficulty: "advanced" as const,
        duration: 60,
        ai_generated: true,
        validation_status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        formatted_created_at: "2024-01-01",
        formatted_updated_at: "2024-01-01",
        user: { id: 1, first_name: "John", last_name: "Doe" },
        routine_exercises: [],
      };

      jest
        .spyOn(routineModificationService, "cleanRoutineForAI")
        .mockReturnValueOnce({});
      jest
        .spyOn(routineModificationService, "modifyRoutine")
        .mockResolvedValueOnce(mockAiResponse);
      jest
        .spyOn(routineModificationService, "mergeAIResponseWithOriginal")
        .mockReturnValueOnce({ id: 1, name: "Merged Routine" });
      jest
        .spyOn(routineModificationService, "saveModifiedRoutine")
        .mockResolvedValueOnce(mockSavedRoutine);

      // Act
      const result = await routineModificationService.modifyAndSaveRoutine(
        payload
      );

      // Assert
      expect(result).toEqual({
        modifiedRoutine: mockSavedRoutine,
        aiResponse: mockAiResponse,
      });
    });
  });
});
