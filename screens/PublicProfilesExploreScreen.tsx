import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { PublicProfile } from "../types/publicProfile";
import publicProfileService from "../services/publicProfileService";
import ScreenHeader from "../components/ScreenHeader";

type PublicProfilesExploreScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "PublicProfilesExplore"
  >;
};

const PublicProfilesExploreScreen: React.FC<
  PublicProfilesExploreScreenProps
> = ({ navigation }) => {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async (page: number = 1, search: string = "") => {
    try {
      setLoading(page === 1);
      setLoadingMore(page > 1);

      const response = await publicProfileService.getPublicProfiles(
        page,
        search
      );

      if (response.success && response.data) {
        const newProfiles = response.data.profiles || [];

        if (page === 1) {
          setProfiles(newProfiles);
          setCurrentPage(1);
        } else {
          setProfiles([...profiles, ...newProfiles]);
          setCurrentPage(page);
        }
        setHasMore(
          response.data.pagination.current_page <
            response.data.pagination.total_pages
        );
      }
    } catch (err) {
      console.error("Error loading public profiles:", err);
      if (page === 1) {
        setProfiles([]);
        setHasMore(false);
      }
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
    if (!loadingMore && hasMore) {
      loadProfiles(currentPage + 1, searchQuery);
    }
  };

  const navigateToProfile = (userId: number) => {
    navigation.navigate("PublicProfileDetail", { userId });
  };

  const renderProfileCard = ({ item }: { item: PublicProfile }) => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const safeName =
      item.name && typeof item.name === "string"
        ? item.name
        : "Usuario anónimo";
    const safeWorkoutCount =
      typeof item.completed_workouts_count === "number"
        ? item.completed_workouts_count
        : null;
    const safeJoinDate =
      item.join_date && typeof item.join_date === "string"
        ? item.join_date
        : null;
    const safeStats =
      item.stats && typeof item.stats === "object" ? item.stats : null;
    const safeFavoriteCount =
      safeStats &&
      typeof (safeStats as any).favorite_exercises_count === "number"
        ? (safeStats as any).favorite_exercises_count
        : 0;
    const hasPersonalRecords =
      safeStats && (safeStats as any).has_personal_records === true;

    return (
      <TouchableOpacity
        className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-100"
        onPress={() => navigateToProfile(item.id)}
      >
        <View className="flex-row items-center">
          <View className="mr-4">
            {item.profile_picture_url &&
            typeof item.profile_picture_url === "string" ? (
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

          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              {safeName}
            </Text>

            <View className="flex-row items-center">
              {safeWorkoutCount !== null && (
                <View className="flex-row items-center mr-4">
                  <FontAwesome5 name="dumbbell" size={14} color="#10B981" />
                  <Text className="ml-1 text-sm text-gray-600">
                    {safeWorkoutCount} workouts
                  </Text>
                </View>
              )}

              {hasPersonalRecords && (
                <View className="flex-row items-center mr-4">
                  <FontAwesome5 name="trophy" size={14} color="#F59E0B" />
                  <Text className="ml-1 text-sm text-gray-600">PRs</Text>
                </View>
              )}

              {safeFavoriteCount > 0 && (
                <View className="flex-row items-center">
                  <FontAwesome5 name="heart" size={14} color="#EF4444" />
                  <Text className="ml-1 text-sm text-gray-600">
                    {safeFavoriteCount} favoritos
                  </Text>
                </View>
              )}
            </View>

            {safeJoinDate && (
              <Text className="text-xs text-gray-500 mt-1">
                Miembro desde {safeJoinDate}
              </Text>
            )}
          </View>

          <FontAwesome5 name="chevron-right" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <FontAwesome5 name="users" size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
        No hay perfiles públicos
      </Text>
      <Text className="text-gray-600 mt-2 text-center">
        {searchQuery
          ? "No se encontraron perfiles que coincidan con tu búsqueda"
          : "Aún no hay usuarios con perfiles públicos"}
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
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Explorar Perfiles"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Cargando perfiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Explorar Perfiles"
        onBack={() => navigation.goBack()}
      />

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
                setSearchQuery("");
                loadProfiles(1);
              }}
            >
              <FontAwesome5 name="times" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={profiles}
        renderItem={renderProfileCard}
        keyExtractor={(item: PublicProfile) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default PublicProfilesExploreScreen;
