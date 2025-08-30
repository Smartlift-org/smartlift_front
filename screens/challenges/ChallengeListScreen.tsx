import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types/challenge";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";
import { ChallengeCard } from "../../components/challenge";
import { useLoadingState } from "../../hooks/useLoadingState";

type ChallengeListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChallengeList">;
  route: RouteProp<RootStackParamList, "ChallengeList">;
};

const ChallengeListScreen: React.FC<ChallengeListScreenProps> = ({
  navigation,
  route,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const { isLoading: loading, withLoading } = useLoadingState(true);
  const { isLoading: refreshing, withLoading: withRefresh } = useLoadingState();
  const [noTrainerAssigned, setNoTrainerAssigned] = useState(false);

  const fetchChallenges = useCallback(async () => {
    const challengeData = await challengeService.getAvailableChallenges();
    setChallenges(challengeData);
    setNoTrainerAssigned(false);
  }, []);

  const handleChallengesFetch = useCallback(async () => {
    try {
      await fetchChallenges();
    } catch (error: any) {
      if (error.message === "No tienes un entrenador asignado") {
        setNoTrainerAssigned(true);
      } else {
        AppAlert.error("Error", error.message);
      }
    }
  }, [fetchChallenges]);

  const loadChallenges = useCallback(async () => {
    await withLoading(handleChallengesFetch);
  }, [withLoading, handleChallengesFetch]);

  const onRefresh = useCallback(async () => {
    await withRefresh(handleChallengesFetch);
  }, [withRefresh, handleChallengesFetch]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    return (
      <View>
        <ChallengeCard
          challenge={{
            id: item.id,
            name: item.name,
            description: item.description || "",
            difficulty_level: item.difficulty_level,
            estimated_duration: item.estimated_duration_minutes || 0,
            end_date: item.end_date,
            participants_count: item.participants_count ?? 0,
            completed_attempts: item.completed_attempts ?? 0,
          }}
          onPress={(challengeId) =>
            navigation.navigate("ChallengeDetail", { challengeId })
          }
          showStats={true}
        />
        <View className="-mt-4 mb-4">
          <View className="bg-white rounded-b-lg px-4 pb-4 shadow-sm">
            <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
              <Text className="text-sm text-gray-500">
                {item.challenge_exercises?.length || 0} ejercicios
              </Text>
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={() =>
                  navigation.navigate("ChallengeLeaderboard", {
                    challengeId: item.id,
                  })
                }
              >
                <Text className="text-white text-sm font-medium">
                  Ver Ranking
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-6xl mb-4">🏆</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        No hay desafíos disponibles
      </Text>
      <Text className="text-gray-600 text-center px-8 leading-6">
        Tu entrenador aún no ha creado desafíos para esta semana. ¡Mantente
        atento para nuevos retos!
      </Text>
    </View>
  );

  const renderNoTrainerState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-6xl mb-4">👨‍💼</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        No tienes entrenador asignado
      </Text>
      <Text className="text-gray-600 text-center px-8 leading-6">
        Para acceder a los desafíos necesitas tener un entrenador asignado.
        Contacta al administrador para que te asigne un entrenador.
      </Text>
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <ScreenHeader title="Desafíos" onBack={() => navigation.goBack()} />

      {noTrainerAssigned ? (
        renderNoTrainerState()
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChallengeItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={
            challenges.length === 0 ? { flex: 1 } : { padding: 16 }
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

export default ChallengeListScreen;
