// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

import {
  API_URL,
  TOKEN_KEY,
  USER_KEY,
  WEBSOCKET_URL,
  EXPO_PROJECT_ID,
} from "../../services/apiClient";

// Import axios and mocked dependencies
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "../../utils/logger";
import { apiClient } from "../../services/apiClient";

// Get mocked functions
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe("apiClient Environment Constants", () => {
  it("should export environment constants", () => {
    expect(API_URL).toBeDefined();
    expect(TOKEN_KEY).toBeDefined();
    expect(USER_KEY).toBeDefined();
    expect(WEBSOCKET_URL).toBeDefined();
    expect(EXPO_PROJECT_ID).toBeDefined();
  });

  it("should have all required constants defined", () => {
    expect(API_URL).toBeDefined();
    expect(TOKEN_KEY).toBeDefined();
    expect(USER_KEY).toBeDefined();
    expect(WEBSOCKET_URL).toBeDefined();
    expect(EXPO_PROJECT_ID).toBeDefined();
  });

  it("should have valid URL formats", () => {
    expect(API_URL).toMatch(/^https?:\/\//);
    expect(WEBSOCKET_URL).toMatch(/^wss?:\/\//);
  });

  it("should have non-empty string constants", () => {
    expect(typeof API_URL).toBe("string");
    expect(typeof TOKEN_KEY).toBe("string");
    expect(typeof USER_KEY).toBe("string");
    expect(typeof WEBSOCKET_URL).toBe("string");
    expect(typeof EXPO_PROJECT_ID).toBe("string");
    
    expect(API_URL.length).toBeGreaterThan(0);
    expect(TOKEN_KEY.length).toBeGreaterThan(0);
    expect(USER_KEY.length).toBeGreaterThan(0);
    expect(WEBSOCKET_URL.length).toBeGreaterThan(0);
    expect(EXPO_PROJECT_ID.length).toBeGreaterThan(0);
  });
});

describe("apiClient Configuration", () => {
  it("should create axios instance with correct configuration", () => {
    expect((apiClient as any).defaults.baseURL).toBe(API_URL);
    expect((apiClient as any).defaults.headers["Content-Type"]).toBe("application/json");
    expect((apiClient as any).defaults.headers["Accept"]).toBe("application/json");
    expect((apiClient as any).defaults.timeout).toBe(30000);
  });

  it("should have validateStatus function that accepts status < 500", () => {
    const validateStatus = (apiClient as any).defaults.validateStatus;
    expect(validateStatus).toBeDefined();
    
    if (validateStatus) {
      expect(validateStatus(200)).toBe(true);
      expect(validateStatus(404)).toBe(true);
      expect(validateStatus(499)).toBe(true);
      expect(validateStatus(500)).toBe(false);
      expect(validateStatus(503)).toBe(false);
    }
  });
});

describe("apiClient Request Interceptor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add authorization header when token exists", async () => {
    // Arrange
    const mockToken = "test-jwt-token";
    mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
    
    const config = {
      url: "/test",
      method: "get",
      headers: {}
    } as any;

    // Act
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const result = await requestInterceptor!(config);

    // Assert
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(result.headers["Authorization"]).toBe(`Bearer ${mockToken}`);
  });

  it("should not add authorization header when no token exists", async () => {
    // Arrange
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    
    const config = {
      url: "/test",
      method: "get", 
      headers: {}
    } as any;

    // Act
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const result = await requestInterceptor!(config);

    // Assert
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(result.headers["Authorization"]).toBeUndefined();
  });

  it("should handle AsyncStorage errors in request interceptor", async () => {
    // Arrange
    const storageError = new Error("AsyncStorage error");
    mockAsyncStorage.getItem.mockRejectedValueOnce(storageError);
    
    const config = {
      url: "/test",
      method: "get",
      headers: {}
    } as any;

    // Act & Assert
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    await expect(requestInterceptor!(config)).rejects.toThrow("AsyncStorage error");
    expect(mockLogger.error).toHaveBeenCalledWith("Request interceptor error:", storageError);
  });

  it("should handle request errors", async () => {
    // Arrange
    const requestError = new Error("Request error") as any;
    
    // Act
    const errorHandler = apiClient.interceptors.request.handlers[0].rejected;
    
    // Assert
    await expect(errorHandler!(requestError)).rejects.toBe(requestError);
    expect(mockLogger.error).toHaveBeenCalledWith("Request error:", requestError);
  });
});

