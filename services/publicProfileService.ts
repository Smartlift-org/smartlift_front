import { apiClient } from './apiClient';
import { 
  PublicProfilesResponse, 
  PublicProfileDetailResponse, 
  PrivacySettings, 
  PrivacySettingsResponse 
} from '../types/publicProfile';

class PublicProfileService {
  
  // Get list of public profiles (no authentication required)
  async getPublicProfiles(page: number = 1, search?: string): Promise<PublicProfilesResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', '20');
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`${apiClient.defaults.baseURL}/users/public-profiles?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching public profiles:', error);
      throw new Error('Error al cargar los perfiles públicos');
    }
  }

  // Get specific public profile (no authentication required)
  async getPublicProfile(userId: number): Promise<PublicProfileDetailResponse> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/users/${userId}/public-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Este perfil no es público o no existe');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching public profile:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al cargar el perfil público');
    }
  }

  // Get current user's privacy settings (requires authentication)
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await apiClient.get('/users/privacy-settings');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      throw new Error('Error al cargar la configuración de privacidad');
    }
  }

  // Update current user's privacy settings (requires authentication)
  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettingsResponse> {
    try {
      const response = await apiClient.put('/users/privacy-settings', {
        privacy_settings: settings
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al actualizar la configuración de privacidad');
    }
  }
}

export default new PublicProfileService();
