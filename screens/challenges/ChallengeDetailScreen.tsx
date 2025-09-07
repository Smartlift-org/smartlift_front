import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { challengeService } from "../../services/challengeService";
import { challengeAttemptService } from "../../services/challengeAttemptService";
import {
  Challenge,
  ChallengeAttempt,
  DIFFICULTY_LEVELS,
} from "../../types/challenge";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";
import { formatTimeRemaining } from "../../utils/challengeUtils";

type ChallengeDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChallengeDetail">;
  route: RouteProp<RootStackParamList, "ChallengeDetail">;
};

const ChallengeDetailScreen: React.FC<ChallengeDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { challengeId } = route.params;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userAttempts, setUserAttempts] = useState<ChallengeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAttempt, setStartingAttempt] = useState(false);

  const loadChallengeData = useCallback(async () => {
    if (!challengeId || challengeId === "undefined") {
      AppAlert.error("Error", "ID de desafío no válido");
      navigation.goBack();
      return;
    }

    try {
      const [challengeData, attemptsData] = await Promise.all([
        challengeService.getChallengeDetail(challengeId),
        challengeAttemptService.getMyAttempts(challengeId),
      ]);
      setChallenge(challengeData);
      setUserAttempts(attemptsData);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [challengeId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadChallengeData();
    }, [loadChallengeData])
  );

  const handleStartChallenge = async () => {
    if (!challenge) return;

    const activeAttempt = userAttempts.find(
      (attempt) => attempt.status === "in_progress"
    );
    if (activeAttempt) {
      Alert.alert(
        "Intento Activo",
        "Ya tienes un intento en progreso. ¿Quieres continuar con ese intento?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Continuar",
            onPress: () =>
              navigation.navigate("ChallengeExecution", {
                challengeId: challenge.id,
                attemptId: activeAttempt.id,
              }),
          },
        ]
      );
      return;
    }

    if (!isActiveNow) {
      AppAlert.info(
        "Desafío no disponible",
        "Este desafío no está activo en este momento"
      );
      return;
    }

    try {
      setStartingAttempt(true);
      const newAttempt = await challengeAttemptService.startAttempt(
        challengeId
      );
      navigation.navigate("ChallengeExecution", {
        challengeId: challenge.id,
        attemptId: newAttempt.id,
      });
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setStartingAttempt(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 justify-center items-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Cargando desafío...</Text>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 justify-center items-center"
        edges={["top"]}
      >
        <Text className="text-xl text-gray-600">Desafío no encontrado</Text>
      </SafeAreaView>
    );
  }

  const difficulty =
    DIFFICULTY_LEVELS[challenge.difficulty_level] || DIFFICULTY_LEVELS[1];
  const timeRemaining = formatTimeRemaining(challenge.end_date);
  const isExpired = timeRemaining === "Expirado";

  const participantsCount = challenge.participants_count ?? 0;
  const completedAttempts = challenge.completed_attempts ?? 0;
  const isActiveNow = challenge.is_active_now ?? false;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Detalle del Desafío"
            onBack={() => navigation.goBack()}
          />
          <ScrollView className="flex-1">
            <View className="p-4">
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
                </View>

                {challenge.description && (
                  <Text className="text-gray-700 leading-6 mb-4">
                    {challenge.description}
                  </Text>
                )}

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-sm text-gray-500">
                    👥 {participantsCount} participantes
                  </Text>
                  <Text className="text-sm text-gray-500">
                    🎯 {completedAttempts} completados
                  </Text>
                  {challenge.estimated_duration_minutes && (
                    <Text className="text-sm text-gray-500">
                      ⏱️ {challenge.estimated_duration_minutes} min
                    </Text>
                  )}
                </View>

                <Text
                  className={`text-lg font-medium text-center ${
                    isExpired ? "text-red-500" : "text-orange-500"
                  }`}
                >
                  {timeRemaining}
                </Text>
              </View>

              <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Ejercicios ({challenge.challenge_exercises?.length || 0})
                </Text>
                {challenge.challenge_exercises?.map((exerciseData, index) => (
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
                        {exerciseData.exercise.name}
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
                ))}
              </View>

              <View className="space-y-3">
                <TouchableOpacity
                  className={`py-4 rounded-lg ${
                    isExpired || startingAttempt
                      ? "bg-gray-300"
                      : "bg-green-500"
                  }`}
                  onPress={handleStartChallenge}
                  disabled={isExpired || startingAttempt}
                >
                  {startingAttempt ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-lg font-bold text-center">
                      {isExpired ? "Desafío Expirado" : "🚀 Comenzar Desafío"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-blue-500 py-4 rounded-lg"
                  onPress={() =>
                    navigation.navigate("ChallengeLeaderboard", { challengeId })
                  }
                >
                  <Text className="text-white text-lg font-bold text-center">
                    📊 Ver Ranking
                  </Text>
                </TouchableOpacity>

                {userAttempts.length > 0 && (
                  <TouchableOpacity
                    className="bg-gray-500 py-4 rounded-lg"
                    onPress={() =>
                      navigation.navigate("MyAttempts", { challengeId })
                    }
                  >
                    <Text className="text-white text-lg font-bold text-center">
                      📈 Mi Historial
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ChallengeDetailScreen;
