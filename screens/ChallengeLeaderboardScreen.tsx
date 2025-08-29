import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import { challengeService } from "../services/challengeService";
import { ChallengeLeaderboard, LeaderboardEntry } from "../types/challenge";
import AppAlert from "../components/AppAlert";
import ScreenHeader from "../components/ScreenHeader";
import { getMedalEmoji, getPositionColor, formatChallengeDate } from "../utils/challengeUtils";

type ChallengeLeaderboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChallengeLeaderboard">;
  route: RouteProp<RootStackParamList, "ChallengeLeaderboard">;
};

const ChallengeLeaderboardScreen: React.FC<ChallengeLeaderboardScreenProps> = ({ navigation, route }) => {
  const { challengeId } = route.params;

  const [leaderboardData, setLeaderboardData] = useState<ChallengeLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await challengeService.getChallengeLeaderboard(challengeId);
      setLeaderboardData(data);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [challengeId]);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [loadLeaderboard])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLeaderboard();
  }, [loadLeaderboard]);


  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    if (!item || !item.user?.id) return null;
    
    const isCurrentUser = leaderboardData?.user_best_attempt?.user?.id === item.user.id;

    return (
      <View
        className={`bg-white rounded-lg p-4 mb-3 shadow-sm border-l-4 ${
          isCurrentUser ? "border-l-blue-500 bg-blue-50" : "border-l-transparent"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
              <Text className="text-2xl">{getMedalEmoji(item.position || 0)}</Text>
            </View>
            <View className="flex-1">
              <Text className={`font-bold text-lg ${isCurrentUser ? "text-blue-900" : "text-gray-900"}`}>
                {item.user.full_name || "Usuario"}
                {isCurrentUser && " (Tú)"}
              </Text>
              <Text className="text-sm text-gray-600">
                Completado el {item.completed_at ? formatChallengeDate(item.completed_at) : "N/A"}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className={`text-2xl font-bold ${getPositionColor(item.position || 0)}`}>
              #{item.position || "N/A"}
            </Text>
            <Text className="text-lg font-bold text-green-600">
              {item.formatted_time || "N/A"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUserBestAttempt = () => {
    if (!leaderboardData?.user_best_attempt?.user?.id) return null;

    const userAttempt = leaderboardData.user_best_attempt;
    const userPosition = leaderboardData.leaderboard?.findIndex(
      entry => entry.user?.id === userAttempt.user.id
    ) + 1;

    return (
      <View className="bg-blue-500 rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-white text-lg font-bold mb-2 text-center">
          🏆 Tu Mejor Resultado
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="items-center">
            <Text className="text-white text-sm opacity-90">Posición</Text>
            <Text className="text-white text-2xl font-bold">
              #{userPosition || "N/A"}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-sm opacity-90">Tiempo</Text>
            <Text className="text-white text-2xl font-bold">
              {userAttempt.formatted_completion_time}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white bg-opacity-20 px-4 py-2 rounded-lg"
            onPress={() => navigation.navigate("MyAttempts", { challengeId })}
          >
            <Text className="text-white font-medium">Ver Historial</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-6xl mb-4">🏆</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        Aún no hay clasificaciones
      </Text>
      <Text className="text-gray-600 text-center px-8 leading-6">
        ¡Sé el primero en completar este desafío y aparecer en el ranking!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center" edges={["top"]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Cargando ranking...</Text>
      </SafeAreaView>
    );
  }

  if (!leaderboardData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center" edges={["top"]}>
        <Text className="text-xl text-gray-600">No se pudo cargar el ranking</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader title="Ranking del Desafío" onBack={() => navigation.goBack()} />
          <FlatList
        data={leaderboardData.leaderboard?.filter(item => item?.user?.id) || []}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => `${item.user?.id || index}-${item.position || index}`}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Challenge Info */}
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                {leaderboardData.challenge.name}
              </Text>
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">
                    {leaderboardData.total_participants ?? 0}
                  </Text>
                  <Text className="text-sm text-gray-600">Participantes</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {leaderboardData.total_completed ?? leaderboardData.leaderboard?.length ?? 0}
                  </Text>
                  <Text className="text-sm text-gray-600">Completados</Text>
                </View>
              </View>
            </View>

            {renderUserBestAttempt()}

            {leaderboardData.leaderboard.length > 0 && (
              <Text className="text-lg font-bold text-gray-900 mb-3">
                🏆 Clasificación General
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Action Buttons */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-lg mb-2"
          onPress={() => navigation.navigate("ChallengeDetail", { challengeId })}
        >
          <Text className="text-white text-lg font-bold text-center">
            Ver Desafío
          </Text>
        </TouchableOpacity>
        {leaderboardData.user_best_attempt && (
          <TouchableOpacity
            className="bg-gray-500 py-3 rounded-lg"
            onPress={() => navigation.navigate("MyAttempts", { challengeId })}
          >
            <Text className="text-white font-medium text-center">
              Mi Historial de Intentos
            </Text>
          </TouchableOpacity>
        )}
        </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ChallengeLeaderboardScreen;
