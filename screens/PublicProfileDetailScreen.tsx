import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { PublicProfile, PersonalRecord } from '../types/publicProfile';
import publicProfileService from '../services/publicProfileService';
import ScreenHeader from '../components/ScreenHeader';
import AppAlert from '../components/AppAlert';

type RouteProps = RouteProp<RootStackParamList, 'PublicProfileDetail'>;

const PublicProfileDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { userId } = route.params;
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await publicProfileService.getPublicProfile(userId);
      
      if (response.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      AppAlert.error(error instanceof Error ? error.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const renderPersonalRecord = (pr: PersonalRecord, index: number) => (
    <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">{pr.exercise_name}</Text>
          <Text className="text-sm text-gray-600 mt-1">
            {pr.weight}kg × {pr.reps} reps
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center">
            <FontAwesome5 
              name="trophy" 
              size={12} 
              color={pr.pr_type === 'weight' ? '#F59E0B' : pr.pr_type === 'reps' ? '#10B981' : '#3B82F6'} 
            />
            <Text className="ml-1 text-xs text-gray-500 uppercase">
              {pr.pr_type === 'weight' ? 'Peso' : pr.pr_type === 'reps' ? 'Reps' : 'Volumen'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">{pr.achieved_at}</Text>
        </View>
      </View>
    </View>
  );

  const renderFavoriteExercise = (exercise: string, index: number) => (
    <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2">
      <View className="flex-row items-center">
        <FontAwesome5 name="heart" size={16} color="#EF4444" />
        <Text className="ml-3 font-medium text-gray-800">{exercise}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Perfil Público" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Perfil Público" />
        <View className="flex-1 items-center justify-center px-8">
          <FontAwesome5 name="user-slash" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
            Perfil no disponible
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            Este perfil no es público o no existe
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Perfil Público" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
          />
        }
      >
        {/* Profile Header */}
        <View className="bg-white p-6 border-b border-gray-200">
          <View className="items-center">
            {/* Profile Picture */}
            {profile.profile_picture_url ? (
              <Image
                source={{ uri: profile.profile_picture_url }}
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
                <FontAwesome5 name="user" size={32} color="#9CA3AF" />
              </View>
            )}

            {/* Name */}
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {profile.name || 'Usuario anónimo'}
            </Text>

            {/* Join Date */}
            {profile.join_date && (
              <Text className="text-gray-600 mb-4">
                Miembro desde {profile.join_date}
              </Text>
            )}

            {/* Stats Row */}
            <View className="flex-row items-center space-x-6">
              {profile.completed_workouts_count !== undefined && (
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5 name="dumbbell" size={16} color="#10B981" />
                    <Text className="ml-2 text-xl font-bold text-gray-800">
                      {profile.completed_workouts_count}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">Workouts</Text>
                </View>
              )}

              {profile.personal_records && (
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5 name="trophy" size={16} color="#F59E0B" />
                    <Text className="ml-2 text-xl font-bold text-gray-800">
                      {profile.personal_records.total_count}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">Records</Text>
                </View>
              )}

              {profile.favorite_exercises && profile.favorite_exercises.length > 0 && (
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5 name="heart" size={16} color="#EF4444" />
                    <Text className="ml-2 text-xl font-bold text-gray-800">
                      {profile.favorite_exercises.length}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">Favoritos</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Personal Records Section */}
        {profile.personal_records && profile.personal_records.recent.length > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-4">
            <View className="flex-row items-center mb-4">
              <FontAwesome5 name="trophy" size={20} color="#F59E0B" />
              <Text className="ml-3 text-lg font-semibold text-gray-800">
                Records Personales Recientes
              </Text>
            </View>
            
            {profile.personal_records.recent.map((pr, index) => 
              renderPersonalRecord(pr, index)
            )}
            
            {profile.personal_records.total_count > profile.personal_records.recent.length && (
              <Text className="text-center text-sm text-gray-500 mt-2">
                y {profile.personal_records.total_count - profile.personal_records.recent.length} records más
              </Text>
            )}
          </View>
        )}

        {/* Favorite Exercises Section */}
        {profile.favorite_exercises && profile.favorite_exercises.length > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-4">
            <View className="flex-row items-center mb-4">
              <FontAwesome5 name="heart" size={20} color="#EF4444" />
              <Text className="ml-3 text-lg font-semibold text-gray-800">
                Ejercicios Favoritos
              </Text>
            </View>
            
            {profile.favorite_exercises.map((exercise, index) => 
              renderFavoriteExercise(exercise, index)
            )}
          </View>
        )}

        {/* Empty State for Limited Profile */}
        {!profile.personal_records && !profile.favorite_exercises && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-8">
            <View className="items-center">
              <FontAwesome5 name="eye-slash" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-800 mt-4 text-center">
                Información limitada
              </Text>
              <Text className="text-gray-600 mt-2 text-center">
                Este usuario ha elegido mantener privados sus records personales y ejercicios favoritos
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PublicProfileDetailScreen;
