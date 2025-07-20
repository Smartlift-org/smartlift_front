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
import {
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineService, { Routine } from "../services/routineService";

type Props = {
  navigation: any;
  route: any;
};

const RoutineManagementScreen: React.FC<Props> = ({ navigation, route }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [routinesInUse, setRoutinesInUse] = useState<Record<number, boolean>>(
    {}
  );

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await routineService.getRoutines();
      setRoutines(data);

      const inUseMap: Record<number, boolean> = {};
      for (const routine of data) {
        inUseMap[routine.id] = await routineService.isRoutineInUse(routine.id);
      }
      setRoutinesInUse(inUseMap);
    } catch (error) {
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

  const handleDeleteRoutine = (routine: Routine) => {
    if (routinesInUse[routine.id]) {
      AppAlert.error(
        "No se puede eliminar",
        "Esta rutina está siendo utilizada en un entrenamiento activo. Finaliza el entrenamiento antes de eliminarla."
      );
      return;
    }

    AppAlert.confirm(
      "Eliminar rutina",
      `¿Estás seguro de que deseas eliminar la rutina "${routine.name}"?`,
      async () => {
        try {
          await routineService.deleteRoutine(routine.id);
          AppAlert.success("Éxito", "Rutina eliminada correctamente");
          loadRoutines();
        } catch (error) {
          AppAlert.error("Error", "No se pudo eliminar la rutina");
        }
      }
    );
  };

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
    <View className="bg-white rounded-xl mb-4 shadow flex-row">
      {routinesInUse[item.id] && (
        <View className="absolute top-2 right-20 bg-blue-500 px-2 py-1 rounded z-10">
          <Text className="text-white text-xs font-medium">En uso</Text>
        </View>
      )}
      <View className="flex-1 p-4 relative">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-800 flex-1">
            {item.name}
          </Text>
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
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
            <Text className="text-xs text-gray-600 ml-1">
              {getExerciseCount(item)} ejercicios
            </Text>
          </View>
          <View className="flex-row items-center">
            <AntDesign name="clockcircle" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">
              {item.duration} min
            </Text>
          </View>
          <Text className="text-xs text-gray-600">
            Creada: {item.formatted_created_at.split(" ")[0]}
          </Text>
        </View>
      </View>

      <View className="p-2 justify-center items-center border-l border-gray-100">
        <TouchableOpacity
          className="w-8 h-8 rounded-full justify-center items-center mb-1 bg-blue-50"
          onPress={() => {
            if (routinesInUse[item.id]) {
              AppAlert.info(
                "No se puede editar",
                "Esta rutina está siendo utilizada en un entrenamiento activo. Finaliza el entrenamiento antes de editarla."
              );
              return;
            }
            navigation.navigate("RoutineEdit", { routineId: item.id });
          }}
        >
          <AntDesign name="edit" size={16} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-8 h-8 rounded-full justify-center items-center bg-red-50"
          onPress={() => handleDeleteRoutine(item)}
          disabled={routinesInUse[item.id]}
        >
          <Feather
            name="trash-2"
            size={16}
            color={routinesInUse[item.id] ? "#ccc" : "#F44336"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]" edges={["top"]}>
      <ScreenHeader
        title="Gestión de Rutinas"
        onBack={() => navigation.goBack()}
      />

      <View className="flex-1 px-4 pb-4">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0066CC" />
            <Text className="mt-2.5 text-base text-gray-700">
              Cargando rutinas...
            </Text>
          </View>
        ) : (
          <>
            {routines.length === 0 ? (
              <View className="flex-1 justify-center items-center pb-24">
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={64}
                  color="#ccc"
                />
                <Text className="text-xl text-gray-600 mt-4 font-semibold">
                  No tienes rutinas
                </Text>
                <Text className="text-base text-gray-500 mt-2 mb-6">
                  Crea tu primera rutina para comenzar
                </Text>

                <TouchableOpacity
                  className="flex-row items-center bg-[#0066CC] px-6 py-3 rounded-full mt-4"
                  onPress={() => navigation.navigate("RoutineCreate")}
                >
                  <Text className="text-white font-semibold mr-2 text-base">
                    Crear rutina
                  </Text>
                  <AntDesign name="plus" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={routines}
                renderItem={renderRoutineItem}
                keyExtractor={(item: Routine) => item.id.toString()}
                contentContainerClassName="py-5"
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

            <View className="absolute right-4 bottom-20">
              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center bg-purple-600 mb-2 shadow"
                onPress={() => navigation.navigate("AIRoutineGenerator")}
              >
                <FontAwesome5 name="magic" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center bg-[#0066CC] shadow"
                onPress={() => navigation.navigate("RoutineCreate")}
              >
                <AntDesign name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoutineManagementScreen;
