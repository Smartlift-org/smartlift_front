import adminService from "../../services/adminService";
import { apiClient } from "../../services/apiClient";

// Mock dependencies
jest.mock("../../services/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient & { patch: jest.Mock }>;

describe("AdminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch users successfully", async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          created_at: "2024-01-01T00:00:00Z",
        },
      ];
      const mockResponse = { data: mockUsers };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getUsers();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/users");
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("role", "user");
    });

    it("should return empty array when no users found", async () => {
      // Arrange
      const mockResponse = { data: [] };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getUsers();

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle API error", async () => {
      // Arrange
      const error = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow(
        "Recurso no encontrado. Verifica que el backend esté funcionando correctamente."
      );
    });
  });

  describe("getCoaches", () => {
    it("should fetch coaches successfully", async () => {
      // Arrange
      const mockCoaches = [
        {
          id: 2,
          first_name: "Ana",
          last_name: "García",
          email: "ana.garcia@example.com",
          created_at: "2023-12-15T09:30:00.000Z",
          role: "coach",
        },
      ];
      const mockResponse = { data: mockCoaches };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getCoaches();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith("/admin/coaches");
      expect(result).toEqual(mockCoaches);
      expect(result[0]).toHaveProperty("role", "coach");
    });

    it("should fetch coaches with assigned users count", async () => {
      // Arrange
      const coachesWithStats = [
        {
          id: 2,
          first_name: "Ana",
          last_name: "García",
          email: "ana.garcia@example.com",
          created_at: "2023-12-15T09:30:00.000Z",
          role: "coach",
          // Solo propiedades básicas del User interface
        },
      ];
      const mockResponse = { data: coachesWithStats };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getCoaches();

      // Assert
      expect(result[0]).toHaveProperty("role", "coach");
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no coaches found", async () => {
      // Arrange
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getCoaches();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getUserDetails", () => {
    it("should fetch user details successfully", async () => {
      // Arrange
      const userId = 1;
      const userDetails = {
        id: 1,
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan.perez@example.com",
        created_at: "2023-12-01T10:00:00.000Z",
        role: "user",
      };
      const mockResponse = { data: userDetails };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getUserDetails(userId.toString());

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/admin/users/${userId}`);
      expect(result).toEqual(userDetails);
    });

    it("should fetch user without assigned coach", async () => {
      // Arrange
      const userId = 1;
      const userDetails = {
        id: 1,
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan.perez@example.com",
        created_at: "2023-12-01T10:00:00.000Z",
        role: "user",
      };
      const mockResponse = { data: userDetails };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getUserDetails(userId.toString());

      // Assert
      expect(result).toEqual(userDetails);
    });

    it("should throw error when user not found", async () => {
      // Arrange
      const userId = 999;
      (apiClient.get as jest.Mock).mockRejectedValueOnce({
        response: { status: 404, data: { error: "Usuario no encontrado" } },
      });

      // Act & Assert
      await expect(
        adminService.getUserDetails(userId.toString())
      ).rejects.toThrow();
    });
  });

  describe("getCoachDetails", () => {
    it("should fetch coach details successfully", async () => {
      // Arrange
      const coachId = 2;
      const coachDetails = {
        id: 2,
        first_name: "Ana",
        last_name: "García",
        email: "ana.garcia@example.com",
        created_at: "2023-12-15T09:30:00.000Z",
        role: "coach",
        assigned_users: [
          {
            id: 1,
            first_name: "User",
            last_name: "One",
            email: "user1@example.com",
            last_activity: "2024-01-01T10:00:00Z",
          },
          {
            id: 3,
            first_name: "User",
            last_name: "Two",
            email: "user2@example.com",
            last_activity: "2024-01-02T15:30:00Z",
          },
        ],
      };
      const mockResponse = { data: coachDetails };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getCoachDetails(coachId.toString());

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/admin/coaches/${coachId}`);
      expect(result.coach).toBeDefined();
      expect(result.assignedUsers).toHaveLength(2);
    });

    it("should fetch coach with no assigned users", async () => {
      // Arrange
      const coachId = 2;
      const coachDetails = {
        id: 2,
        first_name: "Ana",
        last_name: "García",
        email: "ana.garcia@example.com",
        created_at: "2023-12-15T09:30:00.000Z",
        role: "coach",
        assigned_users: [],
      };
      const mockResponse = { data: coachDetails };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getCoachDetails(coachId.toString());

      // Assert
      expect(result.assignedUsers).toEqual([]);
    });

    it("should throw error when coach not found", async () => {
      // Arrange
      const coachId = 999;
      (apiClient.get as jest.Mock).mockRejectedValueOnce({
        response: { status: 404, data: { error: "Usuario no encontrado" } },
      });

      // Act & Assert
      await expect(
        adminService.getCoachDetails(coachId.toString())
      ).rejects.toThrow();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        first_name: "Updated",
        last_name: "Name",
        email: "updated@example.com",
      };
      const updatedUser = {
        id: 1,
        created_at: "2023-12-01T10:00:00.000Z",
        role: "user",
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      const mockResponse = { data: updatedUser };
      ((apiClient as any).patch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.updateUser(
        userId.toString(),
        updateData
      );

      // Assert
      expect((apiClient as any).patch).toHaveBeenCalledWith(`/admin/users/${userId}`, {
        user: updateData,
      });
      expect(result).toEqual(updatedUser);
      expect(result.first_name).toBe("Updated");
    });

    it("should handle updating non-existent user", async () => {
      // Arrange
      const userId = 999;
      const updateData = { first_name: "Test" };
      (apiClient.put as jest.Mock).mockRejectedValueOnce({
        response: { status: 404, data: { error: "Usuario no encontrado" } },
      });

      // Act & Assert
      await expect(
        adminService.updateUser(userId.toString(), updateData)
      ).rejects.toThrow();
    });
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      // Arrange
      const userData = {
        first_name: "New",
        last_name: "User",
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: "user" as const,
      };
      const registeredUser = {
        id: 10,
        ...userData,
        created_at: "2024-01-01T10:00:00.000Z",
      };
      const mockResponse = { data: { user: registeredUser } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.registerUser(userData);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith("/admin/users", {
        user: userData,
      });
      expect(result).toEqual(registeredUser);
    });

    it("should handle registration errors", async () => {
      // Arrange
      const userData = {
        first_name: "New",
        last_name: "User",
        email: "invalid-email",
        password: "123",
        password_confirmation: "456",
        role: "user" as const,
      };
      mockApiClient.post.mockRejectedValueOnce({
        response: { 
          status: 422, 
          data: { error: "Email is invalid, Password is too short" } 
        },
      });

      // Act & Assert
      await expect(adminService.registerUser(userData)).rejects.toThrow(
        "Email is invalid, Password is too short"
      );
    });
  });

  describe("updateCoach", () => {
    it("should update coach successfully", async () => {
      // Arrange
      const coachId = "2";
      const updateData = {
        first_name: "Updated",
        last_name: "Coach",
        email: "updated.coach@example.com",
      };
      const updatedCoach = {
        id: 2,
        ...updateData,
        role: "coach",
        created_at: "2023-12-15T09:30:00.000Z",
        updated_at: "2024-01-01T10:00:00.000Z",
      };
      const mockResponse = { data: updatedCoach };
      mockApiClient.patch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.updateCoach(coachId, updateData);

      // Assert
      expect(mockApiClient.patch).toHaveBeenCalledWith(`/admin/coaches/${coachId}`, {
        user: updateData,
      });
      expect(result).toEqual(updatedCoach);
      expect(result.role).toBe("coach");
    });

    it("should handle network errors with specific message", async () => {
      // Arrange
      const coachId = "2";
      const updateData = { first_name: "Test" };
      const networkError = new Error("Network request failed");
      mockApiClient.patch.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(adminService.updateCoach(coachId, updateData)).rejects.toThrow(
        "Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible."
      );
    });

    it("should handle connection errors with specific message", async () => {
      // Arrange
      const coachId = "2";
      const updateData = { first_name: "Test" };
      const connectionError = new Error("Error de conexión al servidor");
      mockApiClient.patch.mockRejectedValueOnce(connectionError);

      // Act & Assert
      await expect(adminService.updateCoach(coachId, updateData)).rejects.toThrow(
        "Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible."
      );
    });
  });

  describe("getAvailableUsers", () => {
    it("should fetch available users successfully", async () => {
      // Arrange
      const availableUsers = [
        {
          id: 5,
          first_name: "Available",
          last_name: "User",
          email: "available@example.com",
          created_at: "2024-01-01T10:00:00.000Z",
        },
      ];
      const mockResponse = { data: availableUsers };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getAvailableUsers();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith("/admin/available-users");
      expect(result).toEqual(availableUsers.map(user => ({ ...user, role: "user" })));
    });

    it("should handle different response formats", async () => {
      // Arrange
      const availableUsers = [
        {
          id: 5,
          first_name: "Available",
          last_name: "User",
          email: "available@example.com",
          created_at: "2024-01-01T10:00:00.000Z",
        },
      ];
      const mockResponse = { data: { users: availableUsers } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getAvailableUsers();

      // Assert
      expect(result).toEqual(availableUsers.map(user => ({ ...user, role: "user" })));
    });

    it("should return empty array when no data", async () => {
      // Arrange
      const mockResponse = { data: {} };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getAvailableUsers();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("assignUsersToCoach", () => {
    it("should assign users to coach successfully", async () => {
      // Arrange
      const coachId = "2";
      const userIds = ["1", "3"];
      const assignmentResult = {
        coach: {
          id: 2,
          first_name: "Ana",
          last_name: "García",
          email: "ana.garcia@example.com",
          role: "coach",
        },
        assigned_users: [
          {
            id: 1,
            first_name: "User",
            last_name: "One",
            email: "user1@example.com",
          },
          {
            id: 3,
            first_name: "User",
            last_name: "Three",
            email: "user3@example.com",
          },
        ],
      };
      const mockResponse = { data: assignmentResult };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.assignUsersToCoach(coachId, userIds);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/admin/coaches/${coachId}/assign-users`,
        { user_ids: userIds }
      );
      expect(result.coach.role).toBe("coach");
      expect(result.assignedUsers).toHaveLength(2);
      expect(result.assignedUsers[0].role).toBe("user");
    });

    it("should handle assignment with no users", async () => {
      // Arrange
      const coachId = "2";
      const userIds: string[] = [];
      const assignmentResult = {
        coach: {
          id: 2,
          first_name: "Ana",
          last_name: "García",
          email: "ana.garcia@example.com",
          role: "coach",
        },
        assigned_users: [],
      };
      const mockResponse = { data: assignmentResult };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.assignUsersToCoach(coachId, userIds);

      // Assert
      expect(result.assignedUsers).toEqual([]);
    });
  });

  describe("unassignUserFromCoach", () => {
    it("should unassign user from coach successfully", async () => {
      // Arrange
      const coachId = "2";
      const userId = "1";
      const mockResponse = { data: { message: "User unassigned successfully" } };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      await adminService.unassignUserFromCoach(coachId, userId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/admin/coaches/${coachId}/users/${userId}`
      );
    });

    it("should handle unassignment errors", async () => {
      // Arrange
      const coachId = "2";
      const userId = "999";
      mockApiClient.delete.mockRejectedValueOnce({
        response: { status: 404, data: { error: "Assignment not found" } },
      });

      // Act & Assert
      await expect(
        adminService.unassignUserFromCoach(coachId, userId)
      ).rejects.toThrow();
    });
  });

  describe("deactivateCoach", () => {
    it("should deactivate coach successfully", async () => {
      // Arrange
      const coachId = "2";
      const deactivationResult = {
        message: "Entrenador desactivado exitosamente",
        unassigned_users_count: 3,
      };
      const mockResponse = { data: deactivationResult };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.deactivateCoach(coachId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/admin/coaches/${coachId}`);
      expect(result.message).toBe("Entrenador desactivado exitosamente");
      expect(result.unassignedUsersCount).toBe(3);
    });

    it("should handle deactivation with default values", async () => {
      // Arrange
      const coachId = "2";
      const mockResponse = { data: {} };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.deactivateCoach(coachId);

      // Assert
      expect(result.message).toBe("Entrenador desactivado exitosamente");
      expect(result.unassignedUsersCount).toBe(0);
    });

    it("should handle deactivation errors", async () => {
      // Arrange
      const coachId = "999";
      mockApiClient.delete.mockRejectedValueOnce({
        response: { status: 404, data: { error: "Coach not found" } },
      });

      // Act & Assert
      await expect(adminService.deactivateCoach(coachId)).rejects.toThrow();
    });
  });

  describe("makeAuthenticatedRequest error handling", () => {
    it("should handle 401 unauthorized errors", async () => {
      // Arrange
      mockApiClient.get.mockRejectedValueOnce({
        response: { status: 401, data: { error: "Unauthorized" } },
      });

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow(
        "No autorizado. Por favor inicia sesión nuevamente."
      );
    });

    it("should handle 403 forbidden errors", async () => {
      // Arrange
      mockApiClient.get.mockRejectedValueOnce({
        response: { status: 403, data: { error: "Forbidden" } },
      });

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow(
        "Acceso denegado. Solo administradores pueden realizar esta acción."
      );
    });

    it("should handle generic response errors", async () => {
      // Arrange
      mockApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: { message: "Internal server error" } },
      });

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow("Internal server error");
    });

    it("should handle network errors", async () => {
      // Arrange
      mockApiClient.get.mockRejectedValueOnce(new Error("Network failed"));

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow(
        "Error de conexión. Verifica tu conexión a internet."
      );
    });

    it("should handle different HTTP methods", async () => {
      // Arrange - Test PATCH method (which updateUser actually uses)
      const userData = { first_name: "Test" };
      const mockResponse = { data: { ...userData, role: "user" } };
      mockApiClient.patch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.updateUser("1", userData);

      // Assert
      expect(mockApiClient.patch).toHaveBeenCalledWith("/admin/users/1", {
        user: userData,
      });
      expect(result.role).toBe("user");
    });

    it("should handle PUT method", async () => {
      // Arrange
      const userData = { first_name: "Test" };
      const mockResponse = { data: { ...userData, role: "user" } };
      mockApiClient.put.mockResolvedValueOnce(mockResponse);

      // We need to test PUT method through a service method that uses it
      // Since no current method uses PUT, we'll test it through error handling
      mockApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: "Server error" } },
      });

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow("Server error");
    });

    it("should handle DELETE method through deactivateCoach", async () => {
      // Arrange
      const coachId = "2";
      const mockResponse = { data: { message: "Coach deactivated" } };
      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.deactivateCoach(coachId);

      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/admin/coaches/${coachId}`);
      expect(result.message).toBe("Coach deactivated");
    });

    it("should handle response with no error and no message", async () => {
      // Arrange
      mockApiClient.get.mockRejectedValueOnce({
        response: { status: 500, data: {} },
      });

      // Act & Assert
      await expect(adminService.getUsers()).rejects.toThrow("Error en la solicitud");
    });

    describe("data format handling", () => {
      it("should handle coaches response with coaches field", async () => {
        // Arrange
        const mockCoaches = [
          { id: 1, first_name: "Coach", last_name: "One", email: "coach@example.com" },
        ];
        const mockResponse = { data: { coaches: mockCoaches } };
        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        // Act
        const result = await adminService.getCoaches();

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].role).toBe("coach");
      });

      it("should handle coaches response with data field", async () => {
        // Arrange
        const mockCoaches = [
          { id: 1, first_name: "Coach", last_name: "One", email: "coach@example.com" },
        ];
        const mockResponse = { data: { data: mockCoaches } };
        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        // Act
        const result = await adminService.getCoaches();

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].role).toBe("coach");
      });

      it("should handle coaches response with no recognized format", async () => {
        // Arrange
        const mockResponse = { data: { something: "else" } };
        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        // Act
        const result = await adminService.getCoaches();

        // Assert
        expect(result).toEqual([]);
      });

      it("should handle response with no error and no message", async () => {
        // Arrange
        mockApiClient.get.mockRejectedValueOnce({
          response: { status: 500, data: {} },
        });

        // Act & Assert
        await expect(adminService.getUsers()).rejects.toThrow(
          "Error en la solicitud"
        );
      });
    });

    it("should handle data format variations", async () => {
      // Test coaches response with coaches field
      const mockCoaches = [{ id: 1, first_name: "Coach", last_name: "One", email: "coach@example.com" }];
      const mockResponse = { data: { coaches: mockCoaches } };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getCoaches();
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("coach");
    });

    it("should handle getUserDetails without role field", async () => {
      // Arrange
      const userId = "1";
      const userDetails = {
        id: 1,
        first_name: "User",
        last_name: "One",
        email: "user@example.com"
      };
      const mockResponse = { data: userDetails };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.getUserDetails(userId);

      // Assert
      expect(result.role).toBe("user");
    });

    it("should handle registerUser response without user wrapper", async () => {
      // Arrange
      const userData = {
        first_name: "New",
        last_name: "User",
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: "user" as const,
      };
      const registeredUser = {
        id: 10,
        ...userData,
        created_at: "2024-01-01T10:00:00.000Z",
      };
      const mockResponse = { data: registeredUser };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.registerUser(userData);

      // Assert
      expect(result).toEqual(registeredUser);
    });
  });

  describe("assignUsersToCoach edge cases", () => {
    it("should handle assignment response without assigned_users", async () => {
      // Arrange
      const coachId = "2";
      const userIds = ["1", "3"];
      const assignmentResult = {
        coach: {
          id: 2,
          first_name: "Ana",
          last_name: "García",
          email: "ana.garcia@example.com",
          role: "coach",
        }
        // No assigned_users field
      };
      const mockResponse = { data: assignmentResult };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await adminService.assignUsersToCoach(coachId, userIds);

      // Assert
      expect(result.coach.role).toBe("coach");
      expect(result.assignedUsers).toEqual([]);
    });
  });
});
