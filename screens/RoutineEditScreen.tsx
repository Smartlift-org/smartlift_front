import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineService, {
  Routine,
  RoutineFormData,
} from "../services/routineService";
import { RootStackParamList } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineEdit">;
  route: {
    params: {
      routineId: number;
    };
  };
};

const RoutineEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { routineId } = route.params;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [formData, setFormData] = useState<RoutineFormData>({
    name: "",
    description: "",
    difficulty: "beginner",
    duration: 0,
    routine_exercises_attributes: [],
  });

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        const data = await routineService.getRoutine(routineId);
        setRoutine(data);

        setFormData({
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          duration: data.duration,
          routine_exercises_attributes: data.routine_exercises.map(
            (exercise) => ({
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_time: exercise.rest_time,
              order: exercise.order,
            })
          ),
        });
      } catch (error) {
        console.error("Error al cargar la rutina:", error);
        AppAlert.error("Error", "No se pudo cargar la rutina");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId]);

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      AppAlert.error("Error", "Debes proporcionar un nombre para la rutina");
      return;
    }

    if (!formData.description.trim()) {
      AppAlert.error(
        "Error",
        "Debes proporcionar una descripción para la rutina"
      );
      return;
    }

    if (
      !formData.routine_exercises_attributes ||
      formData.routine_exercises_attributes.length === 0
    ) {
      AppAlert.error("Error", "La rutina debe tener al menos un ejercicio");
      return;
    }

    try {
      setSaving(true);
      await routineService.updateRoutine(routineId, formData);
      AppAlert.success("Éxito", "Rutina actualizada correctamente");
      navigation.navigate("RoutineManagement", { refresh: true });
    } catch (error) {
      console.error("Error al actualizar la rutina:", error);
      AppAlert.error("Error", "No se pudo actualizar la rutina");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExercise = async (exerciseId: number, index: number) => {
    try {
      const updatedExercises = formData.routine_exercises_attributes
        ? [...formData.routine_exercises_attributes]
        : [];
      updatedExercises.splice(index, 1);

      updatedExercises.forEach((ex, idx) => {
        ex.order = idx + 1;
      });

      setFormData({
        ...formData,
        routine_exercises_attributes: updatedExercises,
      });

      if (routine && routine.routine_exercises[index]?.id) {
        await routineService.removeExerciseFromRoutine(
          routineId,
          routine.routine_exercises[index].id
        );
      }
    } catch (error) {
      console.error("Error al eliminar ejercicio:", error);
      AppAlert.error("Error", "No se pudo eliminar el ejercicio");
      navigation.replace("RoutineEdit", { routineId });
    }
  };

  const handleAddExercises = () => {
    routineService
      .updateRoutine(routineId, {
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        duration: formData.duration,
      })
      .then(() => {
        navigation.navigate("ExerciseSelect", {
          routineData: {
            name: formData.name,
            description: formData.description,
            difficulty: formData.difficulty,
            duration: formData.duration,
            // Enviamos los ejercicios existentes
            routine_exercises_attributes: formData.routine_exercises_attributes,
          },
          isEditing: true,
          routineId: routineId,
        });
      })
      .catch((error) => {
        console.error("Error al guardar cambios básicos:", error);
        AppAlert.error(
          "Error",
          "No se pudieron guardar los cambios de la rutina"
        );
      });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Editar Rutina"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="mt-3 text-base text-gray-600">
            Cargando rutina...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Editando Rutina"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            Nombre de la Rutina
          </Text>
          <TextInput
            className="bg-white rounded-lg border border-gray-300 p-3 text-base"
            value={formData.name}
            onChangeText={(value: string) => handleChange("name", value)}
            placeholder="Ej. Rutina de Fuerza"
          />
        </View>

        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            Descripción
          </Text>
          <TextInput
            className="bg-white rounded-lg border border-gray-300 p-3 text-base min-h-[100px]"
            value={formData.description}
            onChangeText={(value: string) => handleChange("description", value)}
            placeholder="Describe brevemente esta rutina"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            Dificultad
          </Text>
          <View className="flex-row justify-between">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <TouchableOpacity
                key={level}
                className={`flex-1 py-2 px-3 mx-1 rounded-lg border ${
                  formData.difficulty === level
                    ? "bg-blue-500 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => handleChange("difficulty", level)}
              >
                <Text
                  className={`text-center font-medium ${
                    formData.difficulty === level
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {level === "beginner"
                    ? "Principiante"
                    : level === "intermediate"
                    ? "Intermedio"
                    : "Avanzado"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            Duración Aproximada (minutos)
          </Text>
          <TextInput
            className="bg-white rounded-lg border border-gray-300 p-3 text-base"
            value={formData.duration.toString()}
            onChangeText={(value: string) => {
              const parsed = parseInt(value) || 0;
              handleChange("duration", parsed);
            }}
            keyboardType="number-pad"
            placeholder="Ej. 45"
          />
        </View>

        <View className="mt-2 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Ejercicios</Text>
            <TouchableOpacity
              className="bg-blue-500 flex-row items-center py-2 px-3 rounded-lg"
              onPress={handleAddExercises}
            >
              <AntDesign name="plus" size={18} color="white" />
              <Text className="text-white font-medium ml-1">Agregar</Text>
            </TouchableOpacity>
          </View>

          {!formData.routine_exercises_attributes ||
          formData.routine_exercises_attributes.length === 0 ? (
            <View className="py-10 items-center justify-center bg-gray-100 rounded-lg">
              <FontAwesome5 name="dumbbell" size={40} color="#ddd" />
              <Text className="mt-4 text-lg font-medium text-gray-500">
                No hay ejercicios en esta rutina
              </Text>
              <Text className="mt-2 text-sm text-gray-400">
                Agrega ejercicios para completar tu rutina
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              {formData.routine_exercises_attributes &&
                formData.routine_exercises_attributes.map((ex, index) => {
                  const exerciseData = routine?.routine_exercises.find(
                    (e) => e.exercise_id === ex.exercise_id
                  );
                  if (!exerciseData) return null;

                  return (
                    <View
                      key={index}
                      className="bg-white p-4 rounded-lg shadow-sm mb-3 flex-row justify-between"
                    >
                      <View className="flex-1 pr-2">
                        <Text className="text-base font-bold text-gray-800">
                          {exerciseData.exercise.name}
                        </Text>
                        <Text className="text-sm text-gray-600 my-1">
                          {ex.sets} series × {ex.reps} reps • {ex.rest_time}s
                          descanso
                        </Text>
                        <View className="flex-row flex-wrap mt-1">
                          <View className="bg-gray-200 rounded-full mr-2 mb-1 px-2 py-1">
                            <Text className="text-xs text-gray-700">
                              {exerciseData.exercise.category}
                            </Text>
                          </View>
                          {exerciseData.exercise.equipment && (
                            <View className="bg-gray-200 rounded-full mr-2 mb-1 px-2 py-1">
                              <Text className="text-xs text-gray-700">
                                {exerciseData.exercise.equipment}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        className="justify-center items-center p-2"
                        onPress={() =>
                          handleRemoveExercise(ex.exercise_id, index)
                        }
                      >
                        <MaterialIcons
                          name="delete"
                          size={24}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          className={`flex-row items-center justify-center bg-blue-600 ${
            saving ? "opacity-70" : "opacity-100"
          } rounded-lg py-3 px-4`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-base mr-2">
                Guardar Cambios
              </Text>
              <AntDesign name="save" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RoutineEditScreen;
