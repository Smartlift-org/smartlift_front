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
import { RootStackParamList } from "../types";
import routineService, { Routine } from "../services/routineService";
import {
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";

type Props = {
  navigation: any;
  route: any;
};

const RoutineListScreen: React.FC<Props> = ({ navigation, route }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await routineService.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error("Error al cargar rutinas:", error);
      AppAlert.error("Error", "Error al cargar rutinas");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutines();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  useEffect(() => {
    if (route.params?.refresh) {
      loadRoutines();
    }
  }, [route.params?.refresh]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
      case "principiante":
        return "#4CAF50";
      case "intermediate":
      case "intermedio":
        return "#FF9800";
      case "advanced":
      case "avanzado":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  const translateDifficulty = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return difficulty;
    }
  };

  const getExerciseCount = (routine: Routine): number => {
    return routine.routine_exercises.length;
  };

  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-4 shadow-sm"
      onPress={() => {
        navigation.navigate("WorkoutTracker", {
          routineId: item.id,
          viewMode: true,
        });
      }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800 flex-1">
          {item.name}
        </Text>
        <View
          style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
          className="px-2 py-1 rounded"
        >
          <Text className="text-white text-xs font-medium">
            {translateDifficulty(item.difficulty)}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
        {item.description}
      </Text>

      <View className="flex-row justify-between border-t border-gray-100 pt-3">
        <View className="flex-row items-center">
          <FontAwesome5 name="dumbbell" size={14} color="#666" />
          <Text className="text-sm text-gray-600 ml-1">
            {getExerciseCount(item)} ejercicios
          </Text>
        </View>
        <View className="flex-row items-center">
          <AntDesign name="clockcircle" size={14} color="#666" />
          <Text className="text-sm text-gray-600 ml-1">
            {item.duration} min
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Creada: {item.formatted_created_at.split(" ")[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title={"Tus Rutinas"}
        onBack={() => {
          navigation.goBack();
        }}
      />

      <View className="flex-1 px-4 pb-4">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0066CC" />
            <Text className="mt-2.5 text-base text-gray-600">
              Cargando rutinas...
            </Text>
          </View>
        ) : (
          <>
            {routines.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={64}
                  color="#ccc"
                />
                <Text className="mt-4 text-lg font-semibold text-gray-600">
                  No se encontraron rutinas
                </Text>
                <Text className="mt-2 text-base text-gray-400">
                  Crea una rutina para comenzar
                </Text>
              </View>
            ) : (
              <FlatList
                data={routines}
                renderItem={renderRoutineItem}
                keyExtractor={(item: Routine) => item.id.toString()}
                contentContainerClassName="pb-20"
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={["#0066CC"]}
                  />
                }
              />
            )}

            <TouchableOpacity
              className="absolute bottom-5 left-4 right-4 bg-white rounded-full py-3.5 px-5 flex-row justify-center items-center shadow-sm"
              onPress={() => navigation.navigate("RoutineManagement")}
            >
              <Text className="text-blue-600 text-base font-semibold mr-2">
                Crear o editar rutinas
              </Text>
              <AntDesign name="appstore-o" size={16} color="#0066CC" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoutineListScreen;
