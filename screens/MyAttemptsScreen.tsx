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
import { challengeAttemptService } from "../services/challengeAttemptService";
import { ChallengeAttempt } from "../types/challenge";
import AppAlert from "../components/AppAlert";
import ScreenHeader from "../components/ScreenHeader";
import {
  getAttemptStatusColor,
  getAttemptStatusText,
  getAttemptStatusEmoji,
  formatChallengeDate,
  formatSecondsToMinutesSeconds,
} from "../utils/challengeUtils";

type MyAttemptsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MyAttempts">;
  route: RouteProp<RootStackParamList, "MyAttempts">;
};

const MyAttemptsScreen: React.FC<MyAttemptsScreenProps> = ({
  navigation,
  route,
}) => {
  const { challengeId } = route.params || {};

  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttempts = useCallback(async () => {
    try {
      let attemptsData;
      if (challengeId) {
        attemptsData = await challengeAttemptService.getMyAttempts(challengeId);
      } else {
        attemptsData = await challengeAttemptService.getAllMyAttempts();
      }
      setAttempts(attemptsData);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [challengeId]);

  useFocusEffect(
    useCallback(() => {
      loadAttempts();
    }, [loadAttempts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAttempts();
  }, [loadAttempts]);

  const renderAttemptItem = ({
    item,
    index,
  }: {
    item: ChallengeAttempt;
    index: number;
  }) => {
    const statusColor = getAttemptStatusColor(item.status);
    const statusText = getAttemptStatusText(item.status);
    const statusEmoji = getAttemptStatusEmoji(item.status);

    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-gray-900 mr-2">
                Intento #{attempts.length - index}
              </Text>
              {item.is_best_attempt && (
                <View className="bg-yellow-100 px-2 py-1 rounded-full">
                  <Text className="text-yellow-800 text-xs font-medium">
                    🏆 Mejor tiempo
                  </Text>
                </View>
              )}
            </View>
            {item.challenge?.name && (
              <Text className="text-sm font-semibold text-blue-600 mb-1">
                🎯 {item.challenge.name}
              </Text>
            )}
            <Text className="text-sm text-gray-600">
              Iniciado: {formatChallengeDate(item.started_at)}
            </Text>
            {item.status === "completed" && item.completion_time_seconds && (
              <Text className="text-sm text-gray-600">
                Duración:{" "}
                {formatSecondsToMinutesSeconds(item.completion_time_seconds)}
              </Text>
            )}
            {item.completed_at && item.status !== "completed" && (
              <Text className="text-sm text-gray-600">
                Finalizado: {formatChallengeDate(item.completed_at)}
              </Text>
            )}
          </View>
          <View className={`px-3 py-1 rounded-full ${statusColor}`}>
            <Text className="text-sm font-medium">
              {statusEmoji} {statusText}
            </Text>
          </View>
        </View>

        {item.status === "completed" && item.formatted_completion_time && (
          <View className="border-t border-gray-100 pt-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-gray-600">Tiempo Total</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {item.formatted_completion_time}
                </Text>
              </View>
              {item.exercise_times &&
                Object.keys(item.exercise_times).length > 0 && (
                  <TouchableOpacity className="bg-gray-100 px-3 py-2 rounded-lg">
                    <Text className="text-gray-700 text-sm font-medium">
                      Ver Detalles
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        )}

        {item.status === "in_progress" && (
          <View className="border-t border-gray-100 pt-3">
            <TouchableOpacity
              className="bg-blue-500 py-2 rounded-lg"
              onPress={() => {
                const challengeIdToUse = challengeId || item.challenge_id;
                if (challengeIdToUse) {
                  navigation.navigate("ChallengeExecution", {
                    challengeId: challengeIdToUse,
                    attemptId: item.id,
                  });
                }
              }}
            >
              <Text className="text-white font-bold text-center">
                Continuar Intento
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStats = () => {
    const completedAttempts = attempts.filter((a) => a.status === "completed");

    const relevantAttempts = challengeId
      ? completedAttempts.filter((a) => a.challenge_id === challengeId)
      : completedAttempts;

    const completionTimes = relevantAttempts
      .map((a) => a.completion_time_seconds)
      .filter((time): time is number => typeof time === "number" && time > 0);

    const bestTime =
      completionTimes.length > 0 ? Math.min(...completionTimes) : null;
    const totalAttempts = attempts.length;

    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
          📊 Estadísticas
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {totalAttempts}
            </Text>
            <Text className="text-sm text-gray-600">Total</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {completedAttempts.length}
            </Text>
            <Text className="text-sm text-gray-600">Completados</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-yellow-600">
              {bestTime ? formatSecondsToMinutesSeconds(bestTime) : "--:--"}
            </Text>
            <Text className="text-sm text-gray-600">Mejor Tiempo</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-6xl mb-4">🏃</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        No hay intentos registrados
      </Text>
      <Text className="text-gray-600 text-center px-8 leading-6">
        Aún no has participado en ningún desafío. ¡Explora los desafíos
        disponibles!
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
        onPress={() => navigation.navigate("ChallengeList")}
      >
        <Text className="text-white font-bold">Ver Desafíos</Text>
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
        <Text className="text-gray-600 mt-4">Cargando historial...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Mis Intentos"
            onBack={() => navigation.goBack()}
          />
          <FlatList
            data={attempts}
            renderItem={renderAttemptItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={attempts.length > 0 ? renderStats : null}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default MyAttemptsScreen;
