import {
  formatTimeRemaining,
  getAttemptStatusColor,
  getAttemptStatusText,
  getAttemptStatusEmoji,
  getChallengeCardStatusColor,
  getMedalEmoji,
  getPositionColor,
  formatChallengeDate,
  formatTime,
  calculateCompletionRate,
  getDifficultyColor,
  getDifficultyText,
  formatSecondsToMinutesSeconds,
} from "../../utils/challengeUtils";

// Mock Date to control time-dependent tests
const mockDate = new Date("2024-01-15T12:00:00Z");

// Mock Date constructor
jest.useFakeTimers();
jest.setSystemTime(mockDate);

describe("challengeUtils", () => {
  afterAll(() => {
    jest.useRealTimers();
  });

  describe("formatTimeRemaining", () => {
    it("should return 'Expirado' for past dates", () => {
      const pastDate = "2024-01-10T12:00:00Z"; // 5 days ago
      expect(formatTimeRemaining(pastDate)).toBe("Expirado");
    });

    it("should format days and hours correctly", () => {
      const futureDate = "2024-01-18T15:00:00Z"; // 3 days 3 hours from mock date
      expect(formatTimeRemaining(futureDate)).toBe("3d 3h restantes");
    });

    it("should format hours only when less than a day", () => {
      const futureDate = "2024-01-15T18:00:00Z"; // 6 hours from mock date
      expect(formatTimeRemaining(futureDate)).toBe("6h restantes");
    });

    it("should handle exactly zero time difference", () => {
      const exactNow = "2024-01-15T12:00:00Z";
      expect(formatTimeRemaining(exactNow)).toBe("Expirado");
    });

    it("should handle partial hours correctly", () => {
      const futureDate = "2024-01-15T18:30:00Z"; // 6.5 hours from mock date
      expect(formatTimeRemaining(futureDate)).toBe("6h restantes");
    });
  });

  describe("getAttemptStatusColor", () => {
    it("should return green for completed status", () => {
      expect(getAttemptStatusColor("completed")).toBe("bg-green-100 text-green-800");
    });

    it("should return blue for in_progress status", () => {
      expect(getAttemptStatusColor("in_progress")).toBe("bg-blue-100 text-blue-800");
    });

    it("should return red for abandoned status", () => {
      expect(getAttemptStatusColor("abandoned")).toBe("bg-red-100 text-red-800");
    });

    it("should return gray for unknown status", () => {
      expect(getAttemptStatusColor("unknown")).toBe("bg-gray-100 text-gray-800");
      expect(getAttemptStatusColor("")).toBe("bg-gray-100 text-gray-800");
    });
  });

  describe("getAttemptStatusText", () => {
    it("should return Spanish text for completed status", () => {
      expect(getAttemptStatusText("completed")).toBe("Completado");
    });

    it("should return Spanish text for in_progress status", () => {
      expect(getAttemptStatusText("in_progress")).toBe("En Progreso");
    });

    it("should return Spanish text for abandoned status", () => {
      expect(getAttemptStatusText("abandoned")).toBe("Abandonado");
    });

    it("should return original status for unknown values", () => {
      expect(getAttemptStatusText("custom_status")).toBe("custom_status");
      expect(getAttemptStatusText("")).toBe("");
    });
  });

  describe("getAttemptStatusEmoji", () => {
    it("should return correct emojis for each status", () => {
      expect(getAttemptStatusEmoji("completed")).toBe("✅");
      expect(getAttemptStatusEmoji("in_progress")).toBe("⏳");
      expect(getAttemptStatusEmoji("abandoned")).toBe("❌");
      expect(getAttemptStatusEmoji("unknown")).toBe("❓");
      expect(getAttemptStatusEmoji("")).toBe("❓");
    });
  });

  describe("getChallengeCardStatusColor", () => {
    it("should return red for expired challenges", () => {
      const pastDate = "2024-01-10T12:00:00Z";
      expect(getChallengeCardStatusColor(pastDate, false)).toBe("bg-red-100 border-red-200");
      expect(getChallengeCardStatusColor(pastDate, true)).toBe("bg-red-100 border-red-200");
    });

    it("should return green for active challenges", () => {
      const futureDate = "2024-01-20T12:00:00Z";
      expect(getChallengeCardStatusColor(futureDate, true)).toBe("bg-green-100 border-green-200");
    });

    it("should return gray for inactive challenges", () => {
      const futureDate = "2024-01-20T12:00:00Z";
      expect(getChallengeCardStatusColor(futureDate, false)).toBe("bg-gray-100 border-gray-200");
    });
  });

  describe("getMedalEmoji", () => {
    it("should return correct medal emojis for top 3 positions", () => {
      expect(getMedalEmoji(1)).toBe("🥇");
      expect(getMedalEmoji(2)).toBe("🥈");
      expect(getMedalEmoji(3)).toBe("🥉");
    });

    it("should return runner emoji for other positions", () => {
      expect(getMedalEmoji(4)).toBe("🏃");
      expect(getMedalEmoji(10)).toBe("🏃");
      expect(getMedalEmoji(0)).toBe("🏃");
    });
  });

  describe("getPositionColor", () => {
    it("should return correct colors for top 3 positions", () => {
      expect(getPositionColor(1)).toBe("text-yellow-600");
      expect(getPositionColor(2)).toBe("text-gray-500");
      expect(getPositionColor(3)).toBe("text-orange-600");
    });

    it("should return gray for other positions", () => {
      expect(getPositionColor(4)).toBe("text-gray-700");
      expect(getPositionColor(10)).toBe("text-gray-700");
      expect(getPositionColor(0)).toBe("text-gray-700");
    });
  });

  describe("formatChallengeDate", () => {
    it("should format date in Spanish format", () => {
      const dateString = "2024-01-15T14:30:00Z";
      const result = formatChallengeDate(dateString);
      // Note: The exact format may vary by environment, so we check for key components
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/); // DD/MM/YYYY format
      expect(result).toMatch(/\d{2}:\d{2}/); // HH:MM format
    });

    it("should handle different date formats", () => {
      const dateString = "2024-12-25T23:59:59Z";
      const result = formatChallengeDate(dateString);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe("formatTime", () => {
    it("should format milliseconds to MM:SS format", () => {
      expect(formatTime(65000)).toBe("01:05"); // 1 minute 5 seconds
      expect(formatTime(125000)).toBe("02:05"); // 2 minutes 5 seconds
      expect(formatTime(3661000)).toBe("61:01"); // 61 minutes 1 second
    });

    it("should handle zero and small values", () => {
      expect(formatTime(0)).toBe("00:00");
      expect(formatTime(500)).toBe("00:00"); // Less than 1 second
      expect(formatTime(1000)).toBe("00:01"); // Exactly 1 second
    });

    it("should pad single digits with zeros", () => {
      expect(formatTime(5000)).toBe("00:05");
      expect(formatTime(65000)).toBe("01:05");
    });
  });

  describe("calculateCompletionRate", () => {
    it("should calculate percentage correctly", () => {
      expect(calculateCompletionRate(7, 10)).toBe(70);
      expect(calculateCompletionRate(3, 4)).toBe(75);
      expect(calculateCompletionRate(1, 3)).toBe(33); // Rounded
    });

    it("should handle zero totals", () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
      expect(calculateCompletionRate(5, 0)).toBe(0);
    });

    it("should handle null/undefined values", () => {
      expect(calculateCompletionRate(null as any, 10)).toBe(0);
      expect(calculateCompletionRate(5, null as any)).toBe(0);
      expect(calculateCompletionRate(undefined as any, undefined as any)).toBe(0);
    });

    it("should handle 100% completion", () => {
      expect(calculateCompletionRate(10, 10)).toBe(100);
      expect(calculateCompletionRate(5, 5)).toBe(100);
    });

    it("should round to nearest integer", () => {
      expect(calculateCompletionRate(1, 3)).toBe(33); // 33.33... rounds to 33
      expect(calculateCompletionRate(2, 3)).toBe(67); // 66.66... rounds to 67
    });
  });

  describe("getDifficultyColor", () => {
    it("should return correct colors for each difficulty level", () => {
      expect(getDifficultyColor(1)).toBe("bg-green-500");
      expect(getDifficultyColor(2)).toBe("bg-green-400");
      expect(getDifficultyColor(3)).toBe("bg-yellow-500");
      expect(getDifficultyColor(4)).toBe("bg-orange-500");
      expect(getDifficultyColor(5)).toBe("bg-red-500");
    });

    it("should fallback to first color for invalid levels", () => {
      expect(getDifficultyColor(0)).toBe("bg-green-500");
      expect(getDifficultyColor(6)).toBe("bg-green-500");
      expect(getDifficultyColor(-1)).toBe("bg-green-500");
    });
  });

  describe("getDifficultyText", () => {
    it("should return correct Spanish text for each difficulty level", () => {
      expect(getDifficultyText(1)).toBe("Muy Fácil");
      expect(getDifficultyText(2)).toBe("Fácil");
      expect(getDifficultyText(3)).toBe("Moderado");
      expect(getDifficultyText(4)).toBe("Difícil");
      expect(getDifficultyText(5)).toBe("Muy Difícil");
    });

    it("should fallback to first text for invalid levels", () => {
      expect(getDifficultyText(0)).toBe("Muy Fácil");
      expect(getDifficultyText(6)).toBe("Muy Fácil");
      expect(getDifficultyText(-1)).toBe("Muy Fácil");
    });
  });

  describe("formatSecondsToMinutesSeconds", () => {
    it("should format seconds to MM:SS format", () => {
      expect(formatSecondsToMinutesSeconds(65)).toBe("01:05");
      expect(formatSecondsToMinutesSeconds(125)).toBe("02:05");
      expect(formatSecondsToMinutesSeconds(3661)).toBe("61:01");
    });

    it("should handle zero and null values", () => {
      expect(formatSecondsToMinutesSeconds(0)).toBe("--:--");
      expect(formatSecondsToMinutesSeconds(null)).toBe("--:--");
      expect(formatSecondsToMinutesSeconds(undefined)).toBe("--:--");
    });

    it("should handle negative values", () => {
      expect(formatSecondsToMinutesSeconds(-5)).toBe("--:--");
    });

    it("should handle decimal values by flooring", () => {
      expect(formatSecondsToMinutesSeconds(65.8)).toBe("01:05");
      expect(formatSecondsToMinutesSeconds(125.9)).toBe("02:05");
    });

    it("should pad single digits with zeros", () => {
      expect(formatSecondsToMinutesSeconds(5)).toBe("00:05");
      expect(formatSecondsToMinutesSeconds(60)).toBe("01:00");
    });
  });
});