describe("apiClient Response Interceptor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return response for successful requests", () => {
    // Arrange
    const mockResponse = { 
      data: { message: "success" }, 
      status: 200,
      headers: {},
      config: {}
    };

    // Act
    const responseInterceptor = apiClient.interceptors.response.handlers[0].fulfilled;
    const result = responseInterceptor!(mockResponse);

    // Assert
    expect(result).toBe(mockResponse);
  });

  it("should handle 401 unauthorized errors and clear storage", async () => {
    // Arrange
    const mockError = {
      response: {
        status: 401,
        data: { error: "Unauthorized" }
      },
      message: "Request failed with status code 401",
      config: { url: "/api/test" }
    } as any;

    mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith("API Error:", {
      message: mockError.message,
      code: undefined,
      status: 401,
      url: "/api/test",
      data: { error: "Unauthorized" }
    });
    expect(mockLogger.warn).toHaveBeenCalledWith("Authentication failed - clearing stored credentials");
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
  });

  it("should handle storage errors when clearing on 401", async () => {
    // Arrange
    const mockError = {
      response: {
        status: 401,
        data: { error: "Unauthorized" }
      },
      message: "Request failed with status code 401",
      config: { url: "/api/test" }
    } as any;

    const storageError = new Error("Storage error");
    mockAsyncStorage.removeItem.mockRejectedValueOnce(storageError);

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith("Error clearing storage:", storageError);
  });

  it("should handle 429 rate limit errors", async () => {
    // Arrange
    const mockError = {
      response: {
        status: 429,
        data: { retry_after: 60 }
      },
      message: "Request failed with status code 429",
      config: { url: "/api/test" }
    } as any;

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.warn).toHaveBeenCalledWith("Rate limited. Retry after: 60 seconds");
  });

  it("should handle 503 service unavailable errors", async () => {
    // Arrange
    const mockError = {
      response: {
        status: 503,
        data: { error: "Service unavailable" }
      },
      message: "Request failed with status code 503",
      config: { url: "/api/test" }
    } as any;

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.warn).toHaveBeenCalledWith("Service temporarily unavailable");
  });

  it("should handle network errors with NETWORK_ERROR code", async () => {
    // Arrange
    const mockError = {
      code: "NETWORK_ERROR",
      message: "Network Error",
      response: undefined
    } as any;

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith("Network connectivity issue detected");
  });

  it("should handle network errors with Network Error message", async () => {
    // Arrange
    const mockError = {
      message: "Network Error",
      response: undefined
    } as any;

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith("Network connectivity issue detected");
  });

  it("should log API errors with all available information", async () => {
    // Arrange
    const mockError = {
      message: "Request failed",
      code: "ERR_BAD_REQUEST",
      response: {
        status: 400,
        data: { error: "Bad request" }
      },
      config: {
        url: "/api/test"
      }
    } as any;

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith("API Error:", {
      message: "Request failed",
      code: "ERR_BAD_REQUEST",
      status: 400,
      url: "/api/test",
      data: { error: "Bad request" }
    });
  });

  it("should handle errors without response object", async () => {
    // Arrange
    const mockError = {
      message: "Request timeout",
      code: "ECONNABORTED"
    } as any;

    // Act
    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;

    // Assert
    await expect(errorHandler!(mockError)).rejects.toBe(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith("API Error:", {
      message: "Request timeout",
      code: "ECONNABORTED",
      status: undefined,
      url: undefined,
      data: undefined
    });
  });
});
