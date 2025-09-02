import {
  handleApiError,
  handleApiResponse,
  executeApiCall,
} from "../../utils/serviceUtils";

describe("serviceUtils", () => {
  describe("handleApiError", () => {
    it("should handle 401 unauthorized error", () => {
      const error = {
        response: {
          status: 401,
          data: { error: "Unauthorized" },
        },
      };

      expect(() => handleApiError(error)).toThrow("No estás autorizado");
    });

    it("should handle 403 forbidden error", () => {
      const error = {
        response: {
          status: 403,
          data: { error: "Forbidden" },
        },
      };

      expect(() => handleApiError(error)).toThrow("No tienes permisos para realizar esta acción");
    });

    it("should handle 404 not found error", () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Not found" },
        },
      };

      expect(() => handleApiError(error)).toThrow("Recurso no encontrado");
    });

    it("should handle 409 conflict error", () => {
      const error = {
        response: {
          status: 409,
          data: { error: "Conflict" },
        },
      };

      expect(() => handleApiError(error)).toThrow("Conflicto en el recurso");
    });

    it("should handle 422 with validation errors array", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: ["Email is required", "Password is too short"],
          },
        },
      };

      expect(() => handleApiError(error)).toThrow("Email is required, Password is too short");
    });

    it("should handle 422 with single validation error", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: "Email is invalid",
          },
        },
      };

      expect(() => handleApiError(error)).toThrow("Email is invalid");
    });

    it("should handle 422 without specific errors", () => {
      const error = {
        response: {
          status: 422,
          data: { message: "Invalid data" },
        },
      };

      expect(() => handleApiError(error)).toThrow("Datos inválidos");
    });

    it("should use custom messages when provided", () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Not found" },
        },
      };

      const customMessages = {
        404: "Usuario no encontrado",
      };

      expect(() => handleApiError(error, customMessages)).toThrow("Usuario no encontrado");
    });

    it("should fall back to standard message when custom message not provided for status", () => {
      const error = {
        response: {
          status: 401,
          data: { error: "Unauthorized" },
        },
      };

      const customMessages = {
        404: "Usuario no encontrado",
      };

      expect(() => handleApiError(error, customMessages)).toThrow("No estás autorizado");
    });

    it("should handle unknown status codes with error message", () => {
      const error = {
        response: {
          status: 500,
          data: { error: "Internal server error" },
        },
      };

      expect(() => handleApiError(error)).toThrow("Internal server error");
    });

    it("should handle unknown status codes with message field", () => {
      const error = {
        response: {
          status: 500,
          data: { message: "Server error occurred" },
        },
      };

      expect(() => handleApiError(error)).toThrow("Server error occurred");
    });

    it("should handle unknown status codes without specific message", () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };

      expect(() => handleApiError(error)).toThrow("Error de conexión");
    });

    it("should handle network errors without response", () => {
      const error = {
        message: "Network Error",
      };

      expect(() => handleApiError(error)).toThrow("Error de conexión");
    });

    it("should handle empty error object", () => {
      const error = {};

      expect(() => handleApiError(error)).toThrow("Error de conexión");
    });

    it("should handle null/undefined error", () => {
      expect(() => handleApiError(null)).toThrow("Cannot read properties of null");
      expect(() => handleApiError(undefined)).toThrow("Cannot read properties of undefined");
    });

    it("should prioritize error field over message field", () => {
      const error = {
        response: {
          status: 500,
          data: {
            error: "Priority error message",
            message: "Secondary message",
          },
        },
      };

      expect(() => handleApiError(error)).toThrow("Priority error message");
    });
  });

  describe("handleApiResponse", () => {
    it("should return data when response is successful", () => {
      const response = {
        data: {
          success: true,
          data: { id: 1, name: "Test User" },
        },
      };

      const result = handleApiResponse(response);
      expect(result).toEqual({ id: 1, name: "Test User" });
    });

    it("should throw error when response is not successful with message", () => {
      const response = {
        data: {
          success: false,
          message: "Operation failed",
        },
      };

      expect(() => handleApiResponse(response)).toThrow("Operation failed");
    });

    it("should throw error when response is not successful without message", () => {
      const response = {
        data: {
          success: false,
        },
      };

      expect(() => handleApiResponse(response)).toThrow("Error en la operación");
    });

    it("should use custom error message when provided", () => {
      const response = {
        data: {
          success: false,
        },
      };

      expect(() => handleApiResponse(response, "Custom error")).toThrow("Custom error");
    });

    it("should handle missing success field as falsy", () => {
      const response = {
        data: {
          data: { id: 1 },
        },
      };

      expect(() => handleApiResponse(response)).toThrow("Error en la operación");
    });

    it("should handle success: false explicitly", () => {
      const response = {
        data: {
          success: false,
          data: { id: 1 },
          message: "Explicit failure",
        },
      };

      expect(() => handleApiResponse(response)).toThrow("Explicit failure");
    });

    it("should return data even when null or undefined", () => {
      const response = {
        data: {
          success: true,
          data: null,
        },
      };

      expect(handleApiResponse(response)).toBeNull();

      const response2 = {
        data: {
          success: true,
          data: undefined,
        },
      };

      expect(handleApiResponse(response2)).toBeUndefined();
    });
  });

  describe("executeApiCall", () => {
    it("should return result when API call succeeds", async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ id: 1, name: "Test" });

      const result = await executeApiCall(mockApiCall);
      expect(result).toEqual({ id: 1, name: "Test" });
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors with standard messages", async () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Not found" },
        },
      };

      const mockApiCall = jest.fn().mockRejectedValue(error);

      await expect(executeApiCall(mockApiCall)).rejects.toThrow("Recurso no encontrado");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors with custom messages", async () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Not found" },
        },
      };

      const mockApiCall = jest.fn().mockRejectedValue(error);
      const customMessages = { 404: "Usuario no encontrado" };

      await expect(executeApiCall(mockApiCall, customMessages)).rejects.toThrow("Usuario no encontrado");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should handle network errors", async () => {
      const error = new Error("Network Error");
      const mockApiCall = jest.fn().mockRejectedValue(error);

      await expect(executeApiCall(mockApiCall)).rejects.toThrow("Error de conexión");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should preserve async behavior", async () => {
      const mockApiCall = jest.fn().mockImplementation(() => 
        Promise.resolve("delayed result")
      );

      const result = await executeApiCall(mockApiCall);
      expect(result).toBe("delayed result");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple calls independently", async () => {
      const mockApiCall1 = jest.fn().mockResolvedValue("result1");
      const mockApiCall2 = jest.fn().mockResolvedValue("result2");

      const [result1, result2] = await Promise.all([
        executeApiCall(mockApiCall1),
        executeApiCall(mockApiCall2),
      ]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(mockApiCall1).toHaveBeenCalledTimes(1);
      expect(mockApiCall2).toHaveBeenCalledTimes(1);
    });

    it("should handle API call that throws non-HTTP error", async () => {
      const error = new Error("Custom error");
      const mockApiCall = jest.fn().mockRejectedValue(error);

      await expect(executeApiCall(mockApiCall)).rejects.toThrow("Error de conexión");
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it("should work with different data types", async () => {
      const mockApiCall1 = jest.fn().mockResolvedValue([1, 2, 3]);
      const mockApiCall2 = jest.fn().mockResolvedValue({ count: 5 });
      const mockApiCall3 = jest.fn().mockResolvedValue("string result");
      const mockApiCall4 = jest.fn().mockResolvedValue(42);

      const results = await Promise.all([
        executeApiCall(mockApiCall1),
        executeApiCall(mockApiCall2),
        executeApiCall(mockApiCall3),
        executeApiCall(mockApiCall4),
      ]);

      expect(results).toEqual([
        [1, 2, 3],
        { count: 5 },
        "string result",
        42
      ]);
    });
  });
});
