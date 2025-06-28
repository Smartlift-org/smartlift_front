import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import exerciseService from "../services/exerciseService";
import routineService, {
  Exercise,
  RoutineExerciseFormData,
  RoutineFormData,
} from "../services/routineService";
import AppAlert from "../components/AppAlert";

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

type CategoryFilter = string | null;

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
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showLevelMatching, setShowLevelMatching] = useState<boolean>(true);

  const [selectedExercises, setSelectedExercises] = useState<
    RoutineExerciseFormData[]
  >([]);

  const [sets, setSets] = useState<string>("3");
  const [reps, setReps] = useState<string>("12");
  const [restTime, setRestTime] = useState<string>("60");
  const [order, setOrder] = useState<string>("1");

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const response = await exerciseService.getExercises();
      console.log("Respuesta API ejercicios:", JSON.stringify(response));

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
              .filter((exercise: Exercise) => exercise && exercise.category)
              .map((exercise: Exercise) => exercise.category)
          )
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error al cargar ejercicios:", error);
      AppAlert.error(
        "Error",
        "No se pudieron cargar los ejercicios. Verifica la conexión con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyRange = (routineDifficulty: string): string[] => {
    switch (routineDifficulty) {
      case "beginner":
        return ["beginner"];
      case "intermediate":
        return ["intermediate"];
      case "advanced":
        return ["advanced"];
      default:
        return ["beginner", "intermediate", "advanced"];
    }
  };

  useEffect(() => {
    let filtered = exercises;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.primary_muscles.some((muscle) =>
            muscle.toLowerCase().includes(query)
          ) ||
          (exercise.category && exercise.category.toLowerCase().includes(query))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (exercise) => exercise.category === categoryFilter
      );
    }

    if (showLevelMatching) {
      const difficultyLevels = getDifficultyRange(routineData.difficulty);
      filtered = filtered.filter((exercise) => {
        return (
          exercise &&
          exercise.level &&
          difficultyLevels.includes(exercise.level)
        );
      });
    }

    setFilteredExercises(filtered);
  }, [searchQuery, categoryFilter, showLevelMatching, exercises]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    if (exercise.difficulty_level >= 3) {
      setSets("4");
      setReps("8");
    } else {
      setSets("3");
      setReps("12");
    }
  };

  const handleAddExerciseToSelection = () => {
    if (!selectedExercise) {
      AppAlert.error("Error", "Por favor selecciona un ejercicio primero");
      return;
    }

    if (!validateForm()) return;

    const exerciseData: RoutineExerciseFormData = {
      exercise_id: selectedExercise.id,
      sets: parseInt(sets),
      reps: parseInt(reps),
      rest_time: parseInt(restTime),
      order: parseInt(order),
      group_type: "regular",
    };

    setSelectedExercises([...selectedExercises, exerciseData]);

    setSelectedExercise(null);
    setSets("3");
    setReps("12");
    setRestTime("60");
    setOrder((parseInt(order) + 1).toString());

    AppAlert.info(
      "¡Ejercicio añadido!",
      `${selectedExercise.name} ha sido añadido a la rutina. Puedes seguir añadiendo más ejercicios.`
    );
  };

  const handleSaveFullRoutine = async () => {
    if (selectedExercises.length === 0) {
      AppAlert.error("Error", "Debes añadir al menos un ejercicio a la rutina");
      return;
    }

    if (selectedExercises.length > 20) {
      AppAlert.error(
        "Error",
        "La rutina no puede contener más de 20 ejercicios para mantener un entrenamiento efectivo"
      );
      return;
    }

    const orderNumbers = selectedExercises.map((ex) => ex.order);
    const uniqueOrders = new Set(orderNumbers);
    if (uniqueOrders.size !== selectedExercises.length) {
      AppAlert.error(
        "Error",
        "Hay ejercicios con el mismo número de orden. Por favor, corrige los valores para asegurar un orden correcto."
      );
      return;
    }

    const invalidExercise = selectedExercises.find(
      (ex) =>
        !ex.exercise_id ||
        ex.sets <= 0 ||
        ex.sets > 20 ||
        ex.reps <= 0 ||
        ex.reps > 100 ||
        ex.rest_time < 0 ||
        ex.rest_time > 300 ||
        ex.order <= 0
    );

    if (invalidExercise) {
      AppAlert.error(
        "Error",
        "Hay ejercicios con valores inválidos. Por favor revisa las series, repeticiones, tiempos de descanso y orden."
      );
      return;
    }

    setCreatingRoutine(true);

    try {
      if (isEditing && routineId) {
        // Si estamos editando una rutina existente, primero recuperamos la rutina completa
        const routine = await routineService.getRoutine(routineId);
        
        // Obtenemos los ejercicios existentes (si los hay en routineData.routine_exercises_attributes)
        let existingExercises: RoutineExerciseFormData[] = [];
        if (routineData.routine_exercises_attributes && 
            Array.isArray(routineData.routine_exercises_attributes)) {
          existingExercises = routineData.routine_exercises_attributes;
        }
        
        // Creamos un conjunto completo de ejercicios: los existentes más los nuevos seleccionados
        const updatedRoutineData: RoutineFormData = {
          ...routineData,
          routine_exercises_attributes: [...existingExercises, ...selectedExercises],
        };
        
        // Actualizamos la rutina completa con todos los ejercicios
        await routineService.updateRoutine(routineId, updatedRoutineData);

        AppAlert.success(
          "Rutina actualizada",
          "Los ejercicios se han añadido correctamente a la rutina"
        );

        navigation.navigate("RoutineEdit", { routineId, refresh: true });
      } else {
        // Si estamos creando una nueva rutina, simplemente usamos los ejercicios seleccionados
        const routineFormData: RoutineFormData = {
          ...routineData,
          routine_exercises_attributes: selectedExercises,
        };
        
        await routineService.createRoutine(routineFormData);

        AppAlert.info(
          "¡Rutina creada!",
          "Tu nueva rutina se ha creado con éxito. ¿Qué deseas hacer?",
          [
            {
              text: "Volver al inicio",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "UserHome" }],
                });
              },
            },
            {
              text: "Ver mis rutinas",
              onPress: () => {
                navigation.reset({
                  index: 1,
                  routes: [
                    { name: "UserHome" },
                    { name: "RoutineList", params: { refresh: true } },
                  ],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error al crear rutina:", error);
      AppAlert.error("Error", "No se pudo crear la rutina");
    } finally {
      setCreatingRoutine(false);
    }
  };

  const validateForm = (): boolean => {
    if (!sets || isNaN(Number(sets)) || Number(sets) <= 0) {
      AppAlert.error(
        "Error",
        "El número de series debe ser un número positivo"
      );
      return false;
    }

    if (Number(sets) > 20) {
      AppAlert.error("Error", "El número de series no puede exceder de 20");
      return false;
    }

    if (!reps || isNaN(Number(reps)) || Number(reps) <= 0) {
      AppAlert.error(
        "Error",
        "El número de repeticiones debe ser un número positivo"
      );
      return false;
    }

    if (Number(reps) > 100) {
      AppAlert.error(
        "Error",
        "El número de repeticiones no puede exceder de 100"
      );
      return false;
    }

    if (!restTime || isNaN(Number(restTime)) || Number(restTime) < 0) {
      AppAlert.error(
        "Error",
        "El tiempo de descanso debe ser un número positivo"
      );
      return false;
    }

    if (Number(restTime) > 300) {
      AppAlert.error(
        "Error",
        "El tiempo de descanso no puede exceder de 300 segundos (5 minutos)"
      );
      return false;
    }

    if (!order || isNaN(Number(order)) || Number(order) <= 0) {
      AppAlert.error("Error", "El orden debe ser un número positivo");
      return false;
    }

    const orderNum = Number(order);
    const duplicateOrder = selectedExercises.some(
      (ex) => ex.order === orderNum
    );
    if (duplicateOrder) {
      AppAlert.error(
        "Error",
        `Ya existe un ejercicio con el orden ${orderNum}. Por favor, elige un número de orden diferente.`
      );
      return false;
    }

    if (!selectedExercise) {
      AppAlert.error("Error", "Debes seleccionar un ejercicio");
      return false;
    }

    return true;
  };

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      className={`px-4 py-2 mx-1 rounded-full ${
        categoryFilter === category ? "bg-indigo-600" : "bg-gray-200"
      }`}
      onPress={() =>
        setCategoryFilter(categoryFilter === category ? null : category)
      }
    >
      <Text
        className={`text-sm ${
          categoryFilter === category ? "text-white" : "text-gray-800"
        }`}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      className={`p-4 mb-3 rounded-lg flex-row items-center ${
        selectedExercise?.id === item.id
          ? "bg-indigo-100 border border-indigo-300"
          : "bg-white border border-gray-200"
      }`}
      onPress={() => handleSelectExercise(item)}
    >
      {item.image_urls && item.image_urls.length > 0 ? (
        <Image
          source={{ uri: item.image_urls[0] }}
          className="w-16 h-16 rounded-md"
          resizeMode="cover"
        />
      ) : (
        <View className="w-16 h-16 rounded-md bg-gray-300 justify-center items-center">
          <MaterialCommunityIcons name="dumbbell" size={24} color="#666" />
        </View>
      )}

      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-800">
          {item.name}
        </Text>

        <View className="flex-row items-center mt-1 mb-1">
          <Text className="text-xs text-gray-500 mr-1">
            {item.has_equipment ? "Requiere equipo" : "Sin equipo"} •{" "}
            {item.category}
          </Text>
        </View>

        <View className="flex-row flex-wrap">
          {item.primary_muscles.slice(0, 3).map((muscle, idx) => (
            <Text
              key={idx}
              className="text-xs bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1 text-gray-600"
            >
              {muscle}
            </Text>
          ))}
          {item.primary_muscles.length > 3 && (
            <Text className="text-xs bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1 text-gray-600">
              +{item.primary_muscles.length - 3} más
            </Text>
          )}
        </View>
      </View>

      <View className="ml-2">
        {selectedExercise?.id === item.id ? (
          <AntDesign name="checkcircle" size={24} color="#4f46e5" />
        ) : (
          <Ionicons name="add-circle-outline" size={24} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1">
          <ScreenHeader
            title="Añadir Ejercicios"
            onBack={() => {
              if (isEditing && routineId) {
                navigation.navigate("RoutineEdit", { routineId });
              } else {
                navigation.goBack();
              }
            }}
          />

          <View className="bg-indigo-50 p-4">
            <Text className="text-sm text-indigo-600">
              Creando nueva rutina:
            </Text>
            <Text className="text-lg font-bold text-indigo-800">
              {routineData.name}
            </Text>
          </View>

          {selectedExercises.length > 0 && (
            <View className="bg-white p-4 border-b border-gray-200">
              <Text className="font-semibold text-gray-800 mb-2">
                Ejercicios seleccionados: {selectedExercises.length}
              </Text>
              <TouchableOpacity
                className={`p-3 rounded-lg ${
                  selectedExercises.length === 0
                    ? "bg-gray-400"
                    : "bg-indigo-600"
                }`}
                onPress={handleSaveFullRoutine}
                disabled={creatingRoutine || selectedExercises.length === 0}
              >
                {creatingRoutine ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Guardar rutina con {selectedExercises.length} ejercicios
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-1">
            {loading && !selectedExercise ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-4 text-gray-600">
                  Cargando ejercicios...
                </Text>
              </View>
            ) : selectedExercise ? (
              <View className="flex-1 p-4">
                <ScrollView>
                  <View className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                    <View className="flex-row items-center mb-3">
                      <TouchableOpacity
                        className="mr-3"
                        onPress={() => setSelectedExercise(null)}
                      >
                        <Ionicons
                          name="arrow-back-circle"
                          size={24}
                          color="#4f46e5"
                        />
                      </TouchableOpacity>
                      <Text className="text-lg font-bold flex-1">
                        {selectedExercise.name}
                      </Text>
                    </View>

                    {selectedExercise.image_urls &&
                    selectedExercise.image_urls.length > 0 ? (
                      <Image
                        source={{ uri: selectedExercise.image_urls[0] }}
                        className="w-full h-48 rounded-md mb-4"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-48 rounded-md bg-gray-200 justify-center items-center mb-4">
                        <MaterialCommunityIcons
                          name="dumbbell"
                          size={48}
                          color="#666"
                        />
                      </View>
                    )}

                    <View className="flex-row flex-wrap mb-2">
                      <Text className="text-sm font-semibold mr-1">
                        Músculos:
                      </Text>
                      {selectedExercise.primary_muscles.map((muscle, idx) => (
                        <Text key={idx} className="text-sm">
                          {muscle}
                          {idx < selectedExercise.primary_muscles.length - 1
                            ? ", "
                            : ""}
                        </Text>
                      ))}
                    </View>

                    <View className="flex-row mb-4">
                      <View className="flex-row items-center mr-4">
                        <Text className="text-sm font-semibold mr-1">
                          Equipo:
                        </Text>
                        <Text>
                          {selectedExercise.has_equipment ? "Sí" : "No"}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Text className="text-sm font-semibold mr-1">
                          Dificultad:
                        </Text>
                        <Text>{selectedExercise.difficulty}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                    <Text className="text-lg font-semibold mb-4">
                      Configuración del ejercicio
                    </Text>

                    <View className="mb-4">
                      <Text className="text-sm text-gray-600 mb-1">Series</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-base"
                        keyboardType="numeric"
                        value={sets}
                        onChangeText={setSets}
                        placeholder="Ej: 3"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm text-gray-600 mb-1">
                        Repeticiones por serie
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-base"
                        keyboardType="numeric"
                        value={reps}
                        onChangeText={setReps}
                        placeholder="Ej: 12"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm text-gray-600 mb-1">
                        Descanso entre series (segundos)
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-base"
                        keyboardType="numeric"
                        value={restTime}
                        onChangeText={setRestTime}
                        placeholder="Ej: 60"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm text-gray-600 mb-1">
                        Orden en la rutina
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-base"
                        keyboardType="numeric"
                        value={order}
                        onChangeText={setOrder}
                        placeholder="Ej: 1"
                      />
                    </View>
                  </View>
                </ScrollView>

                <View className="p-4">
                  <TouchableOpacity
                    className="bg-indigo-600 rounded-lg py-3 px-6 shadow-sm"
                    onPress={handleAddExerciseToSelection}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-white text-center font-semibold">
                        Añadir a la rutina
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-1">
                <View className="p-4">
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 mb-3"
                    placeholder="Buscar ejercicios por nombre o músculos"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />

                  <TouchableOpacity
                    className={`flex-row items-center mb-3 p-3 rounded-lg border ${
                      showLevelMatching
                        ? "bg-indigo-100 border-indigo-300"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setShowLevelMatching(!showLevelMatching)}
                  >
                    <View
                      className={`w-5 h-5 rounded mr-2 ${
                        showLevelMatching
                          ? "bg-indigo-600"
                          : "border border-gray-400"
                      }`}
                    >
                      {showLevelMatching && (
                        <AntDesign name="check" size={16} color="#ffffff" />
                      )}
                    </View>
                    <Text
                      className={`${
                        showLevelMatching
                          ? "font-semibold text-indigo-800"
                          : "text-gray-700"
                      }`}
                    >
                      Solo ejercicios para nivel{" "}
                      {routineData.difficulty === "beginner"
                        ? "principiante"
                        : routineData.difficulty === "intermediate"
                        ? "intermedio"
                        : "avanzado"}
                    </Text>
                  </TouchableOpacity>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-3"
                  >
                    {categories.map((category) =>
                      renderCategoryButton(category)
                    )}
                  </ScrollView>
                </View>

                {filteredExercises.length > 0 ? (
                  <FlatList
                    data={filteredExercises}
                    keyExtractor={(item: Exercise) => item.id.toString()}
                    renderItem={renderExerciseItem}
                    contentContainerClassName="p-4"
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-lg text-gray-600 text-center">
                      No se encontraron ejercicios que coincidan con tu búsqueda
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ExerciseSelectScreen;
