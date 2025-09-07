import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { challengeService } from "../../services/challengeService";
import { Challenge, DIFFICULTY_LEVELS } from "../../types/challenge";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";
import {
  formatTimeRemaining,
  calculateCompletionRate,
} from "../../utils/challengeUtils";

type ChallengeManagementScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ChallengeManagement"
  >;
  route: RouteProp<RootStackParamList, "ChallengeManagement">;
};

const ChallengeManagementScreen: React.FC<ChallengeManagementScreenProps> = ({
  navigation,
  route,
}) => {
  const { challengeId } = route.params;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const challengeData = await challengeService.getChallengeDetail(
        challengeId
      );
      setChallenge(challengeData);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [challengeId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleDeleteChallenge = () => {
    if (!challenge) return;

    AppAlert.confirm(
      "Eliminar Desafío",
      `¿Estás seguro que quieres eliminar "${challenge.name}"? Esta acción no se puede deshacer y afectará a todos los participantes.`,
      async () => {
        try {
          await challengeService.deleteChallenge(challenge.id);
          AppAlert.success("Éxito", "Desafío eliminado correctamente");
          navigation.navigate("CoachChallengeList");
        } catch (error: any) {
          AppAlert.error("Error", error.message);
        }
      }
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Cargando datos...</Text>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-xl text-gray-600">
          No se pudo cargar el desafío
        </Text>
      </View>
    );
  }

  const difficulty =
    DIFFICULTY_LEVELS[challenge.difficulty_level] || DIFFICULTY_LEVELS[1];
  const timeRemaining = formatTimeRemaining(challenge.end_date);
  const isExpired = timeRemaining === "Expirado";

  const participantsCount = challenge.participants_count ?? 0;
  const completedAttempts = challenge.completed_attempts ?? 0;
  const totalAttempts = challenge.total_attempts ?? 0;
  const isActiveNow = challenge.is_active_now ?? false;

  const completionRate = calculateCompletionRate(
    completedAttempts,
    totalAttempts
  );

  const exercises = challenge.challenge_exercises || [];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Gestionar Desafío"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {challenge.name}
                </Text>
                <View
                  className={`self-start px-3 py-1 rounded-full ${difficulty.color}`}
                >
                  <Text className="text-sm font-medium">
                    {difficulty.emoji} {difficulty.name}
                  </Text>
                </View>
              </View>
              <View
                className={`px-3 py-2 rounded-lg ${
                  isExpired
                    ? "bg-red-100"
                    : isActiveNow
                    ? "bg-green-100"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isExpired
                      ? "text-red-800"
                      : isActiveNow
                      ? "text-green-800"
                      : "text-gray-800"
                  }`}
                >
                  {isExpired
                    ? "🔴 Expirado"
                    : isActiveNow
                    ? "🟢 Activo"
                    : "⚪ Inactivo"}
                </Text>
              </View>
            </View>

            {challenge.description && (
              <Text className="text-gray-700 leading-6 mb-4">
                {challenge.description}
              </Text>
            )}

            <Text
              className={`text-lg font-medium text-center ${
                isExpired ? "text-red-500" : "text-orange-500"
              }`}
            >
              {timeRemaining}
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
              📊 Estadísticas del Desafío
            </Text>
            <View className="grid grid-cols-2 gap-4">
              <View className="bg-blue-50 rounded-lg p-4 items-center">
                <Text className="text-3xl font-bold text-blue-600">
                  {participantsCount}
                </Text>
                <Text className="text-sm text-blue-800 text-center">
                  Participantes
                </Text>
              </View>
              <View className="bg-green-50 rounded-lg p-4 items-center">
                <Text className="text-3xl font-bold text-green-600">
                  {completedAttempts}
                </Text>
                <Text className="text-sm text-green-800 text-center">
                  Completados
                </Text>
              </View>
              <View className="bg-orange-50 rounded-lg p-4 items-center">
                <Text className="text-3xl font-bold text-orange-600">
                  {completionRate}%
                </Text>
                <Text className="text-sm text-orange-800 text-center">
                  Tasa Completación
                </Text>
              </View>
              <View className="bg-purple-50 rounded-lg p-4 items-center">
                <Text className="text-3xl font-bold text-purple-600">
                  {totalAttempts}
                </Text>
                <Text className="text-sm text-purple-800 text-center">
                  Intentos Totales
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              💪 Ejercicios ({exercises.length})
            </Text>
            {exercises.length > 0 ? (
              exercises.map((exerciseData, index) => (
                <View
                  key={exerciseData.id}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View className="w-8 h-8 bg-blue-100 rounded-full justify-center items-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {exerciseData.exercise?.name ||
                        `Ejercicio #${exerciseData.id}`}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {exerciseData.sets} series × {exerciseData.reps} reps
                      {exerciseData.rest_time_seconds > 0 &&
                        ` • ${exerciseData.rest_time_seconds}s descanso`}
                    </Text>
                    {exerciseData.notes && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {exerciseData.notes}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No hay ejercicios disponibles
              </Text>
            )}
          </View>

          <View className="space-y-3">
            <TouchableOpacity
              className="bg-gray-500 py-4 rounded-lg"
              onPress={() => navigation.navigate("CoachChallengeList")}
            >
              <Text className="text-white text-lg font-bold text-center">
                ← Volver a Mis Desafíos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500 py-4 rounded-lg"
              onPress={handleDeleteChallenge}
            >
              <Text className="text-white text-lg font-bold text-center">
                🗑️ Eliminar Desafío
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default ChallengeManagementScreen;
