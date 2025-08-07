import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { PublicProfile } from '../types/publicProfile';
import publicProfileService from '../services/publicProfileService';
import ScreenHeader from '../components/ScreenHeader';
import AppAlert from '../components/AppAlert';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PublicProfilesExploreScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async (page: number = 1, search?: string, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await publicProfileService.getPublicProfiles(page, search);
      
      if (response.success) {
        const newProfiles = response.data.profiles;
        
        if (append) {
          setProfiles(prev => [...prev, ...newProfiles]);
        } else {
          setProfiles(newProfiles);
        }
        
        setCurrentPage(response.data.pagination.current_page);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error) {
      AppAlert.error(error instanceof Error ? error.message : 'Error al cargar perfiles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProfiles(1, searchQuery);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadProfiles(1, searchQuery);
  };

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      loadProfiles(currentPage + 1, searchQuery, true);
    }
  };

  const navigateToProfile = (userId: number) => {
    navigation.navigate('PublicProfileDetail', { userId });
  };

  const renderProfileCard = ({ item }: { item: PublicProfile }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-100"
      onPress={() => navigateToProfile(item.id)}
    >
      <View className="flex-row items-center">
        {/* Profile Picture */}
        <View className="mr-4">
          {item.profile_picture_url ? (
            <Image
              source={{ uri: item.profile_picture_url }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
              <FontAwesome5 name="user" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            {item.name || 'Usuario anónimo'}
          </Text>
          
          {/* Stats Row */}
          <View className="flex-row items-center space-x-4">
            {item.completed_workouts_count !== undefined && (
              <View className="flex-row items-center">
                <FontAwesome5 name="dumbbell" size={14} color="#10B981" />
                <Text className="ml-1 text-sm text-gray-600">
                  {item.completed_workouts_count} workouts
                </Text>
              </View>
            )}
            
            {item.stats?.has_personal_records && (
              <View className="flex-row items-center">
                <FontAwesome5 name="trophy" size={14} color="#F59E0B" />
                <Text className="ml-1 text-sm text-gray-600">PRs</Text>
              </View>
            )}
            
            {item.stats?.favorite_exercises_count > 0 && (
              <View className="flex-row items-center">
                <FontAwesome5 name="heart" size={14} color="#EF4444" />
                <Text className="ml-1 text-sm text-gray-600">
                  {item.stats.favorite_exercises_count} favoritos
                </Text>
              </View>
            )}
          </View>

          {item.join_date && (
            <Text className="text-xs text-gray-500 mt-1">
              Miembro desde {item.join_date}
            </Text>
          )}
        </View>

        {/* Arrow */}
        <FontAwesome5 name="chevron-right" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <FontAwesome5 name="users" size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
        No hay perfiles públicos
      </Text>
      <Text className="text-gray-600 mt-2 text-center">
        {searchQuery ? 
          'No se encontraron perfiles que coincidan con tu búsqueda' :
          'Aún no hay usuarios con perfiles públicos'
        }
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Explorar Perfiles" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Cargando perfiles...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Explorar Perfiles" />
      
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <FontAwesome5 name="search" size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadProfiles(1);
              }}
            >
              <FontAwesome5 name="times" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profiles List */}
      <FlatList
        data={profiles}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PublicProfilesExploreScreen;
