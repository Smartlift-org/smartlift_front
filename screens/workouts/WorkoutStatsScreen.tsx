import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import workoutStatsService, {
  WorkoutStatsGeneral,
} from "../../services/workoutStatsService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";

const formatTotalTime = (seconds: number): string => {
  if (!seconds) return "0h 0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
};

type WorkoutStatsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutStats">;
  route: RouteProp<RootStackParamList, "WorkoutStats">;
};

const WorkoutStatsScreen: React.FC<WorkoutStatsScreenProps> = ({
  navigation,
  route,
}) => {
  const [stats, setStats] = useState<WorkoutStatsGeneral | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { message } = route.params || {};

  useEffect(() => {
    if (message) {
      AppAlert.success("Éxito", message);
    }
  }, [message]);

  const fetchStats = async () => {
    try {
      const data = await workoutStatsService.getGeneralStats();
      setStats(data);
    } catch (error) {
      AppAlert.error("Error", "Ocurrió un error al cargar tu información.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2.5 text-base text-gray-600">
          Cargando estadísticas...
        </Text>
      </View>
    );
  }

  if (!stats || stats.totalWorkouts === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Estadísticas de Entrenamiento"
          onBack={() => navigation.navigate("UserHome")}
        />

        <View className="flex-1 justify-center items-center p-5">
          <MaterialCommunityIcons
            name="weight-lifter"
            size={80}
            color="#cccccc"
          />
          <Text className="text-lg font-bold text-gray-600 mt-5 text-center">
            Aún no tienes entrenamientos registrados
          </Text>
          <Text className="text-base text-gray-500 mt-2.5 text-center">
            Completa tu primer entrenamiento para ver estadísticas
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Estadísticas de Entrenamiento"
        onBack={() => navigation.navigate("UserHome")}
      />
      <ScrollView
        className="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between mb-2.5">
          <View className="bg-white rounded-[10px] p-4 w-[48%] shadow-md relative">
            <Text className="text-2xl font-bold text-gray-800">
              {stats.totalWorkouts}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">Total Workouts</Text>
            <View className="absolute top-3 right-3">
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color="#0066cc"
              />
            </View>
          </View>

          <View className="bg-white rounded-[10px] p-4 w-[48%] shadow-md relative">
            <Text className="text-2xl font-bold text-gray-800">
              {formatTotalTime(stats.totalTime)}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">Tiempo Total</Text>
            <View className="absolute top-3 right-3">
              <AntDesign name="clockcircle" size={22} color="#0066cc" />
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-2.5">
          <View className="bg-white rounded-[10px] p-4 w-[48%] shadow-md relative">
            <Text className="text-2xl font-bold text-gray-800">
              {stats.completedWorkouts}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">Completados</Text>
            <View className="absolute top-3 right-3">
              <AntDesign name="check" size={24} color="#0066cc" />
            </View>
          </View>

          <View className="bg-white rounded-[10px] p-4 w-[48%] shadow-md relative">
            <Text className="text-2xl font-bold text-gray-800">
              {stats.totalWorkouts > 0
                ? `${Math.round(
                    (stats.completedWorkouts / stats.totalWorkouts) * 100
                  )}%`
                : "0%"}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">Tasa Éxito</Text>
            <View className="absolute top-3 right-3">
              <AntDesign name="barschart" size={24} color="#0066cc" />
            </View>
          </View>
        </View>

        <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          Rachas
        </Text>
        <View className="flex-row justify-between">
          <View className="bg-white rounded-[10px] p-4 w-[48%] shadow-md flex-row items-center">
            <View className="mr-3">
              <FontAwesome5
                name="fire"
                size={28}
                color={stats.currentStreak > 0 ? "#FF5722" : "#cccccc"}
              />
            </View>
            <View>
              <Text className="text-xl font-bold text-gray-800">
                {stats.currentStreak}
              </Text>
              <Text className="text-sm text-gray-600">Racha Actual</Text>
            </View>
          </View>

          <View className="bg-white rounded-[10px] p-4 w-[48%] shadow-md flex-row items-center">
            <View className="mr-3">
              <MaterialCommunityIcons
                name="trophy"
                size={28}
                color={stats.bestStreak > 0 ? "#FFC107" : "#cccccc"}
              />
            </View>
            <View>
              <Text className="text-xl font-bold text-gray-800">
                {stats.bestStreak}
              </Text>
              <Text className="text-sm text-gray-600">Mejor Racha</Text>
            </View>
          </View>
        </View>

        <View className="bg-[#e3f2fd] rounded-[10px] p-4 mt-5 mb-4 items-center">
          <Text className="text-base text-[#0066cc] text-center italic">
            {getMotivationalMessage(stats)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getMotivationalMessage = (stats: WorkoutStatsGeneral): string => {
  if (stats.currentStreak >= 3) {
    return `¡Impresionante! Llevas ${stats.currentStreak} días seguidos. ¡Mantén el ritmo!`;
  } else if (stats.completedWorkouts > 10) {
    return `Has completado ${stats.completedWorkouts} entrenamientos. ¡Tu constancia está dando resultados!`;
  } else if (stats.totalWorkouts > 0) {
    return "¡Buen trabajo! Cada entrenamiento te acerca más a tus objetivos.";
  }
  return "¡Comienza tu viaje fitness hoy!";
};

export default WorkoutStatsScreen;
