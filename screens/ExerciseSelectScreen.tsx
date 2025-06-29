import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import exerciseService from "../services/exerciseService";
import routineService, {
  RoutineExerciseFormData,
  RoutineFormData,
} from "../services/routineService";
import AppAlert from "../components/AppAlert";
import {
  CategoryFilter,
  SearchBar,
  ExerciseList,
  ExerciseDetails,
} from "../components/ExerciseSelect";
import { Exercise } from "../types/exercise";

type ExerciseSelectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ExerciseSelect">;
  route: {
    params: {
      routineData: {
        name: string;
        description: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        duration: number;
        routine_exercises_attributes?: RoutineExerciseFormData[];
      };
      isEditing?: boolean;
      routineId?: number;
    };
  };
};

type CategoryFilterType = string | null;

const ExerciseSelectScreen: React.FC<ExerciseSelectScreenProps> = ({
  navigation,
  route,
}) => {
  const { routineData, isEditing = false, routineId } = route.params;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingRoutine, setCreatingRoutine] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterType>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showLevelMatching, setShowLevelMatching] = useState<boolean>(true);

  const [selectedExercises, setSelectedExercises] = useState<
    RoutineExerciseFormData[]
  >([]);

  const [sets, setSets] = useState<string>("3");
  const [reps, setReps] = useState<string>("12");
  const [restTime, setRestTime] = useState<string>("60");

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (
      routineData.routine_exercises_attributes &&
      routineData.routine_exercises_attributes.length > 0
    ) {
      setSelectedExercises([...routineData.routine_exercises_attributes]);
    }
  }, [routineData.routine_exercises_attributes]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const response = await exerciseService.getExercises();

      let exercisesArray: Exercise[] = [];
      if (Array.isArray(response)) {
        exercisesArray = response as Exercise[];
      } else if (response && typeof response === "object") {
        const responseObj = response as Record<string, any>;
        if (responseObj.exercises)
          exercisesArray = responseObj.exercises as Exercise[];
        else if (responseObj.data)
          exercisesArray = responseObj.data as Exercise[];
      } else {
        throw new Error(`Respuesta inesperada: ${JSON.stringify(response)}`);
      }

      setExercises(exercisesArray);
      setFilteredExercises(exercisesArray);

      if (exercisesArray.length > 0) {
        const uniqueCategories = Array.from(
          new Set(
            exercisesArray
              .map((e) => e.category)
              .filter((c): c is string => c !== undefined && c !== null)
          )
        ).sort();
        setCategories(uniqueCategories);
      }
    } catch (error) {
      AppAlert.error("Error", "No se pudieron cargar los ejercicios");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyRange = (routineDifficulty: string): string[] => {
    switch (routineDifficulty) {
      case "beginner":
        return ["beginner"];
      case "intermediate":
        return ["beginner", "intermediate"];
      case "advanced":
        return ["beginner", "intermediate", "advanced"];
      default:
        return ["beginner", "intermediate", "advanced"];
    }
  };

  useEffect(() => {
    if (!exercises.length) {
      setFilteredExercises([]);
      return;
    }

    let filtered = [...exercises];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.name && e.name.toLowerCase().includes(query)) ||
          (e.primary_muscles &&
            e.primary_muscles.join(", ").toLowerCase().includes(query)) ||
          (e.secondary_muscles &&
            e.secondary_muscles.join(", ").toLowerCase().includes(query))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    if (showLevelMatching) {
      const allowedLevels = getDifficultyRange(routineData.difficulty);
      filtered = filtered.filter(
        (e) => e.level && allowedLevels.includes(e.level)
      );
    }

    setFilteredExercises(filtered);
  }, [
    searchQuery,
    categoryFilter,
    showLevelMatching,
    exercises,
    routineData.difficulty,
  ]);

  const handleSelectExercise = (exercise: Exercise) => {
    if (selectedExercise && selectedExercise.id === exercise.id) {
      setSelectedExercise(null);
    } else {
      setSelectedExercise(exercise);
    }
  };

  const handleAddExerciseToSelection = () => {
    if (!selectedExercise) {
      AppAlert.error("Error", "Debes seleccionar un ejercicio primero");
      return;
    }

    const setsNum = parseInt(sets, 10);
    const repsNum = parseInt(reps, 10);
    const restTimeNum = parseInt(restTime, 10);

    if (isNaN(setsNum) || setsNum <= 0 || isNaN(repsNum) || repsNum <= 0) {
      AppAlert.error(
        "Error",
        "Las series y repeticiones deben ser números positivos"
      );
      return;
    }

    const orderNum = selectedExercises.length + 1;

    const newExercise: RoutineExerciseFormData = {
      exercise_id: selectedExercise.id,
      name: selectedExercise.name,
      sets: setsNum,
      reps: repsNum,
      rest_time: restTimeNum,
      order: orderNum,
    };

    const exerciseWithName: any = {
      ...newExercise,
      exercise_name: selectedExercise.name,
    };

    const updatedExercises = [...selectedExercises, exerciseWithName];
    setSelectedExercises(updatedExercises);

    setSelectedExercise(null);
    setSets("3");
    setReps("12");
    setRestTime("60");

    AppAlert.success(
      "Ejercicio añadido",
      `${selectedExercise.name} añadido a la rutina`
    );
  };

  const handleSaveFullRoutine = () => {
    if (!validateForm()) return;

    setCreatingRoutine(true);

    const normalizedExercises = [...selectedExercises]
      .sort((a, b) => a.order - b.order)
      .map((exercise, index) => ({
        ...exercise,
        order: index + 1,
      }));

    const routineFormData: RoutineFormData = {
      ...routineData,
      routine_exercises_attributes: normalizedExercises,
    };

    if (!isEditing && routineFormData.routine_exercises_attributes) {
      routineFormData.routine_exercises_attributes =
        routineFormData.routine_exercises_attributes.map((exercise) => {
          const { id, ...rest } = exercise as any;
          return rest;
        });
    }

    const savePromise =
      isEditing && routineId
        ? routineService.updateRoutine(routineId, routineFormData)
        : routineService.createRoutine(routineFormData);

    savePromise
      .then((response) => {
        AppAlert.confirm(
          "¡Rutina guardada!",
          `Tu rutina "${routineData.name}" ha sido ${
            isEditing ? "actualizada" : "creada"
          } con éxito.`,
          () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "RoutineList", params: { refresh: true } }],
            });
          }
        );
      })
      .catch((error) => {
        let errorMessage = "No se pudo guardar la rutina";

        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          errorMessage +=
            ": " + Object.values(error.response.data.errors).join(", ");
        }

        AppAlert.error("Error", errorMessage);
      })
      .finally(() => {
        setCreatingRoutine(false);
      });
  };

  const validateForm = (): boolean => {
    if (selectedExercises.length === 0) {
      AppAlert.error(
        "Error",
        "Debes seleccionar al menos un ejercicio para la rutina"
      );
      return false;
    }

    return true;
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    setSelectedExercises(updatedExercises);
  };

  const onReturn = (updatedExercises: RoutineExerciseFormData[] | null) => {
    if (updatedExercises !== null) {
      setSelectedExercises(updatedExercises);
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    return difficulty === "beginner"
      ? "principiante"
      : difficulty === "intermediate"
      ? "intermedio"
      : "avanzado";
  };

  return (
    <>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "dark-content"}
      />
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1">
          <ScreenHeader
            title="Seleccionar ejercicios"
            onBack={() => {
              navigation.goBack();
            }}
          />

          <View className="bg-indigo-50 p-4">
            <Text className="text-sm text-indigo-600">
              {isEditing ? "Editando" : "Creando"} rutina:
            </Text>
            <Text className="text-lg font-bold text-indigo-800">
              {routineData.name}
            </Text>
          </View>

          <View className="flex-1">
            {loading && !selectedExercise ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-2 text-gray-600">
                  Cargando ejercicios...
                </Text>
              </View>
            ) : selectedExercise ? (
              <ExerciseDetails
                exercise={selectedExercise}
                sets={sets}
                reps={reps}
                restTime={restTime}
                onSetsChange={setSets}
                onRepsChange={setReps}
                onRestTimeChange={setRestTime}
                onAddToRoutine={handleAddExerciseToSelection}
                loading={loading}
              />
            ) : (
              <View className="flex-1">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  showLevelMatching={showLevelMatching}
                  onToggleLevelMatching={() =>
                    setShowLevelMatching(!showLevelMatching)
                  }
                  difficultyLabel={getDifficultyLabel(routineData.difficulty)}
                />

                <CategoryFilter
                  categories={categories}
                  selectedCategory={categoryFilter}
                  onSelectCategory={setCategoryFilter}
                />

                <ExerciseList
                  exercises={filteredExercises}
                  onSelectExercise={handleSelectExercise}
                  selectedExerciseId={
                    selectedExercise ? (selectedExercise as Exercise).id : null
                  }
                />
              </View>
            )}
          </View>

          {selectedExercises.length > 0 && !selectedExercise && (
            <>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: 20,
                  backgroundColor: "#4f46e5",
                  borderRadius: 30,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  zIndex: 999,
                }}
                onPress={() => {
                  navigation.navigate("SelectedExercises", {
                    selectedExercises: selectedExercises,
                    routineName: routineData.name,
                    onReturn: onReturn,
                    isEditing: isEditing,
                    routineId: routineId,
                  });
                }}
              >
                <MaterialCommunityIcons
                  name="clipboard-list-outline"
                  size={24}
                  color="white"
                />
                <Text
                  style={{ color: "white", marginLeft: 8, fontWeight: "600" }}
                >
                  {selectedExercises.length} ejercicios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  left: 20,
                  bottom: 20,
                  backgroundColor: "#10b981",
                  borderRadius: 30,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  zIndex: 999,
                }}
                onPress={handleSaveFullRoutine}
                disabled={creatingRoutine}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {creatingRoutine ? "Guardando..." : "Guardar rutina"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default ExerciseSelectScreen;
