// Mock dependencies
jest.mock("../../services/userStatsService", () => ({
  __esModule: true,
  default: {
    hasCompletedProfile: jest.fn(),
  },
}));

jest.mock("../../components/AppAlert", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
  },
}));

import { navigateAfterAuth } from "../../utils/authNavigation";
import userStatsService from "../../services/userStatsService";
import AppAlert from "../../components/AppAlert";

// Type the mocked dependencies
const mockUserStatsService = userStatsService as jest.Mocked<typeof userStatsService>;
const mockAppAlert = AppAlert as jest.Mocked<typeof AppAlert>;

// Mock navigation
const mockNavigation = {
  reset: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
} as any;

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe("authNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("navigateAfterAuth", () => {
    it("should navigate to CoachHome for coach role", async () => {
      await navigateAfterAuth(mockNavigation, "coach");

      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "CoachHome" }],
      });
      expect(mockUserStatsService.hasCompletedProfile).not.toHaveBeenCalled();
    });

    it("should navigate to AdminHome for admin role", async () => {
      await navigateAfterAuth(mockNavigation, "admin");

      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "AdminHome" }],
      });
      expect(mockUserStatsService.hasCompletedProfile).not.toHaveBeenCalled();
    });

    it("should navigate to StatsProfile for user with incomplete profile", async () => {
      mockUserStatsService.hasCompletedProfile.mockResolvedValue(false);

      await navigateAfterAuth(mockNavigation, "user");

      expect(mockUserStatsService.hasCompletedProfile).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [
          {
            name: "StatsProfile",
            params: { fromRedirect: true },
          },
        ],
      });
      expect(mockAppAlert.info).toHaveBeenCalledWith(
        "Perfil incompleto",
        "Por favor complete su perfil para continuar.",
        [{ text: "Entendido" }]
      );
    });

    it("should navigate to UserHome for user with completed profile", async () => {
      mockUserStatsService.hasCompletedProfile.mockResolvedValue(true);

      await navigateAfterAuth(mockNavigation, "user");

      expect(mockUserStatsService.hasCompletedProfile).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }],
      });
      expect(mockAppAlert.info).not.toHaveBeenCalled();
    });

    it("should handle unknown user roles as regular users", async () => {
      mockUserStatsService.hasCompletedProfile.mockResolvedValue(true);

      await navigateAfterAuth(mockNavigation, "unknown_role");

      expect(mockUserStatsService.hasCompletedProfile).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }],
      });
    });

    it("should handle empty string role as regular user", async () => {
      mockUserStatsService.hasCompletedProfile.mockResolvedValue(true);

      await navigateAfterAuth(mockNavigation, "");

      expect(mockUserStatsService.hasCompletedProfile).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }],
      });
    });

    it("should handle userStatsService error and fallback to UserHome", async () => {
      const error = new Error("Service error");
      mockUserStatsService.hasCompletedProfile.mockRejectedValue(error);

      await navigateAfterAuth(mockNavigation, "user");

      expect(mockUserStatsService.hasCompletedProfile).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith("Error checking profile completion:", error);
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }],
      });
      expect(mockAppAlert.info).not.toHaveBeenCalled();
    });

    it("should handle network timeout errors gracefully", async () => {
      const timeoutError = new Error("Network timeout");
      timeoutError.name = "TimeoutError";
      mockUserStatsService.hasCompletedProfile.mockRejectedValue(timeoutError);

      await navigateAfterAuth(mockNavigation, "user");

      expect(mockConsoleError).toHaveBeenCalledWith("Error checking profile completion:", timeoutError);
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }],
      });
    });

    it("should handle case-sensitive role comparison", async () => {
      // Test uppercase variations
      await navigateAfterAuth(mockNavigation, "COACH");
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }], // Should fallback to user since "COACH" !== "coach"
      });

      mockNavigation.reset.mockClear();

      await navigateAfterAuth(mockNavigation, "Admin");
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "UserHome" }], // Should fallback to user since "Admin" !== "admin"
      });
    });

    it("should call navigation.reset exactly once per call", async () => {
      mockUserStatsService.hasCompletedProfile.mockResolvedValue(true);

      await navigateAfterAuth(mockNavigation, "coach");
      expect(mockNavigation.reset).toHaveBeenCalledTimes(1);

      mockNavigation.reset.mockClear();

      await navigateAfterAuth(mockNavigation, "admin");
      expect(mockNavigation.reset).toHaveBeenCalledTimes(1);

      mockNavigation.reset.mockClear();

      await navigateAfterAuth(mockNavigation, "user");
      expect(mockNavigation.reset).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple concurrent calls independently", async () => {
      mockUserStatsService.hasCompletedProfile.mockResolvedValue(true);

      const promise1 = navigateAfterAuth(mockNavigation, "coach");
      const promise2 = navigateAfterAuth(mockNavigation, "admin");
      const promise3 = navigateAfterAuth(mockNavigation, "user");

      await Promise.all([promise1, promise2, promise3]);

      expect(mockNavigation.reset).toHaveBeenCalledTimes(3);
      expect(mockUserStatsService.hasCompletedProfile).toHaveBeenCalledTimes(1); // Only called for user role
    });
  });
});
