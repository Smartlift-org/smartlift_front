import { challengeAttemptService } from "../../services/challengeAttemptService";
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

// Mock service utils
jest.mock("../../utils/serviceUtils", () => ({
  executeApiCall: jest.fn((fn) => fn()),
  handleApiResponse: jest.fn((response) => response.data),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("ChallengeAttemptService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("startAttempt", () => {
    it("should start challenge attempt successfully", async () => {
      // Arrange
      const challengeId = 1;
      const mockAttempt = {
        id: 1,
        challenge_id: challengeId,
        user_id: 1,
        status: "in_progress",
        started_at: "2024-01-01T10:00:00Z",
      };
      mockApiClient.post.mockResolvedValueOnce({ data: mockAttempt });

      // Act
      const result = await challengeAttemptService.startAttempt(challengeId);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(`/challenges/${challengeId}/attempts`);
      expect(result).toEqual(mockAttempt);
    });

    it("should handle challenge already has active attempt", async () => {
      // Arrange
      const challengeId = 1;
      const error = new Error("Ya tienes un intento activo");
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        challengeAttemptService.startAttempt(challengeId)
      ).rejects.toThrow("Ya tienes un intento activo");
    });

    it("should handle unauthorized access", async () => {
      // Arrange
      const challengeId = 999;
      const error = new Error("No tienes acceso a este desafío");
      mockApiClient.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        challengeAttemptService.startAttempt(challengeId)
      ).rejects.toThrow("No tienes acceso a este desafío");
    });
  });

  describe("completeAttempt", () => {
    it("should complete attempt successfully", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 1;
      const completeData = {
        completion_time_seconds: 100,
        exercise_times: { "push_ups": 30, "squats": 45 },
      };
      const mockAttempt = {
        id: attemptId,
        challenge_id: challengeId,
        status: "completed",
        completion_time_seconds: 100,
      };
      const mockResponse = {
        data: {
          success: true,
          data: mockAttempt,
          leaderboard_position: 3,
          is_new_personal_best: true,
        },
      };
      
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeAttemptService.completeAttempt(
        challengeId,
        attemptId,
        completeData
      );

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/challenges/${challengeId}/attempts/${attemptId}/complete`,
        completeData
      );
      expect(result.attempt.status).toBe("completed");
      expect(result.leaderboard_position).toBe(3);
      expect(result.is_new_personal_best).toBe(true);
    });

    it("should throw error when response indicates failure", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 1;
      const completeData = {
        completion_time_seconds: 100,
        exercise_times: { "push_ups": 30 },
      };
      const mockResponse = {
        data: {
          success: false,  // ← Test the false branch
          message: "El intento no pudo ser completado correctamente"
        },
      };
      
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        challengeAttemptService.completeAttempt(challengeId, attemptId, completeData)
      ).rejects.toThrow("El intento no pudo ser completado correctamente");
    });

    it("should throw default error when response indicates failure without message", async () => {
      // Arrange  
      const challengeId = 1;
      const attemptId = 1;
      const completeData = {
        completion_time_seconds: 100,
        exercise_times: { "push_ups": 30 },
      };
      const mockResponse = {
        data: {
          success: false,  // ← Test the false branch without message
        },
      };
      
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act & Assert
      await expect(
        challengeAttemptService.completeAttempt(challengeId, attemptId, completeData)
      ).rejects.toThrow("Error al completar el intento");
    });

    it("should handle invalid completion data", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 1;
      const invalidData = {
        completion_time_seconds: -5, // invalid negative value
      };
      const validationError = {
        response: {
          status: 422,
          data: { errors: ["Datos inválidos para completar el intento"] },
        },
      };
      mockApiClient.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(
        challengeAttemptService.completeAttempt(challengeId, attemptId, invalidData)
      ).rejects.toEqual(validationError);
    });
  });

  describe("abandonAttempt", () => {
    it("should abandon attempt successfully", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 1;
      const mockAttempt = {
        id: attemptId,
        challenge_id: challengeId,
        status: "abandoned",
        abandoned_at: "2024-01-02T10:00:00Z",
      };
      const mockResponse = { data: mockAttempt };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeAttemptService.abandonAttempt(challengeId, attemptId);

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/challenges/${challengeId}/attempts/${attemptId}/abandon`
      );
      expect(result).toEqual(mockAttempt);
    });

    it("should handle attempt not found", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 999;
      const error = {
        response: {
          status: 404,
          data: { error: "Intento no encontrado" },
        },
      };
      mockApiClient.put.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        challengeAttemptService.abandonAttempt(challengeId, attemptId)
      ).rejects.toEqual(error);
    });
  });

  describe("getMyAttempts", () => {
    it("should fetch challenge attempts for specific challenge", async () => {
      // Arrange
      const challengeId = 1;
      const mockAttempts = [
        {
          id: 1,
          challenge_id: challengeId,
          status: "in_progress",
          started_at: "2024-01-01T10:00:00Z",
        },
        {
          id: 2,
          challenge_id: challengeId,
          status: "completed",
          completed_at: "2024-01-15T10:00:00Z",
        },
      ];
      const mockResponse = { data: mockAttempts };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeAttemptService.getMyAttempts(challengeId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/challenges/${challengeId}/attempts`
      );
      expect(result).toEqual(mockAttempts);
    });

    it("should return empty array when no attempts", async () => {
      // Arrange
      const challengeId = 1;
      const mockResponse = { data: [] };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeAttemptService.getMyAttempts(challengeId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getAllMyAttempts", () => {
    it("should fetch all user attempts across all challenges", async () => {
      // Arrange
      const mockAttempts = [
        {
          id: 1,
          challenge_id: 1,
          challenge_name: "Push-ups Challenge",
          status: "in_progress",
          started_at: "2024-01-01T10:00:00Z",
        },
        {
          id: 2,
          challenge_id: 2,
          challenge_name: "Squats Challenge",
          status: "completed",
          completed_at: "2024-01-15T10:00:00Z",
        },
      ];
      const mockResponse = { data: mockAttempts };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeAttemptService.getAllMyAttempts();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/my-attempts");
      expect(result).toEqual(mockAttempts);
    });

    it("should handle no attempts found", async () => {
      // Arrange
      const error = {
        response: {
          status: 404,
          data: { error: "No tienes intentos registrados" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        challengeAttemptService.getAllMyAttempts()
      ).rejects.toEqual(error);
    });
  });

  describe("getAttemptDetail", () => {
    it("should fetch challenge attempt detail successfully", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 1;
      const mockAttemptDetail = {
        id: attemptId,
        challenge_id: challengeId,
        challenge: {
          id: challengeId,
          name: "Push-ups Challenge",
          description: "Complete 100 push-ups",
          target_value: 100,
          metric: "reps",
        },
        status: "in_progress",
        started_at: "2024-01-01T10:00:00Z",
      };
      const mockResponse = { data: mockAttemptDetail };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await challengeAttemptService.getAttemptDetail(challengeId, attemptId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/challenges/${challengeId}/attempts/${attemptId}`
      );
      expect(result).toEqual(mockAttemptDetail);
    });

    it("should handle attempt not found", async () => {
      // Arrange
      const challengeId = 1;
      const attemptId = 999;
      const error = {
        response: {
          status: 404,
          data: { error: "Intento no encontrado" },
        },
      };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        challengeAttemptService.getAttemptDetail(challengeId, attemptId)
      ).rejects.toEqual(error);
    });
  });
});
