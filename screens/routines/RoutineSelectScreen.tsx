import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import routineService from "../../services/routineService";

import { RootStackParamList } from "../../types";
import { Routine } from "../../types/routine";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";

type RoutineSelectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineSelect">;
  route: {
    params?: {
      fromActiveWorkouts?: boolean;
    };
  };
};

const RoutineSelectScreen: React.FC<RoutineSelectScreenProps> = ({
  navigation,
  route,
}) => {
  const { fromActiveWorkouts = false } = route.params || {};
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const data = await routineService.getRoutines();
      setRoutines(data);
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron cargar las rutinas. Verifica la conexión con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkActiveWorkoutsAndProceed = async (routineId: number) => {
    try {
      const activeWorkouts = await routineService.getActiveWorkouts();

      if (activeWorkouts && activeWorkouts.length > 0) {
        AppAlert.confirm(
          "Entrenamiento en curso",
          "Ya tienes un entrenamiento activo. ¿Deseas abandonarlo y comenzar uno nuevo?",
          async () => {
            try {
              for (const workout of activeWorkouts) {
                await routineService.abandonWorkout(workout.id as number);
              }
              navigation.navigate("WorkoutTracker", {
                routineId: routineId,
                viewMode: false,
              });
            } catch (error) {
              AppAlert.error(
                "Error",
                "No se pudo abandonar el entrenamiento actual."
              );
            }
          },
          () => {}
        );
      } else {
        navigation.navigate("WorkoutTracker", {
          routineId: routineId,
          viewMode: false,
        });
      }
    } catch (error) {
      AppAlert.error(
        "Error",
        "Ocurrió un problema al iniciar el entrenamiento."
      );
    }
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
          checkActiveWorkoutsAndProceed(routine.id);
        },
        () => {}
      );
    } else {
      checkActiveWorkoutsAndProceed(routine.id);
    }
  };

  const renderRoutineItem = ({ item }: { item: Routine }) => {
    const validationInfo = getValidationStatusInfo(item);

    return (
      <TouchableOpacity
        className="bg-white mb-4 rounded-lg overflow-hidden shadow-sm"
        onPress={() => handleRoutinePress(item)}
      >
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">
              {item.name}
            </Text>
            {(item.source_type === "ai_generated" ||
              item.ai_generated === true) && (
              <View className="bg-purple-100 px-2 py-1 rounded-full flex-row items-center">
                <FontAwesome5 name="robot" size={10} color="#7c3aed" />
                <Text className="text-xs text-purple-700 ml-1 font-medium">
                  IA
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row flex-wrap mt-1">
            <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-xs text-gray-700">
                {item.difficulty === "beginner"
                  ? "Principiante"
                  : item.difficulty === "intermediate"
                  ? "Intermedio"
                  : "Avanzado"}
              </Text>
            </View>

            <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-xs text-gray-700">{item.duration} min</Text>
            </View>

            <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-xs text-gray-700">
                {(item.routine_exercises && item.routine_exercises.length) ||
                  (item.exercises && item.exercises.length) ||
                  0}{" "}
                ejercicios
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 mt-2" numberOfLines={2}>
            {item.description}
          </Text>

          {validationInfo && (
            <View
              className={`${validationInfo.color} border rounded-lg p-2 mt-3`}
            >
              <View className="flex-row items-center">
                <FontAwesome5
                  name={validationInfo.icon}
                  size={12}
                  color={
                    validationInfo.textColor.includes("yellow")
                      ? "#d97706"
                      : validationInfo.textColor.includes("green")
                      ? "#059669"
                      : "#dc2626"
                  }
                />
                <Text
                  className={`${validationInfo.textColor} text-xs font-medium ml-2`}
                >
                  {validationInfo.text}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            className="mt-3 bg-indigo-600 rounded-lg py-2 px-4 shadow-sm"
            onPress={() => handleRoutinePress(item)}
          >
            <Text className="text-white text-center font-semibold">
              Iniciar Entrenamiento
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Elegir Rutina"
        onBack={() => {
          if (fromActiveWorkouts) {
            navigation.navigate("ActiveWorkouts");
          } else {
            navigation.goBack();
          }
        }}
      />

      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="mt-4 text-gray-600">Cargando rutinas...</Text>
          </View>
        ) : routines.length > 0 ? (
          <FlatList
            data={routines}
            keyExtractor={(item: Routine) => item.id.toString()}
            renderItem={renderRoutineItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-6">
            <MaterialCommunityIcons name="dumbbell" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
              No tienes rutinas disponibles
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Crea una rutina primero para poder iniciar un entrenamiento
            </Text>
            <TouchableOpacity
              className="mt-6 bg-indigo-600 rounded-lg py-3 px-6"
              onPress={() => navigation.navigate("RoutineCreate")}
            >
              <Text className="text-white font-semibold">Crear rutina</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoutineSelectScreen;
