import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import exerciseService from "../services/exerciseService";
import { Exercise } from "../types/exercise";

interface RoutineExercise {
  id?: number;
  exercise_id: number;
  sets: number;
  reps: number;
  rest_time: number;
  order: number;
  exercise?: {
    id: number;
    name: string;
    primary_muscles: string[];
  };
  _destroy?: boolean;
}

interface RoutineEditModalProps {
  visible: boolean;
  routine: any;
  onClose: () => void;
  onSave: (editData: any) => Promise<void>;
  loading?: boolean;
}

const RoutineEditModal: React.FC<RoutineEditModalProps> = ({
  visible,
  routine,
  onClose,
  onSave,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [autoValidate, setAutoValidate] = useState(false);
  const [validationNotes, setValidationNotes] = useState("");

  // Load available exercises when modal opens
  const loadExercises = async () => {
    try {
      const exercisesList = await exerciseService.getExercises();
      setAvailableExercises(exercisesList);
    } catch (error) {
      console.error("Error loading exercises:", error);
      Alert.alert("Error", "No se pudieron cargar los ejercicios");
    }
  };

  useEffect(() => {
    if (routine && visible) {
      setName(routine.name || "");
      setDescription(routine.description || "");
      setDifficulty(routine.difficulty || "beginner");
      setDuration(routine.duration?.toString() || "");
      setExercises(routine.routine_exercises || []);
      loadExercises(); // Load exercises when modal opens
      setAutoValidate(false);
      setValidationNotes("");
    }
  }, [routine, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      Alert.alert("Error", "La descripción debe tener al menos 10 caracteres");
      return;
    }

    const durationNum = parseInt(duration);
    if (!durationNum || durationNum <= 0 || durationNum > 180) {
      Alert.alert("Error", "La duración debe estar entre 1 y 180 minutos");
      return;
    }

    const editData = {
      name: name.trim(),
      description: description.trim(),
      difficulty,
      duration: durationNum,
      routine_exercises_attributes: exercises.map((ex, index) => ({
        id: ex.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_time: ex.rest_time,
        order: index + 1,
        _destroy: ex._destroy || false,
      })),
      auto_validate: autoValidate,
      validation_notes: autoValidate ? validationNotes.trim() : undefined,
    };

    await onSave(editData);
  };

  const updateExercise = (
    index: number,
    field: keyof RoutineExercise,
    value: any
  ) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setExercises(updatedExercises);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = [...exercises];
    if (updatedExercises[index].id) {
      updatedExercises[index]._destroy = true;
    } else {
      updatedExercises.splice(index, 1);
    }
    setExercises(updatedExercises);
  };

  const handleAddExercise = () => {
    setShowExerciseSelector(true);
  };

  const selectExercise = (exercise: Exercise) => {
    const newExercise: RoutineExercise = {
      exercise_id: exercise.id,
      sets: 3,
      reps: 12,
      rest_time: 60,
      order: exercises.length + 1,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        primary_muscles: exercise.primary_muscles,
      },
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseSelector(false);
    setExerciseSearchQuery("");
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return diff;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <FontAwesome5 name="times" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Editar Rutina IA
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className={`px-4 py-2 rounded-lg ${
                loading ? "bg-gray-300" : "bg-blue-500"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-medium">Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Información Básica
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Nombre *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                value={name}
                onChangeText={setName}
                placeholder="Nombre de la rutina"
                maxLength={100}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                Descripción *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[80px]"
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción de la rutina (mínimo 10 caracteres)"
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Dificultad</Text>
              <View className="flex-row space-x-2">
                {["beginner", "intermediate", "advanced"].map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => setDifficulty(diff as any)}
                    className={`flex-1 py-3 px-2 rounded-lg border ${
                      difficulty === diff
                        ? "border-blue-500 " + getDifficultyColor(diff)
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        difficulty === diff ? "" : "text-gray-600"
                      }`}
                    >
                      {getDifficultyText(diff)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                Duración (minutos) *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Ejercicios ({exercises.filter((ex) => !ex._destroy).length})
              </Text>
              <TouchableOpacity
                onPress={handleAddExercise}
                className="bg-blue-500 px-3 py-2 rounded-lg"
              >
                <View className="flex-row items-center">
                  <FontAwesome5 name="plus" size={12} color="white" />
                  <Text className="text-white text-sm font-medium ml-1">
                    Agregar
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {exercises.map((exercise, index) => {
              if (exercise._destroy) return null;

              return (
                <View key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-base font-medium text-gray-800 flex-1">
                      {exercise.exercise?.name ||
                        `Ejercicio ID: ${exercise.exercise_id}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeExercise(index)}
                      className="ml-2 p-1"
                    >
                      <FontAwesome5 name="trash" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Series</Text>
                      <TextInput
                        className="border border-gray-300 rounded p-2 text-center"
                        value={exercise.sets.toString()}
                        onChangeText={(text) =>
                          updateExercise(index, "sets", parseInt(text) || 1)
                        }
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Reps</Text>
                      <TextInput
                        className="border border-gray-300 rounded p-2 text-center"
                        value={exercise.reps.toString()}
                        onChangeText={(text) =>
                          updateExercise(index, "reps", parseInt(text) || 1)
                        }
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">
                        Descanso (s)
                      </Text>
                      <TextInput
                        className="border border-gray-300 rounded p-2 text-center"
                        value={exercise.rest_time.toString()}
                        onChangeText={(text) =>
                          updateExercise(
                            index,
                            "rest_time",
                            parseInt(text) || 0
                          )
                        }
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                  </View>

                  {exercise.exercise?.primary_muscles && (
                    <Text className="text-xs text-gray-500 mt-2">
                      Músculos: {exercise.exercise.primary_muscles.join(", ")}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Auto-validar después de editar
              </Text>
              <TouchableOpacity
                onPress={() => setAutoValidate(!autoValidate)}
                className={`w-12 h-6 rounded-full ${
                  autoValidate ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-white mt-0.5 ${
                    autoValidate ? "ml-6" : "ml-0.5"
                  }`}
                />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 text-sm mb-3">
              Si activas esta opción, la rutina será automáticamente aprobada
              después de editarla.
            </Text>

            {autoValidate && (
              <View>
                <Text className="text-gray-700 mb-2 font-medium">
                  Notas de validación (opcional)
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[60px]"
                  value={validationNotes}
                  onChangeText={setValidationNotes}
                  placeholder="Comentarios sobre los cambios realizados..."
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Exercise Selector Modal */}
      <Modal
        visible={showExerciseSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setShowExerciseSelector(false)}
              >
                <FontAwesome5 name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-800">
                Seleccionar Ejercicio
              </Text>
              <View style={{ width: 20 }} />
            </View>
          </View>

          <View className="p-4">
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
              placeholder="Buscar ejercicios..."
              value={exerciseSearchQuery}
              onChangeText={setExerciseSearchQuery}
            />
          </View>

          <ScrollView className="flex-1 px-4">
            {availableExercises
              .filter((exercise) =>
                exercise.name
                  .toLowerCase()
                  .includes(exerciseSearchQuery.toLowerCase())
              )
              .map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => selectExercise(exercise)}
                  className="bg-white rounded-lg p-4 mb-3 shadow-sm"
                >
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    {exercise.name}
                  </Text>
                  <View className="flex-row flex-wrap mb-2">
                    {exercise.primary_muscles.map((muscle, index) => (
                      <View
                        key={index}
                        className="bg-blue-100 px-2 py-1 rounded-full mr-2 mb-1"
                      >
                        <Text className="text-blue-800 text-xs font-medium">
                          {muscle}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className={`px-2 py-1 rounded-full ${
                        exercise.level === "beginner"
                          ? "bg-green-100"
                          : exercise.level === "intermediate"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          exercise.level === "beginner"
                            ? "text-green-800"
                            : exercise.level === "intermediate"
                            ? "text-yellow-800"
                            : "text-red-800"
                        }`}
                      >
                        {exercise.level === "beginner"
                          ? "Principiante"
                          : exercise.level === "intermediate"
                          ? "Intermedio"
                          : "Experto"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
};

export default RoutineEditModal;
