import authService from '../../services/authService';
import { apiClient, TOKEN_KEY, USER_KEY } from '../../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../../services/notificationService';
import { mockApiResponses } from '../../__mocks__/apiResponses';

// Skip @env mock for now

// Mock dependencies
jest.mock('../../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
  TOKEN_KEY: 'authToken',
  USER_KEY: 'userData',
}));

jest.mock('../../services/notificationService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    registerForPushNotifications: jest.fn(),
    unregister: jest.fn(),
    scheduleLocal: jest.fn(),
    cancelAll: jest.fn(),
    cleanup: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockApiResponses.auth.loginSuccess);
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ 
        data: mockApiResponses.auth.profileData 
      });

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email,
        password,
      });
      expect(apiClient.get).toHaveBeenCalledWith('/profile', {
        headers: {
          Authorization: `Bearer ${mockApiResponses.auth.loginSuccess.data.token}`,
        },
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        TOKEN_KEY, 
        mockApiResponses.auth.loginSuccess.data.token
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        USER_KEY, 
        JSON.stringify(mockApiResponses.auth.profileData)
      );
      expect(notificationService.initialize).toHaveBeenCalled();
      expect(notificationService.registerForPushNotifications).toHaveBeenCalled();
      expect(result.token).toBe(mockApiResponses.auth.loginSuccess.data.token);
      expect(result.user).toEqual(mockApiResponses.auth.profileData);
    });

    it('should throw error with invalid credentials (401)', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.auth.loginError);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Credenciales incorrectas. Verifica tu email y contraseña.'
      );
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(notificationService.initialize).not.toHaveBeenCalled();
    });

    it('should throw error when user not found (404)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.auth.loginNotFound);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow('Usuario no encontrado.');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.errors.networkError);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Network request failed'
      );
    });

    it('should throw error when no token received', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { user: mockApiResponses.auth.profileData } // Sin token
      });

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'No se pudo obtener el token de autenticación del servidor'
      );
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle notification service errors gracefully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockApiResponses.auth.loginSuccess);
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ 
        data: mockApiResponses.auth.profileData 
      });
      (notificationService.initialize as jest.Mock).mockRejectedValueOnce(
        new Error('Notification init failed')
      );

      // Act
      const result = await authService.login(email, password);

      // Assert - should still succeed even if notifications fail
      expect(result.token).toBe(mockApiResponses.auth.loginSuccess.data.token);
      expect(result.user).toEqual(mockApiResponses.auth.profileData);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, mockApiResponses.auth.loginSuccess.data.token);
    });

    it('should handle HTTP status >= 400 in response', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { token: 'some-token' }
      });

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Credenciales incorrectas. Verifica tu email y contraseña.'
      );
    });

    it('should handle 422 status code', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const error = {
        response: {
          status: 422,
          data: { error: 'Validation failed' }
        }
      };
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Credenciales incorrectas. Verifica tu email y contraseña.'
      );
    });

    it('should handle response error with custom message', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const error = {
        response: {
          status: 500,
          data: { error: 'Custom server error message' }
        }
      };
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Custom server error message'
      );
    });

    it('should handle response error with message field', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const error = {
        response: {
          status: 500,
          data: { message: 'Server message error' }
        }
      };
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Server message error'
      );
    });

    it('should handle response error without message or error field', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Error al iniciar sesión. Inténtalo de nuevo.'
      );
    });

    it('should handle error without response but with message', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const error = new Error('Custom error message');
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Custom error message'
      );
    });

    it('should handle error without response and without message', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const error = {}; // Error object without message or response
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        'Error de conexión. Verifica tu conexión a internet.'
      );
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      };
      const mockResponse = { data: { message: 'Usuario registrado exitosamente' } };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/users', { user: userData });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on registration failure', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: '123', // Contraseña muy corta
        password_confirmation: '123'
      };
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.errors.validationError);

      // Act & Assert
      await expect(authService.register(userData)).rejects.toEqual(
        mockApiResponses.errors.validationError
      );
    });
  });

  describe('logout', () => {
    it('should clear stored data on logout', async () => {
      // Act
      await authService.logout();

      // Assert
      expect(notificationService.unregister).toHaveBeenCalled();
      expect(notificationService.cleanup).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    });

    it('should handle notification cleanup errors gracefully', async () => {
      // Arrange
      (notificationService.unregister as jest.Mock).mockRejectedValueOnce(
        new Error('Cleanup failed')
      );

      // Act & Assert - should not throw
      await expect(authService.logout()).resolves.toBeUndefined();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when stored', async () => {
      // Arrange
      const userData = mockApiResponses.auth.profileData;
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(userData));

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(USER_KEY);
      expect(result).toEqual(userData);
    });

    it('should return null when no user stored', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error for invalid JSON', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-json');

      // Act & Assert
      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('valid-token');

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
      expect(result).toBe(true);
    });

    it('should return false when no token', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when empty token', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('');

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = {
        data: {
          message: 'Instrucciones de recuperación enviadas al email',
          email: email
        }
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on forgot password failure', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.auth.loginNotFound);

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toEqual(
        mockApiResponses.auth.loginNotFound
      );
    });
  });

  describe('validateToken', () => {
    it('should return valid result for valid token', async () => {
      // Arrange
      const token = 'valid-reset-token';
      const mockResponse = {
        data: { valid: true, message: 'Token válido' }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(
        `/auth/validate-token?token=${encodeURIComponent(token)}`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should return invalid result for invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      const mockError = {
        response: {
          data: { error: 'Token inválido o expirado' }
        }
      };
      
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: 'Token inválido o expirado'
      });
    });

    it('should return default error message when no response error', async () => {
      // Arrange
      const token = 'invalid-token';
      const mockError = new Error('Network error');
      
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: 'Error al validar el token'
      });
    });

    it('should return default error when response has no error data', async () => {
      // Arrange
      const token = 'invalid-token';
      const mockError = {
        response: {
          data: {}
        }
      };
      
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result).toEqual({
        valid: false,
        error: 'Error al validar el token'
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const token = 'valid-reset-token';
      const password = 'newPassword123';
      const passwordConfirmation = 'newPassword123';
      const mockResponse = {
        data: {
          message: 'Contraseña actualizada exitosamente',
          user: { id: 1, email: 'test@example.com', name: 'Test User' }
        }
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.resetPassword(token, password, passwordConfirmation);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on reset password failure', async () => {
      // Arrange
      const token = 'expired-token';
      const password = 'newPassword123';
      const passwordConfirmation = 'newPassword123';
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.errors.validationError);

      // Act & Assert
      await expect(
        authService.resetPassword(token, password, passwordConfirmation)
      ).rejects.toEqual(mockApiResponses.errors.validationError);
    });
  });

  describe('updateProfilePicture', () => {
    it('should update profile picture successfully', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      const mockResponse = {
        data: {
          user: {
            ...mockApiResponses.auth.profileData,
            profile_picture_url: 'https://example.com/profile.jpg'
          }
        }
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.updateProfilePicture(imageUri);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/profile-picture',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        USER_KEY,
        JSON.stringify(mockResponse.data.user)
      );
      expect(result).toEqual(mockResponse.data.user);
    });

    it('should throw error on profile picture update failure', async () => {
      // Arrange
      const imageUri = 'file://path/to/image.jpg';
      
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockApiResponses.errors.serverError);

      // Act & Assert
      await expect(authService.updateProfilePicture(imageUri)).rejects.toEqual(
        mockApiResponses.errors.serverError
      );
    });
  });

  describe('getProfilePicture', () => {
    it('should get profile picture successfully', async () => {
      // Arrange
      const userId = '1';
      const mockResponse = {
        data: {
          profile_picture_url: 'https://example.com/profile.jpg',
          user_id: userId,
          full_name: 'Test User'
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.getProfilePicture(userId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}/profile-picture`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when profile picture not found', async () => {
      // Arrange
      const userId = '999';
      
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockApiResponses.errors.notFoundError);

      // Act & Assert
      await expect(authService.getProfilePicture(userId)).rejects.toEqual(
        mockApiResponses.errors.notFoundError
      );
    });
  });
});
