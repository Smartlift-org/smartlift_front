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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { challengeService } from "../services/challengeService";
import { Challenge, DIFFICULTY_LEVELS } from "../types/challenge";
import AppAlert from "../components/AppAlert";
import ScreenHeader from "../components/ScreenHeader";
import {
  formatTimeRemaining,
  getChallengeCardStatusColor,
} from "../utils/challengeUtils";

type CoachChallengeListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CoachChallengeList"
>;

const CoachChallengeListScreen: React.FC = () => {
  const navigation = useNavigation<CoachChallengeListNavigationProp>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChallenges = useCallback(async () => {
    try {
      const challengeData = await challengeService.getMyChallenges();
      setChallenges(challengeData);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChallenges();
  }, [loadChallenges]);

  const handleDeleteChallenge = (challenge: Challenge) => {
    AppAlert.confirm(
      "Eliminar Desafío",
      `¿Estás seguro que quieres eliminar "${challenge.name}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await challengeService.deleteChallenge(challenge.id);
          setChallenges((prev) => prev.filter((c) => c.id !== challenge.id));
          AppAlert.success("Éxito", "Desafío eliminado correctamente");
        } catch (error: any) {
          AppAlert.error("Error", "Error al eliminar desafío");
        }
      }
    );
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => {
    const difficulty = DIFFICULTY_LEVELS[item.difficulty_level];
    const timeRemaining = formatTimeRemaining(item.end_date);
    const isExpired = timeRemaining === "Expirado";

    return (
      <TouchableOpacity
        className={`rounded-lg p-4 mb-4 shadow-sm border ${getChallengeCardStatusColor(
          item.end_date,
          item.is_active_now
        )}`}
        onPress={() =>
          navigation.navigate("ChallengeManagement", { challengeId: item.id })
        }
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          <View className={`px-2 py-1 rounded-full ${difficulty.color}`}>
            <Text className="text-xs font-medium">
              {difficulty.emoji} {difficulty.name}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 mr-4">
              👥 {item.participants_count} participantes
            </Text>
            <Text className="text-sm text-gray-500 mr-4">
              ✅ {item.completed_attempts} completados
            </Text>
            {item.estimated_duration_minutes && (
              <Text className="text-sm text-gray-500">
                ⏱️ {item.estimated_duration_minutes} min
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Text
            className={`text-sm font-medium ${
              isExpired ? "text-red-500" : "text-orange-500"
            }`}
          >
            {timeRemaining}
          </Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="bg-blue-500 px-3 py-1 rounded"
              onPress={() =>
                navigation.navigate("ChallengeLeaderboard", {
                  challengeId: item.id,
                })
              }
            >
              <Text className="text-white text-sm font-medium">Ranking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 px-3 py-1 rounded"
              onPress={() => handleDeleteChallenge(item)}
            >
              <Text className="text-white text-sm font-medium">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-sm text-gray-500">
            {item.challenge_exercises?.length || 0} ejercicios •{" "}
            {item.total_attempts} intentos totales
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStats = () => {
    const activeChallenges = challenges.filter((c) => c.is_active_now).length;
    const totalParticipants = challenges.reduce(
      (sum, c) => sum + (c.participants_count || 0),
      0
    );
    const totalCompletions = challenges.reduce(
      (sum, c) => sum + (c.completed_attempts || 0),
      0
    );

    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
          📊 Estadísticas Generales
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {challenges.length}
            </Text>
            <Text className="text-sm text-gray-600">Total Desafíos</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {activeChallenges}
            </Text>
            <Text className="text-sm text-gray-600">Activos</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {totalParticipants}
            </Text>
            <Text className="text-sm text-gray-600">Participantes</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-purple-600">
              {totalCompletions}
            </Text>
            <Text className="text-sm text-gray-600">Completados</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-6xl mb-4">🏆</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        No has creado desafíos
      </Text>
      <Text className="text-gray-600 text-center px-8 leading-6 mb-6">
        Los desafíos son una excelente manera de motivar a tus usuarios y crear
        competencia saludable.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg"
        onPress={() => navigation.navigate("CreateChallenge")}
      >
        <Text className="text-white font-bold">Crear Desafío</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 justify-center items-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Cargando desafíos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Gestión de Desafíos"
            onBack={() => navigation.goBack()}
          />
          <FlatList
            data={challenges}
            renderItem={renderChallengeCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              challenges && challenges.length > 0 ? renderStats : null
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default CoachChallengeListScreen;
