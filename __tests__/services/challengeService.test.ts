import { apiClient } from "../../services/apiClient";
import { challengeService } from "../../services/challengeService";

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

describe("ChallengeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAvailableChallenges", () => {
    it("should fetch available challenges successfully", async () => {
      // Arrange
      const mockChallenges = [
        {
          id: 1,
          name: "Push-ups Challenge",
          description: "Complete 100 push-ups",
          target_value: 100,
          metric: "reps",
          start_date: "2024-01-01",
          end_date: "2024-01-31",
          status: "active",
        },
        {
          id: 2,
          name: "Squats Challenge",
          description: "Complete 200 squats",
          target_value: 200,
          metric: "reps",
          start_date: "2024-02-01",
          end_date: "2024-02-28",
          status: "active",
        },
      ];
      const mockResponse = { data: mockChallenges };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getAvailableChallenges();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/challenges");
      expect(result).toEqual(mockChallenges);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no challenges available", async () => {
      // Arrange
      const mockResponse = { data: [] };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getAvailableChallenges();

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle API failure", async () => {
      // Arrange
      const apiError = {
        response: {
          status: 404,
          data: { error: "Network error" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(challengeService.getAvailableChallenges()).rejects.toThrow(
        "No tienes un entrenador asignado"
      );
    });
  });

  describe("getChallengeDetail", () => {
    it("should fetch challenge detail successfully", async () => {
      // Arrange
      const challengeId = 1;
      const mockChallenge = {
        id: challengeId,
        name: "Push-ups Challenge",
        description: "Complete 100 push-ups",
        target_value: 100,
        metric: "reps",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        status: "active",
        participants_count: 5,
      };
      const mockResponse = { data: mockChallenge };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getChallengeDetail(challengeId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/challenges/${challengeId}`
      );
      expect(result).toEqual(mockChallenge);
      expect(result.id).toBe(challengeId);
    });

    it("should handle challenge not found", async () => {
      // Arrange
      const challengeId = 999;
      const notFoundError = {
        response: {
          status: 404,
          data: { error: "Challenge not found" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(
        challengeService.getChallengeDetail(challengeId)
      ).rejects.toThrow("Desafío no encontrado");
    });
  });

  describe("getChallengeLeaderboard", () => {
    it("should fetch challenge leaderboard successfully", async () => {
      // Arrange
      const challengeId = 1;
      const mockLeaderboard = [
        {
          position: 1,
          user_id: 1,
          user_name: "Juan Pérez",
          progress: 95,
          percentage: 95,
        },
        {
          position: 2,
          user_id: 2,
          user_name: "María García",
          progress: 80,
          percentage: 80,
        },
      ];
      const mockResponse = { data: { success: true, data: mockLeaderboard } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getChallengeLeaderboard(
        challengeId
      );

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/challenges/${challengeId}/leaderboard`
      );
      expect(result).toEqual(mockLeaderboard);
      expect((result as any)[0].position).toBe(1);
      expect(result).toHaveLength(2);
    });

    it("should return empty leaderboard for challenge with no participants", async () => {
      // Arrange
      const challengeId = 999;
      const mockResponse = { data: { success: true, data: [] } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getChallengeLeaderboard(
        challengeId
      );

      // Assert
      expect(result).toEqual([]);
    });

    it("should throw error when response indicates failure", async () => {
      // Arrange
      const challengeId = 1;
      const mockResponse = {
        data: {
          success: false,  // ← Test the false branch
          message: "No se pudo obtener el ranking del desafío"
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        challengeService.getChallengeLeaderboard(challengeId)
      ).rejects.toThrow("Error de conexión");
    });

    it("should throw default error when response indicates failure without message", async () => {
      // Arrange
      const challengeId = 1;
      const mockResponse = {
        data: {
          success: false,  // ← Test the false branch without message
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        challengeService.getChallengeLeaderboard(challengeId)
      ).rejects.toThrow("Error de conexión");
    });

    it("should handle API failure", async () => {
      // Arrange
      const challengeId = 1;
      const apiError = {
        response: {
          status: 404,
          data: { error: "Not found" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(
        challengeService.getChallengeLeaderboard(challengeId)
      ).rejects.toThrow("Desafío no encontrado");
    });
  });

  describe("getMyChallenges", () => {
    it("should fetch user challenges successfully", async () => {
      // Arrange
      const mockUserChallenges = [
        {
          id: 1,
          name: "Push-ups Challenge",
          description: "Complete 100 push-ups",
          target_value: 100,
          progress: 75,
          status: "active",
          end_date: "2024-01-31",
        },
        {
          id: 2,
          name: "Squats Challenge",
          description: "Complete 200 squats",
          target_value: 200,
          progress: 150,
          status: "active",
          end_date: "2024-02-28",
        },
      ];
      const mockResponse = { data: mockUserChallenges };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getMyChallenges();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/challenges/my_challenges"
      );
      expect(result).toEqual(mockUserChallenges);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("progress");
    });

    it("should return empty array when user has no challenges", async () => {
      // Arrange
      const mockResponse = { data: [] };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.getMyChallenges();

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle API failure", async () => {
      // Arrange
      const apiError = {
        response: {
          status: 403,
          data: { error: "Forbidden" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(challengeService.getMyChallenges()).rejects.toThrow(
        "Solo los entrenadores pueden acceder a esta función"
      );
    });
  });

  describe("createChallenge", () => {
    it("should create challenge successfully", async () => {
      // Arrange
      const challengeData = {
        name: "Desafío Push-ups Enero",
        description: "Completa 1000 push-ups en enero",
        difficulty_level: 2 as 1 | 2 | 3 | 4 | 5,
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        challenge_exercises_attributes: [
          {
            exercise_id: 1,
            sets: 3,
            reps: 15,
            weight: null,
            rest_time_seconds: 60,
            order_index: 1,
          },
        ],
      };
      const createdChallenge = {
        id: 5,
        name: challengeData.name,
        description: challengeData.description,
        difficulty_level: challengeData.difficulty_level,
        start_date: challengeData.start_date,
        end_date: challengeData.end_date,
        status: "active",
        created_at: new Date().toISOString(),
      };
      const mockResponse = { data: createdChallenge };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.createChallenge(challengeData);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith("/challenges", {
        challenge: challengeData,
      });
      expect(result).toEqual(createdChallenge);
    });

    it("should handle validation errors on create", async () => {
      // Arrange
      const invalidChallengeData = {
        name: "", // Nombre vacío
        description: "Test",
        difficulty_level: 99 as any,
        start_date: "",
        end_date: "",
        challenge_exercises_attributes: [],
      };
      const validationError = {
        response: {
          status: 422,
          data: { error: "Validation failed" },
        },
      };
      mockApiClient.post.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(
        challengeService.createChallenge(invalidChallengeData)
      ).rejects.toThrow("Datos inválidos");
    });
  });

  describe("deleteChallenge", () => {
    it("should delete challenge successfully (coach)", async () => {
      // Arrange
      const challengeId = 1;
      const mockResponse = {
        data: { message: "Desafío eliminado exitosamente" },
      };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeService.deleteChallenge(challengeId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/challenges/${challengeId}`
      );
      expect(result).toBeUndefined();
    });

    it("should handle deleting non-existent challenge", async () => {
      // Arrange
      const challengeId = 999;
      const notFoundError = {
        response: {
          status: 404,
          data: { error: "Challenge not found" },
        },
      };
      mockApiClient.delete.mockRejectedValueOnce(notFoundError);
      await expect(
        challengeService.deleteChallenge(challengeId)
      ).rejects.toThrow("Desafío no encontrado");
    });

    it("should handle unauthorized deletion", async () => {
      // Arrange
      const challengeId = 1;
      const unauthorizedError = {
        response: {
          status: 403,
          data: { error: "Unauthorized" },
        },
      };
      mockApiClient.delete.mockRejectedValueOnce(unauthorizedError);

      // Act & Assert
      await expect(
        challengeService.deleteChallenge(challengeId)
      ).rejects.toThrow("No tienes permisos para eliminar este desafío");
    });
  });
});
