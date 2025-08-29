import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { challengeService } from "../../services/challengeService";
import exerciseService from "../../services/exerciseService";
import { Exercise } from "../../types/exercise";
import { DIFFICULTY_LEVELS, ChallengeExercise } from "../../types/challenge";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";

type CreateChallengeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateChallenge">;
  route: RouteProp<RootStackParamList, "CreateChallenge">;
};

interface SelectedExercise {
  exercise_id: number;
  exercise: Exercise;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  order_index: number;
  notes: string | null;
}

const CreateChallengeScreen: React.FC<CreateChallengeScreenProps> = ({
  navigation,
  route,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoadingExercises(true);
      const exercises = await exerciseService.getExercises();
      setAvailableExercises(exercises);
    } catch (error: any) {
      AppAlert.error("Error", "Error al cargar ejercicios");
    } finally {
      setLoadingExercises(false);
    }
  };

  const generateWeeklyDates = () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  };

  const addExercise = (exercise: Exercise) => {
    const newExercise: SelectedExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: 10,
      rest_time_seconds: 60,
      order_index: selectedExercises.length,
      notes: null,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    const reindexed = updated.map((ex, i) => ({ ...ex, order_index: i }));
    setSelectedExercises(reindexed);
  };

  const updateExercise = (
    index: number,
    field: keyof SelectedExercise,
    value: any
  ) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return "El nombre es obligatorio";
    if (name.length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (selectedExercises.length === 0)
      return "Debes agregar al menos un ejercicio";

    for (let i = 0; i < selectedExercises.length; i++) {
      const ex = selectedExercises[i];
      if (ex.sets < 1 || ex.sets > 20)
        return `Las series deben estar entre 1 y 20 (Ejercicio ${i + 1})`;
      if (ex.reps < 1 || ex.reps > 100)
        return `Las repeticiones deben estar entre 1 y 100 (Ejercicio ${
          i + 1
        })`;
      if (ex.rest_time_seconds < 0 || ex.rest_time_seconds > 600)
        return `El descanso debe estar entre 0 y 600 segundos (Ejercicio ${
          i + 1
        })`;
    }

    return null;
  };

  const handleCreateChallenge = async () => {
    const validationError = validateForm();
    if (validationError) {
      AppAlert.error("Error de validación", validationError);
      return;
    }

    try {
      setLoading(true);
      const dates = generateWeeklyDates();

      const challengeData = {
        name: name.trim(),
        description: description.trim() || undefined,
        difficulty_level: difficultyLevel,
        start_date: dates.start_date,
        end_date: dates.end_date,
        estimated_duration_minutes: estimatedDuration
          ? parseInt(estimatedDuration)
          : undefined,
        challenge_exercises_attributes: selectedExercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_time_seconds: ex.rest_time_seconds,
          order_index: ex.order_index,
          notes: ex.notes || undefined,
        })),
      };

      await challengeService.createChallenge(challengeData);
      AppAlert.success("Éxito", "Desafío creado exitosamente");
      navigation.goBack();
    } catch (error: any) {
      AppAlert.error("Error", error.message || "Error al crear el desafío");
    } finally {
      setLoading(false);
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg mb-2 shadow-sm border border-gray-200"
      onPress={() => addExercise(item)}
    >
      <Text className="font-bold text-gray-900">{item.name}</Text>
      <Text className="text-sm text-gray-600 mt-1">
        {item.primary_muscles.join(", ")}
      </Text>
    </TouchableOpacity>
  );

  const renderSelectedExercise = (
    exercise: SelectedExercise,
    index: number
  ) => (
    <View
      key={index}
      className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-bold text-gray-900 flex-1">
          {exercise.exercise.name}
        </Text>
        <TouchableOpacity
          className="bg-red-500 px-3 py-1 rounded"
          onPress={() => removeExercise(index)}
        >
          <Text className="text-white text-sm">Eliminar</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-sm text-gray-600 mb-1">Series</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            value={exercise.sets.toString()}
            onChangeText={(text) =>
              updateExercise(index, "sets", parseInt(text) || 1)
            }
            keyboardType="numeric"
            placeholder="3"
          />
        </View>
        <View className="flex-1 mx-1">
          <Text className="text-sm text-gray-600 mb-1">Reps</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            value={exercise.reps.toString()}
            onChangeText={(text) =>
              updateExercise(index, "reps", parseInt(text) || 1)
            }
            keyboardType="numeric"
            placeholder="10"
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-sm text-gray-600 mb-1">Descanso (s)</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            value={exercise.rest_time_seconds.toString()}
            onChangeText={(text) =>
              updateExercise(index, "rest_time_seconds", parseInt(text) || 0)
            }
            keyboardType="numeric"
            placeholder="60"
          />
        </View>
      </View>

      <View>
        <Text className="text-sm text-gray-600 mb-1">Notas (opcional)</Text>
        <TextInput
          className="border border-gray-300 rounded px-3 py-2"
          value={exercise.notes || ""}
          onChangeText={(text) => updateExercise(index, "notes", text)}
          placeholder="Instrucciones adicionales..."
          multiline
        />
      </View>
    </View>
  );

  const renderExerciseSelector = () => {
    if (!showExerciseSelector) return null;

    return (
      <SafeAreaView
        className="absolute inset-0 bg-gray-50 z-10"
        edges={["top"]}
      >
        <View className="bg-white p-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold">Seleccionar Ejercicio</Text>
            <TouchableOpacity
              className="bg-gray-500 px-4 py-2 rounded"
              onPress={() => setShowExerciseSelector(false)}
            >
              <Text className="text-white font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingExercises ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={availableExercises.filter(
              (ex) =>
                !selectedExercises.some((sel) => sel.exercise_id === ex.id)
            )}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
          />
        )}
      </SafeAreaView>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Crear Desafío"
            onBack={() => navigation.goBack()}
          />
          <ScrollView className="flex-1">
            <View className="p-4">
              <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Información del Desafío
                </Text>

                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-1">Nombre *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej: Desafío Cardio Semanal"
                    maxLength={100}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-1">
                    Descripción
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe el objetivo del desafío..."
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm text-gray-600 mb-1">
                      Duración estimada (min)
                    </Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-3"
                      value={estimatedDuration}
                      onChangeText={setEstimatedDuration}
                      placeholder="30"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-sm text-gray-600 mb-1">
                      Dificultad
                    </Text>
                    <View className="border border-gray-300 rounded-lg p-2">
                      <FlatList
                        data={Object.entries(DIFFICULTY_LEVELS)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item: [level, data] }) => (
                          <TouchableOpacity
                            className={`px-3 py-2 rounded mr-2 ${
                              difficultyLevel === parseInt(level)
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                            onPress={() =>
                              setDifficultyLevel(
                                parseInt(level) as 1 | 2 | 3 | 4 | 5
                              )
                            }
                          >
                            <Text
                              className={`text-xs ${
                                difficultyLevel === parseInt(level)
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              {data.emoji} {level}
                            </Text>
                          </TouchableOpacity>
                        )}
                        keyExtractor={([level]) => level}
                      />
                    </View>
                  </View>
                </View>

                <View className="bg-blue-50 p-3 rounded-lg">
                  <Text className="text-blue-800 text-sm">
                    ℹ️ El desafío será activo por 7 días desde hoy y estará
                    disponible automáticamente para todos tus usuarios.
                  </Text>
                </View>
              </View>

              <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-gray-900">
                    Ejercicios ({selectedExercises.length})
                  </Text>
                  <TouchableOpacity
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                    onPress={() => setShowExerciseSelector(true)}
                  >
                    <Text className="text-white font-medium">+ Agregar</Text>
                  </TouchableOpacity>
                </View>

                {selectedExercises.length === 0 ? (
                  <View className="items-center py-8">
                    <Text className="text-4xl mb-2">💪</Text>
                    <Text className="text-gray-600 text-center">
                      Agrega ejercicios para crear tu desafío
                    </Text>
                  </View>
                ) : (
                  selectedExercises.map(renderSelectedExercise)
                )}
              </View>

              <TouchableOpacity
                className={`py-4 rounded-lg ${
                  loading ? "bg-gray-400" : "bg-green-500"
                }`}
                onPress={handleCreateChallenge}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold text-center">
                    🚀 Crear Desafío
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {renderExerciseSelector()}
      </SafeAreaView>
    </>
  );
};

export default CreateChallengeScreen;
