import "@testing-library/jest-native/extend-expect";
import "jest-extended";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
    key: "test-key",
    name: "test-route",
  }),
  NavigationContainer: ({ children }) => children,
  useFocusEffect: jest.fn(),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock Expo modules
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiBaseUrl: "http://localhost:3000/api/v1",
      websocketUrl: "ws://localhost:3000/cable",
      environment: "test",
    },
  },
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: "mock-push-token" })
  ),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

// Mock React Native components
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.NativeModules.SettingsManager = {
    settings: {
      AppleLocale: "en_US",
      AppleLanguages: ["en"],
    },
  };
  return RN;
});

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
}));

// Mock Action Cable
jest.mock("@rails/actioncable", () => ({
  createConsumer: jest.fn(() => ({
    subscriptions: {
      create: jest.fn(() => ({
        send: jest.fn(),
        unsubscribe: jest.fn(),
        perform: jest.fn(),
      })),
    },
    disconnect: jest.fn(),
  })),
}));

// Mock Logger
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock environment variables - handled directly in tests when needed
// Remove @env mock as it may not exist in this project

// Mock notification service
jest.mock("../services/notificationService", () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    registerForPushNotifications: jest.fn(),
    unregister: jest.fn(),
    scheduleLocal: jest.fn(),
    cancelAll: jest.fn(),
  },
}));

// Silence console warnings during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
}

// Mock timers for components that use setTimeout/setInterval
jest.useFakeTimers();

// Global test utilities
global.flushPromises = () => new Promise(setImmediate);
