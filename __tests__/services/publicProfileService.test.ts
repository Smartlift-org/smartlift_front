import publicProfileService from "../../services/publicProfileService";
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

describe("PublicProfileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPublicProfiles", () => {
    it("should fetch public profiles successfully", async () => {
      // Arrange
      const mockProfiles = [
        {
          id: 1,
          first_name: "Juan",
          last_name: "Pérez",
          profile_picture_url: "https://example.com/profile1.jpg",
          workout_count: 25,
          join_date: "2024-01-01",
          is_profile_public: true,
        },
        {
          id: 2,
          first_name: "María",
          last_name: "García",
          profile_picture_url: null,
          workout_count: 15,
          join_date: "2024-01-15",
          is_profile_public: true,
        },
      ];
      const mockResponse = {
        data: { profiles: mockProfiles, pagination: { total: 2, page: 1 } },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.getPublicProfiles();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/public-profiles?page=1&per_page=20"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle search parameter", async () => {
      // Arrange
      const searchTerm = "Juan";
      const mockResponse = {
        data: { profiles: [], pagination: { total: 0, page: 1 } },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.getPublicProfiles(
        1,
        searchTerm
      );

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/public-profiles?page=1&per_page=20&search=Juan"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should return empty results when no public profiles", async () => {
      // Arrange
      const mockResponse = {
        data: {
          profiles: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_count: 0,
            per_page: 20,
          },
          filters_applied: {},
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.getPublicProfiles();

      // Assert
      expect((result as any).profiles).toEqual([]);
      expect((result as any).pagination.total_count).toBe(0);
    });

    it("should handle 404 error when no profiles found", async () => {
      // Arrange
      const notFoundError = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(publicProfileService.getPublicProfiles()).rejects.toThrow(
        "No se encontraron perfiles públicos"
      );
    });

    it("should handle API error with specific message", async () => {
      // Arrange
      const apiError = {
        response: { status: 500, data: { error: "Server maintenance" } },
      };
      mockApiClient.get.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(publicProfileService.getPublicProfiles()).rejects.toThrow(
        "Server maintenance"
      );
    });

    it("should handle generic API error", async () => {
      // Arrange
      const genericError = { response: { status: 500 } };
      mockApiClient.get.mockRejectedValueOnce(genericError);

      // Act & Assert
      await expect(publicProfileService.getPublicProfiles()).rejects.toThrow(
        "Error al cargar los perfiles públicos"
      );
    });
  });

  describe("getPublicProfile", () => {
    it("should fetch public profile successfully", async () => {
      // Arrange
      const userId = 1;
      const mockProfile = {
        id: userId,
        first_name: "Juan",
        last_name: "Pérez",
        profile_picture_url: "https://example.com/profile1.jpg",
        workout_count: 25,
        join_date: "2024-01-01",
        personal_records: [
          { exercise_name: "Bench Press", max_weight: 80, date: "2024-01-15" },
        ],
        favorite_exercises: ["Push ups", "Squats"],
        is_profile_public: true,
      };
      const mockResponse = { data: mockProfile };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.getPublicProfile(userId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/users/${userId}/public-profile`
      );
      expect(result).toEqual(mockProfile);
    });

    it("should handle profile not found", async () => {
      // Arrange
      const userId = 999;
      const error = new Error("Profile not found");
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        publicProfileService.getPublicProfile(userId)
      ).rejects.toThrow("Error al cargar el perfil público");
    });

    it("should handle 404 error for non-existent profile", async () => {
      // Arrange
      const userId = 999;
      const notFoundError = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(
        publicProfileService.getPublicProfile(userId)
      ).rejects.toThrow("Este perfil no es público o no existe");
    });

    it("should handle private profile", async () => {
      // Arrange
      const userId = 1;
      const error = {
        response: { status: 403, data: { error: "Profile is private" } },
      };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        publicProfileService.getPublicProfile(userId)
      ).rejects.toThrow("Profile is private");
    });
  });

  describe("updatePrivacySettings", () => {
    it("should update privacy settings successfully", async () => {
      // Arrange
      const privacySettings = {
        is_profile_public: true,
        show_name: true,
        show_profile_picture: true,
        show_workout_count: true,
        show_join_date: false,
        show_personal_records: true,
        show_favorite_exercises: true,
      };
      const mockResponse = { data: privacySettings };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.updatePrivacySettings(
        privacySettings
      );

      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/users/privacy-settings",
        {
          privacy_settings: privacySettings,
        }
      );
      expect(result).toEqual(privacySettings);
    });

    it("should handle 404 error with simulated success", async () => {
      // Arrange
      const privacySettings = {
        is_profile_public: true,
        show_name: true,
        show_profile_picture: true,
        show_workout_count: true,
        show_join_date: false,
        show_personal_records: true,
        show_favorite_exercises: true,
      };
      const notFoundError = { response: { status: 404 } };
      mockApiClient.put.mockRejectedValueOnce(notFoundError);

      // Act
      const result = await publicProfileService.updatePrivacySettings(
        privacySettings
      );

      // Assert
      expect(result).toEqual({
        success: true,
        data: privacySettings,
        message: "Configuración guardada localmente (pendiente implementación en backend)",
      });
    });

    it("should handle API error with specific message", async () => {
      // Arrange
      const privacySettings = {
        is_profile_public: true,
        show_name: true,
        show_profile_picture: true,
        show_workout_count: true,
        show_join_date: false,
        show_personal_records: true,
        show_favorite_exercises: true,
      };
      const apiError = {
        response: { status: 400, data: { error: "Invalid settings format" } },
      };
      mockApiClient.put.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(
        publicProfileService.updatePrivacySettings(privacySettings)
      ).rejects.toThrow("Invalid settings format");
    });

    it("should handle validation errors", async () => {
      // Arrange
      const invalidSettings = { unknown_field: true } as any;
      const validationError = {
        response: {
          status: 422,
          data: { errors: ["Unknown field"] },
        },
      };
      mockApiClient.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(
        publicProfileService.updatePrivacySettings(invalidSettings)
      ).rejects.toThrow("Error al actualizar la configuración de privacidad");
    });
  });

  describe("getPrivacySettings", () => {
    it("should fetch privacy settings successfully", async () => {
      // Arrange
      const mockSettings = {
        is_profile_public: false,
        show_name: true,
        show_profile_picture: true,
        show_workout_count: false,
        show_join_date: false,
        show_personal_records: false,
        show_favorite_exercises: true,
      };
      const mockResponse = { data: { data: mockSettings } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.getPrivacySettings();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/users/privacy-settings");
      expect(result).toEqual(mockSettings);
    });

    it("should handle user with no privacy settings (first time)", async () => {
      // Arrange
      const defaultSettings = {
        is_profile_public: false,
        show_name: true,
        show_profile_picture: true,
        show_workout_count: true,
        show_join_date: false,
        show_personal_records: false,
        show_favorite_exercises: false,
      };
      const mockResponse = { data: { data: defaultSettings } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await publicProfileService.getPrivacySettings();

      // Assert
      expect(result.is_profile_public).toBe(false); // default value
    });

    it("should handle 404 error with default settings", async () => {
      // Arrange
      const notFoundError = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      // Act
      const result = await publicProfileService.getPrivacySettings();

      // Assert
      expect(result).toEqual({
        show_name: true,
        show_profile_picture: true,
        show_workout_count: true,
        show_join_date: false,
        show_personal_records: false,
        show_favorite_exercises: false,
        is_profile_public: false,
      });
    });

    it("should handle generic error in getPrivacySettings", async () => {
      // Arrange
      const genericError = { response: { status: 500 } };
      mockApiClient.get.mockRejectedValueOnce(genericError);

      // Act & Assert
      await expect(publicProfileService.getPrivacySettings()).rejects.toThrow(
        "Error al cargar la configuración de privacidad"
      );
    });
  });
});
