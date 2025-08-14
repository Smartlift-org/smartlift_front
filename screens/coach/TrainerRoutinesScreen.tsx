import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import trainerService from "../../services/trainerService";
import authService from "../../services/authService";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import type { RootStackParamList } from "../../types";
import type { TrainerRoutine } from "../../types/declarations/trainer";

type TrainerRoutinesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TrainerRoutines">;
  route: RouteProp<RootStackParamList, "TrainerRoutines">;
};

const TrainerRoutinesScreen: React.FC<TrainerRoutinesScreenProps> = ({
  navigation,
  route,
}) => {
  const [routines, setRoutines] = useState<TrainerRoutine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [trainerId, setTrainerId] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");

  const [assignModalVisible, setAssignModalVisible] = useState<boolean>(false);
  const [selectedRoutine, setSelectedRoutine] = useState<TrainerRoutine | null>(
    null
  );
  const [customName, setCustomName] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.id) {
          if (user.role !== "coach") {
            AppAlert.error(
              "Acceso denegado",
              "Solo los entrenadores pueden acceder a esta sección"
            );
            navigation.navigate("CoachHome");
            return;
          }

          setTrainerId(user.id);
          await loadRoutines(user.id);
        }
      } catch (error) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar los datos del entrenador"
        );
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (route.params?.refresh) {
      loadRoutines(trainerId);
    }
  }, [route.params?.refresh]);

  const loadRoutines = async (
    id: string,
    page: number = 1,
    difficulty: string = difficultyFilter
  ) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await trainerService.getRoutines(
        id,
        page,
        10,
        difficulty
      );

      if (page === 1) {
        setRoutines(response.routines || []);
      } else {
        setRoutines([...routines, ...(response.routines || [])]);
      }

      setCurrentPage(response.pagination?.current_page || 1);
      setTotalPages(response.pagination?.total_pages || 1);
    } catch (error) {
      AppAlert.error("Error", "Error al cargar rutinas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutines(trainerId, 1);
  };

  const handleLoadMore = async () => {
    if (currentPage < totalPages && !loading) {
      const nextPage = currentPage + 1;
      await loadRoutines(trainerId, nextPage);
    }
  };

  const handleFilterByDifficulty = (difficulty: string) => {
    if (difficultyFilter === difficulty) {
      setDifficultyFilter("");
      loadRoutines(trainerId, 1, "");
    } else {
      setDifficultyFilter(difficulty);
      loadRoutines(trainerId, 1, difficulty);
    }
  };

  const openAssignModal = (routine: TrainerRoutine) => {
    setSelectedRoutine(routine);
    setCustomName(routine.name);
    setAssignModalVisible(true);
  };

  const closeAssignModal = () => {
    setAssignModalVisible(false);
    setSelectedRoutine(null);
    setCustomName("");
  };

  const navigateToMemberSelection = () => {
    if (!selectedRoutine) return;

    closeAssignModal();
    navigation.navigate("MemberSelection", {
      routineId: selectedRoutine.id,
      customName: customName || selectedRoutine.name,
    });
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
      case "expert":
      case "experto":
        return "#9C27B0";
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
      case "expert":
        return "Experto";
      default:
        return difficulty;
    }
  };

  const getExerciseCount = (routine: TrainerRoutine): number => {
    return routine.routine_exercises?.length || 0;
  };

  const renderRoutineItem = ({ item }: { item: TrainerRoutine }) => (
    <View className="bg-white rounded-xl mb-4 shadow flex-row">
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-800 flex-1">
            {item.name}
          </Text>
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
          >
            <Text className="text-white text-xs font-semibold">
              {translateDifficulty(item.difficulty)}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text className="text-gray-600 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-700">
            {getExerciseCount(item)} ejercicios
          </Text>
        </View>
      </View>

      <View className="p-2 justify-center items-center border-l border-gray-100">
        <TouchableOpacity
          className="w-8 h-8 rounded-full justify-center items-center mb-1 bg-green-50"
          onPress={() => openAssignModal(item)}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={16}
            color="#4CAF50"
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-8 h-8 rounded-full justify-center items-center mb-1 bg-blue-50"
          onPress={() =>
            navigation.navigate("RoutineEdit", {
              routineId: item.id,
              refresh: true,
            })
          }
        >
          <AntDesign name="edit" size={16} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-8 h-8 rounded-full justify-center items-center bg-red-50"
          onPress={() => handleDeleteRoutine(item)}
        >
          <Feather name="trash-2" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDeleteRoutine = (routine: TrainerRoutine) => {
    AppAlert.confirm(
      "Eliminar rutina",
      `¿Estás seguro de que deseas eliminar la rutina "${routine.name}"? Esta acción no afectará a las rutinas ya asignadas a los miembros.`,
      async () => {
        try {
          AppAlert.success("Éxito", "Rutina eliminada correctamente");
          loadRoutines(trainerId);
        } catch (error) {
          AppAlert.error("Error", "No se pudo eliminar la rutina");
        }
      }
    );
  };

  const renderDifficultyFilter = () => (
    <View className="flex-row mb-4 justify-around">
      {["beginner", "intermediate", "advanced"].map((difficulty) => (
        <TouchableOpacity
          key={difficulty}
          className={`px-3 py-2 rounded-full ${
            difficultyFilter === difficulty ? "bg-indigo-600" : "bg-gray-200"
          }`}
          onPress={() => handleFilterByDifficulty(difficulty)}
        >
          <Text
            className={`font-medium ${
              difficultyFilter === difficulty ? "text-white" : "text-gray-700"
            }`}
          >
            {translateDifficulty(difficulty)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]" edges={["top"]}>
      <ScreenHeader
        title="Mis Rutinas"
        onBack={() => navigation.navigate("CoachHome")}
      />

      <View className="flex-1 px-4 pb-4">
        {renderDifficultyFilter()}

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
                <Text className="text-base text-gray-500 mt-2 mb-6 text-center px-6">
                  Crea tu primera rutina para comenzar a asignarlas a tus
                  miembros
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
                keyExtractor={(item: TrainerRoutine) => item.id.toString()}
                contentContainerClassName="py-2"
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={["#0066CC"]}
                  />
                }
                ListFooterComponent={
                  currentPage < totalPages && loading ? (
                    <View className="py-4 flex items-center">
                      <ActivityIndicator size="small" color="#0066CC" />
                    </View>
                  ) : null
                }
              />
            )}

            <View className="absolute right-4 bottom-6">
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

      <Modal
        transparent={true}
        visible={assignModalVisible}
        animationType="fade"
        onRequestClose={closeAssignModal}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full rounded-xl p-4 max-w-md">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Asignar rutina a miembro
            </Text>

            <Text className="text-gray-600 mb-2">
              Puedes personalizar el nombre de la rutina antes de asignarla:
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              value={customName}
              onChangeText={setCustomName}
              placeholder="Nombre de la rutina"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="bg-gray-200 rounded-lg px-4 py-2 mr-2"
                onPress={closeAssignModal}
              >
                <Text className="text-gray-800 font-medium">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-indigo-600 rounded-lg px-4 py-2"
                onPress={navigateToMemberSelection}
              >
                <Text className="text-white font-medium">Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TrainerRoutinesScreen;
