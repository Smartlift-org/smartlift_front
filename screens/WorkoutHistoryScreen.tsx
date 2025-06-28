import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { StatusBar, Platform } from "react-native";
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import workoutService from "../services/workoutService";
import { Workout } from "../types/workout";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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

type WorkoutHistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutHistory">;
};

const WorkoutHistoryScreen: React.FC<WorkoutHistoryScreenProps> = ({
  navigation,
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutService.getWorkouts();

      const completedWorkouts = data
        .filter((workout) => workout.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setWorkouts(completedWorkouts);
    } catch (error) {
      console.error("Error al cargar entrenamientos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const renderWorkoutItem = ({
    item,
  }: {
    item: Workout;
  }): React.ReactElement => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-4 shadow-sm"
      onPress={() =>
        navigation.navigate("WorkoutTracker", {
          routineId: item.routine_id,
          viewMode: true,
        })
      }
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800 flex-1">
          {item.routine?.name || "Entrenamiento"}
        </Text>
        <Text className="text-sm text-gray-500">
          {formatDate(item.created_at)}
        </Text>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-row items-center">
          <FontAwesome5
            name="clock"
            size={16}
            color="#0066CC"
            className="mr-1.5"
          />
          <Text className="text-base text-gray-600">
            {formatDuration(item.routine?.duration || 0)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="weight-lifter"
            size={18}
            color="#0066CC"
            className="mr-1.5"
          />
          <Text className="text-base text-gray-600">
            {item.exercises?.filter((ex) =>
              ex.sets?.some((set) => set.completed)
            )?.length || 0}
            /{item.routine?.exercises?.length || item.exercises?.length || 0}{" "}
            ejercicios
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3 items-end">
        <Text className="text-indigo-600 font-medium text-sm">
          Ver detalles <AntDesign name="right" size={12} color="#0066CC" />
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2.5 text-base text-gray-600">
          Cargando historial...
        </Text>
      </View>
    );
  }

  const androidPaddingTop =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      style={{ paddingTop: androidPaddingTop }}
    >
      <ScreenHeader
        title="Historial de Entrenamientos"
        onBack={() => navigation.goBack()}
      />

      {workouts.length === 0 ? (
        <View className="flex-1 justify-center items-center p-5">
          <MaterialCommunityIcons name="history" size={80} color="#cccccc" />
          <Text className="mt-5 text-lg font-bold text-gray-600 text-center">
            No tienes entrenamientos completados
          </Text>
          <Text className="mt-2.5 text-base text-gray-400 text-center">
            Completa tu primer entrenamiento para verlo aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item: Workout) => `workout-${item.id}`}
          contentContainerClassName="p-4 pb-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default WorkoutHistoryScreen;
