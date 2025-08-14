import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineService, { WorkoutSession } from "../services/routineService";
import workoutService from "../services/workoutService";

const formatDate = (dateString: string): string => {
  if (!dateString) {
    return "Fecha no disponible";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error en fecha";
  }
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes} min`;
  }
};

type WorkoutDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutDetail">;
  route: RouteProp<RootStackParamList, "WorkoutDetail">;
};

export default function WorkoutDetailScreen({
  navigation,
  route,
}: WorkoutDetailScreenProps) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);

      const workoutData = await routineService.getWorkout(workoutId);
      setWorkout(workoutData);

      const exercises = await workoutService.getWorkoutExercises(workoutId);
      setWorkoutExercises(exercises);
    } catch (error) {
      AppAlert.error("Error", "No se pudo cargar el detalle del entrenamiento");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, [workoutId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkoutData();
  };

  const calculateTotalWeight = () => {
    return workoutExercises.reduce((total, exercise) => {
      const exerciseWeight =
        exercise.sets?.reduce((exerciseTotal: number, set: any) => {
          return (
            exerciseTotal +
            (set.completed ? (set.weight || 0) * (set.reps || 0) : 0)
          );
        }, 0) || 0;
      return total + exerciseWeight;
    }, 0);
  };

  const calculateCompletedSets = () => {
    return workoutExercises.reduce((total, exercise) => {
      const completedSets =
        exercise.sets?.filter((set: any) => set.completed)?.length || 0;
      return total + completedSets;
    }, 0);
  };

  const calculateTotalSets = () => {
    return workoutExercises.reduce((total, exercise) => {
      return total + (exercise.sets?.length || 0);
    }, 0);
  };

  const getCompletedExercises = () => {
    return workoutExercises.filter((exercise) =>
      exercise.sets?.some((set: any) => set.completed)
    ).length;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Detalle del Entrenamiento"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066cc" />
          <Text className="mt-2.5 text-base text-gray-600">
            Cargando detalles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Detalle del Entrenamiento"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center p-5">
          <MaterialCommunityIcons
            name="alert-circle"
            size={80}
            color="#cccccc"
          />
          <Text className="mt-5 text-lg font-bold text-gray-600 text-center">
            No se pudo cargar el entrenamiento
          </Text>
          <Text className="mt-2.5 text-base text-gray-400 text-center">
            Intenta nuevamente más tarde
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Detalle del Entrenamiento"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {workout.routine_name || "Entrenamiento"}
          </Text>
          <Text className="text-sm text-gray-500 mb-3">
            {formatDate(workout.date || workout.start_time)}
          </Text>

          <View className="flex-row items-center mb-3">
            <View
              className={`px-3 py-1 rounded-full ${
                workout.status === "completed" ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  workout.status === "completed"
                    ? "text-green-800"
                    : "text-gray-600"
                }`}
              >
                {workout.status === "completed"
                  ? "Completado"
                  : workout.status === "abandoned"
                  ? "Abandonado"
                  : "En progreso"}
              </Text>
            </View>
          </View>

          {workout.notes && (
            <View className="mt-3 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm font-medium text-blue-800 mb-1">
                Notas:
              </Text>
              <Text className="text-sm text-blue-700">{workout.notes}</Text>
            </View>
          )}
        </View>

        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            📊 Estadísticas
          </Text>

          <View className="flex-row justify-between mb-3">
            <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {(workout as any)?.total_duration_seconds
                      ? formatDuration((workout as any).total_duration_seconds)
                      : "0 min"}
                  </Text>
                  <Text className="text-sm text-gray-600">Duración Total</Text>
                </View>
                <FontAwesome5 name="clock" size={24} color="#0066cc" />
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {calculateTotalWeight()} kg
                  </Text>
                  <Text className="text-sm text-gray-600">Peso Total</Text>
                </View>
                <MaterialCommunityIcons
                  name="weight-kilogram"
                  size={24}
                  color="#0066cc"
                />
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {calculateCompletedSets()}/{calculateTotalSets()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Sets Completados
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#10B981"
                />
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {getCompletedExercises()}/{workoutExercises.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Ejercicios</Text>
                </View>
                <FontAwesome5 name="dumbbell" size={20} color="#0066cc" />
              </View>
            </View>
          </View>
        </View>

        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Ejercicios Realizados
          </Text>

          {workoutExercises.map((exercise, index) => {
            const completedSets =
              exercise.sets?.filter((set: any) => set.completed) || [];
            const hasCompletedSets = completedSets.length > 0;

            return (
              <View
                key={index}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-gray-800 flex-1">
                    {exercise.exercise?.name || `Ejercicio ${index + 1}`}
                  </Text>
                  {hasCompletedSets && (
                    <View className="bg-green-100 px-2 py-1 rounded-full">
                      <Text className="text-xs font-medium text-green-800">
                        Completado
                      </Text>
                    </View>
                  )}
                </View>

                {exercise.exercise?.muscle_group && (
                  <Text className="text-sm text-gray-500 mb-3 capitalize">
                    {exercise.exercise.muscle_group}
                  </Text>
                )}

                {exercise.sets && exercise.sets.length > 0 && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Sets realizados:
                    </Text>

                    <View className="bg-gray-50 rounded-lg p-3">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-xs font-medium text-gray-500 w-12 text-center">
                          Set
                        </Text>
                        <Text className="text-xs font-medium text-gray-500 w-16 text-center">
                          Peso
                        </Text>
                        <Text className="text-xs font-medium text-gray-500 w-16 text-center">
                          Reps
                        </Text>
                        <Text className="text-xs font-medium text-gray-500 w-16 text-center">
                          Estado
                        </Text>
                      </View>

                      {exercise.sets.map((set: any, setIndex: number) => (
                        <View
                          key={setIndex}
                          className="flex-row justify-between items-center py-1"
                        >
                          <Text className="text-sm text-gray-700 w-12 text-center">
                            {set.set_number || setIndex + 1}
                          </Text>
                          <Text className="text-sm text-gray-700 w-16 text-center">
                            {set.weight || 0} kg
                          </Text>
                          <Text className="text-sm text-gray-700 w-16 text-center">
                            {set.reps || 0}
                          </Text>
                          <View className="w-16 items-center">
                            {set.completed ? (
                              <AntDesign
                                name="checkcircle"
                                size={16}
                                color="#10B981"
                              />
                            ) : (
                              <AntDesign
                                name="minuscircle"
                                size={16}
                                color="#9CA3AF"
                              />
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {(!exercise.sets || exercise.sets.length === 0) && (
                  <Text className="text-sm text-gray-500 italic">
                    No se registraron sets para este ejercicio
                  </Text>
                )}
              </View>
            );
          })}

          {workoutExercises.length === 0 && (
            <View className="bg-white rounded-xl p-8 items-center">
              <MaterialCommunityIcons
                name="weight-lifter"
                size={48}
                color="#cccccc"
              />
              <Text className="text-gray-500 mt-2 text-center">
                No se encontraron ejercicios para este entrenamiento
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
