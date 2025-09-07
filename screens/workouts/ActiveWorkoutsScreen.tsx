import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../types";
import workoutService from "../../services/workoutService";
import AppAlert from "../../components/AppAlert";
import { Workout } from "../../types/workout";

type ActiveWorkoutsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ActiveWorkouts">;
};

const ActiveWorkoutsScreen: React.FC<ActiveWorkoutsScreenProps> = ({
  navigation,
}) => {
  const [activeWorkouts, setActiveWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadActiveWorkouts();
  }, []);

  const loadActiveWorkouts = async () => {
    setLoading(true);
    try {
      const workouts = await workoutService.getActiveWorkouts();
      setActiveWorkouts(workouts);
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron cargar los entrenamientos activos. Verifica la conexión con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewWorkout = () => {
    navigation.navigate("RoutineSelect");
  };
  const handleContinueWorkout = (workout: Workout) => {
    navigation.navigate("WorkoutTracker", {
      routineId: workout.routine_id,
      workoutId: workout.id,
    });
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => {
    const lastActiveDate = new Date(item.updated_at || item.created_at);
    const timeAgo = getTimeAgo(lastActiveDate);

    return (
      <TouchableOpacity
        className="bg-white mb-4 rounded-lg shadow-sm overflow-hidden"
        onPress={() => handleContinueWorkout(item)}
      >
        <View className="border-l-4 border-indigo-600 p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800">
              {item.routine?.name || "Entrenamiento sin nombre"}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${
                item.status === "paused" ? "bg-amber-100" : "bg-green-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.status === "paused" ? "text-amber-800" : "text-green-800"
                }`}
              >
                {item.status === "paused" ? "Pausado" : "En progreso"}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 mt-1">
            {item.completed_exercises || 0}/
            {item.routine?.exercises?.length || 0} ejercicios completados
          </Text>

          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-sm text-gray-500">
              {item.status === "paused" ? "Pausado" : "Activo"} {timeAgo}
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-indigo-600 font-medium mr-1">
                Continuar
              </Text>
              <AntDesign name="right" size={16} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    } else if (diffMins > 0) {
      return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    } else {
      return "hace unos segundos";
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Entrenamientos"
            onBack={() => navigation.goBack()}
          />

          <View className="flex-1 p-4">
            <TouchableOpacity
              onPress={handleStartNewWorkout}
              className="bg-indigo-600 p-4 rounded-lg shadow-sm mb-6 flex-row items-center justify-center"
            >
              <AntDesign name="plus" size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">
                Iniciar nuevo entrenamiento
              </Text>
            </TouchableOpacity>

            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-4 text-gray-600">
                  Cargando entrenamientos...
                </Text>
              </View>
            ) : activeWorkouts.length > 0 ? (
              <>
                <Text className="font-semibold text-gray-700 mb-3">
                  Entrenamientos activos:
                </Text>
                <FlatList
                  data={activeWorkouts}
                  keyExtractor={(item: Workout) => item.id.toString()}
                  renderItem={renderWorkoutItem}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : (
              <View className="flex-1 justify-center items-center p-6">
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={64}
                  color="#d1d5db"
                />
                <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
                  No tienes entrenamientos activos
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Inicia uno nuevo para comenzar a ejercitarte
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ActiveWorkoutsScreen;
