import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import routineModificationService from "../../services/routineModificationService";
import {
  AIRoutine,
  ExerciseModificationSelection,
  RoutineModificationPayload,
} from "../../types/routineModification";
import AppAlert from "../../components/AppAlert";

type RoutineModificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RoutineModification"
>;
type RoutineModificationScreenRouteProp = RouteProp<
  RootStackParamList,
  "RoutineModification"
>;

interface Props {
  navigation: RoutineModificationScreenNavigationProp;
  route: RoutineModificationScreenRouteProp;
}

const RoutineModificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [aiRoutines, setAiRoutines] = useState<AIRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<AIRoutine | null>(
    null
  );
  const [exerciseSelections, setExerciseSelections] = useState<
    ExerciseModificationSelection[]
  >([]);
  const [modificationMessage, setModificationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAiRoutines();
  }, []);

  const loadAiRoutines = async () => {
    try {
      setLoading(true);
      const routines = await routineModificationService.getUserAIRoutines();
      setAiRoutines(routines);

      const routineId = route.params?.routineId;
      if (routineId) {
        const targetRoutine = routines.find(
          (routine) => routine.id === routineId
        );
        if (targetRoutine) {
          handleRoutineSelect(targetRoutine);
        }
      }
    } catch (error) {
      console.error("Error loading AI routines:", error);
      AppAlert.error(
        "Error",
        "No se pudieron cargar las rutinas de IA. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineSelect = (routine: AIRoutine) => {
    const routineWithModificationFlags = {
      ...routine,
      routine_exercises: routine.routine_exercises.map((exercise: any) => ({
        ...exercise,
        needs_modification: false,
      })),
    };

    setSelectedRoutine(routineWithModificationFlags);

    const initialSelections: ExerciseModificationSelection[] =
      routine.routine_exercises.map((exercise: any) => ({
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise.name,
        needsModification: false,
      }));
    setExerciseSelections(initialSelections);
  };

  const handleExerciseToggle = (exerciseId: number) => {
    const updatedSelections = exerciseSelections.map(
      (selection: ExerciseModificationSelection) =>
        selection.exerciseId === exerciseId
          ? { ...selection, needsModification: !selection.needsModification }
          : selection
    );

    if (selectedRoutine) {
      const updatedRoutine = {
        ...selectedRoutine,
        routine_exercises: selectedRoutine.routine_exercises.map(
          (exercise: any) =>
            exercise.exercise_id === exerciseId
              ? {
                  ...exercise,
                  needs_modification: !exercise.needs_modification,
                }
              : exercise
        ),
      };

      setSelectedRoutine(updatedRoutine);
    }

    setExerciseSelections(updatedSelections);
  };

  const handleSubmit = async () => {
    if (!selectedRoutine) {
      AppAlert.error("Error", "Selecciona una rutina para modificar.");
      return;
    }

    const selectedExercises = exerciseSelections.filter(
      (sel) => sel.needsModification
    );

    if (selectedExercises.length === 0) {
      AppAlert.error(
        "Error",
        "Debes marcar al menos un ejercicio para modificar antes de continuar."
      );
      return;
    }

    if (!modificationMessage.trim()) {
      AppAlert.error(
        "Error",
        "Ingresa un mensaje describiendo las modificaciones que deseas."
      );
      return;
    }

    try {
      setSubmitting(true);

      // NUEVO FLUJO: Obtener solo ejercicios seleccionados para modificar
      const exercisesToModify = selectedRoutine.routine_exercises.filter(
        (exercise: any) => {
          const selection = exerciseSelections.find(
            (sel) => sel.exerciseId === exercise.exercise_id
          );
          return selection?.needsModification || false;
        }
      );

      // Llamar al nuevo método que maneja el flujo completo
      const savedRoutine = await routineModificationService.modifyExercisesAndSaveRoutine(
        selectedRoutine,
        exercisesToModify,
        modificationMessage.trim()
      );

      AppAlert.success(
        "¡Éxito!",
        "Tu rutina ha sido modificada y guardada exitosamente.",
        [
          {
            text: "Ver rutina",
            onPress: () => {
              navigation.navigate("WorkoutTracker", {
                routineId: savedRoutine.id,
                viewMode: true,
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error modifying routine:", error);
      AppAlert.error(
        "Error",
        error.message || "No se pudo modificar la rutina. Inténtalo de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderRoutineCard = (routine: AIRoutine) => (
    <TouchableOpacity
      key={routine.id}
      onPress={() => handleRoutineSelect(routine)}
      className={`p-4 mb-3 rounded-lg border-2 ${
        selectedRoutine?.id === routine.id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {routine.name}
          </Text>
          <Text className="text-gray-600 mt-1">
            {routine.routine_exercises.length} ejercicios
          </Text>
          <Text className="text-gray-500 text-sm mt-1">Generada por IA</Text>
        </View>

        <FontAwesome5
          name={selectedRoutine?.id === routine.id ? "check-circle" : "circle"}
          size={24}
          color={selectedRoutine?.id === routine.id ? "#3B82F6" : "#9CA3AF"}
        />
      </View>
    </TouchableOpacity>
  );

  const renderExerciseSelection = () => {
    if (!selectedRoutine) return null;

    return (
      <View className="p-4 bg-white mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Selecciona los ejercicios que quieres modificar:
        </Text>

        {selectedRoutine.routine_exercises.map((exercise: any) => {
          const selection = exerciseSelections.find(
            (sel) => sel.exerciseId === exercise.exercise_id
          );
          const isSelected = selection?.needsModification || false;

          return (
            <TouchableOpacity
              key={exercise.exercise_id}
              onPress={() => handleExerciseToggle(exercise.exercise_id)}
              className={`p-4 mb-3 rounded-lg border-2 ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {exercise.exercise.name}
                  </Text>
                  <Text className="text-gray-600 mt-1">
                    {exercise.sets} series × {exercise.reps} reps
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Descanso: {exercise.rest_time}s
                  </Text>
                </View>

                <FontAwesome5
                  name={isSelected ? "check-circle" : "circle"}
                  size={24}
                  color={isSelected ? "#3B82F6" : "#9CA3AF"}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Cargando rutinas de IA...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          Modificar Rutina IA
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 bg-white mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Selecciona una rutina generada por IA:
          </Text>

          {aiRoutines.length === 0 ? (
            <View className="p-8 items-center">
              <FontAwesome5 name="robot" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4">
                No tienes rutinas generadas por IA.
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Crea una rutina con IA primero.
              </Text>
            </View>
          ) : (
            aiRoutines.map(renderRoutineCard)
          )}
        </View>

        {renderExerciseSelection()}

        {selectedRoutine && (
          <View className="p-4 bg-white mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Describe las modificaciones que deseas:
            </Text>

            <TextInput
              value={modificationMessage}
              onChangeText={setModificationMessage}
              placeholder="Ej: Quiero que los ejercicios de pecho sean más intensos y agregar más series de bíceps..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg p-3 text-gray-800 bg-white"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        )}

        {selectedRoutine && (
          <View className="p-4">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`p-4 rounded-lg items-center ${
                submitting ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Modificar Rutina
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoutineModificationScreen;
