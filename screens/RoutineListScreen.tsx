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
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import routineService, { Routine } from "../services/routineService";
import {
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";

type RoutineListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineList">;
  route: RouteProp<RootStackParamList, "RoutineList">;
};

const RoutineListScreen: React.FC<RoutineListScreenProps> = ({ navigation, route }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await routineService.getRoutines();
      setRoutines(data);
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

  const getValidationStatusInfo = (routine: Routine) => {
    const isAIGenerated =
      routine.source_type === "ai_generated" ||
      (routine.ai_generated === true && routine.source_type !== "manual");

    if (isAIGenerated) {
      const status = routine.validation_status || "pending";
      switch (status) {
        case "pending":
          return {
            color: "bg-yellow-100 border-yellow-200",
            textColor: "text-yellow-800",
            icon: "exclamation-triangle",
            text: "Pendiente de validación",
            showWarning: true,
          };
        case "approved":
          return {
            color: "bg-green-100 border-green-200",
            textColor: "text-green-800",
            icon: "check-circle",
            text: "Validada por entrenador",
            showWarning: false,
          };
        case "rejected":
          return {
            color: "bg-red-100 border-red-200",
            textColor: "text-red-800",
            icon: "times-circle",
            text: "Rechazada",
            showWarning: true,
          };
        default:
          return null;
      }
    }
    return null;
  };

  const handleRoutinePress = (routine: Routine) => {
    const validationInfo = getValidationStatusInfo(routine);

    if (validationInfo?.showWarning) {
      AppAlert.confirm(
        "Rutina no validada",
        validationInfo.text === "Pendiente de validación"
          ? "Esta rutina fue generada por IA y aún no ha sido validada por un entrenador. Su uso es bajo tu propia responsabilidad. ¿Deseas continuar?"
          : "Esta rutina fue rechazada por un entrenador. Su uso es bajo tu propia responsabilidad. ¿Deseas continuar?",
        () => {
          navigation.navigate("WorkoutTracker", {
            routineId: routine.id,
            viewMode: false,
          });
        },
        () => {}
      );
    } else {
      navigation.navigate("WorkoutTracker", {
        routineId: routine.id,
        viewMode: false,
      });
    }
  };

  const renderRoutineItem = ({ item }: { item: Routine }) => {
    const validationInfo = getValidationStatusInfo(item);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-4 mb-4 shadow-sm"
        onPress={() => handleRoutinePress(item)}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-800 flex-1">
            {item.name}
          </Text>
          <View className="flex-row items-center space-x-2">
            {item.source_type === "ai_generated" && (
              <View className="flex-row items-center bg-indigo-100 px-2 py-1 rounded">
                <FontAwesome5 name="robot" size={10} color="#4f46e5" />
                <Text className="text-indigo-700 text-xs font-medium ml-1">
                  IA
                </Text>
              </View>
            )}
            <View
              style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
              className="px-2 py-1 rounded"
            >
              <Text className="text-white text-xs font-medium">
                {translateDifficulty(item.difficulty)}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        {validationInfo && (
          <View
            className={`${validationInfo.color} border rounded-lg p-2 mb-3`}
          >
            <View className="flex-row items-center">
              <FontAwesome5
                name={validationInfo.icon}
                size={12}
                color={validationInfo.textColor
                  .replace("text-", "")
                  .replace("-800", "")}
              />
              <Text
                className={`${validationInfo.textColor} text-xs font-medium ml-2`}
              >
                {validationInfo.text}
              </Text>
              {validationInfo.showWarning && (
                <Text className={`${validationInfo.textColor} text-xs ml-2`}>
                  - Usar bajo tu responsabilidad
                </Text>
              )}
            </View>
          </View>
        )}

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

        {(item.source_type === "ai_generated" ||
          item.ai_generated === true) && (
          <View className="border-t border-gray-100 pt-3 mt-3">
            <TouchableOpacity
              className="bg-indigo-600 rounded-lg py-2 px-4 flex-row items-center justify-center"
              onPress={(e: any) => {
                e.stopPropagation();
                navigation.navigate("RoutineModification", {
                  routineId: item.id,
                });
              }}
            >
              <FontAwesome5 name="robot" size={14} color="white" />
              <Text className="text-white font-medium ml-2">
                Modificar con IA
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title={"Tus Rutinas"}
        onBack={() => {
          const canGoBack = navigation.canGoBack();

          if (canGoBack) {
            navigation.goBack();
          } else {
            navigation.navigate("UserHome");
          }
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
