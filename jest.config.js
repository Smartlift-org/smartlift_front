module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/",
    "/__tests__/setup.js",
    "/__mocks__/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@rails/actioncable)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@types/(.*)$": "<rootDir>/types/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
  },
  collectCoverageFrom: [
    "services/**/*.{js,ts}",
    "hooks/**/*.{js,ts}",
    "utils/**/*.{js,ts}",
    "!services/notificationService.ts",
    "!services/pushTokenService.ts",
    "!utils/logger.ts",
  ],
  coverageThreshold: {
    "./services/": {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    "./hooks/": {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    "./utils/": {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
};
