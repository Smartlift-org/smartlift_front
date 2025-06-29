import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RoutineExerciseFormData } from "../services/routineService";
import { Exercise } from "../types/exercise";
import exerciseService from "../services/exerciseService";
import { RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import AppAlert from "../components/AppAlert";

type SelectedExercisesScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "SelectedExercises"
  >;
  route: {
    params: {
      selectedExercises: RoutineExerciseFormData[];
      onReturn: (updatedExercises: RoutineExerciseFormData[] | null) => void;
    };
  };
};

const SelectedExercisesScreen: React.FC<SelectedExercisesScreenProps> = ({
  navigation,
  route,
}) => {
  const { selectedExercises, onReturn } = route.params;
  const [exercises, setExercises] = useState<
    (RoutineExerciseFormData & { exercise_name?: string })[]
  >([...selectedExercises]);
  const [loading, setLoading] = useState(false);
  const [exerciseNames, setExerciseNames] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    const loadExerciseNames = async () => {
      try {
        const response = await exerciseService.getExercises();
        let exercisesArray: Exercise[] = [];

        if (Array.isArray(response)) {
          exercisesArray = response;
        } else if (response && typeof response === "object") {
          const responseObj = response as Record<string, any>;
          if (responseObj.exercises) exercisesArray = responseObj.exercises;
          else if (responseObj.data) exercisesArray = responseObj.data;
        }

        const namesMap: Record<number, string> = {};
        exercisesArray.forEach((ex) => {
          namesMap[ex.id] = ex.name;
        });

        setExerciseNames(namesMap);

        const updatedExercises = exercises.map((ex) => ({
          ...ex,
          exercise_name:
            namesMap[ex.exercise_id] || `Ejercicio #${ex.exercise_id}`,
        }));

        setExercises(updatedExercises);
      } catch (error) {
        AppAlert.error("Error", "Ocurrió un error al cargar los ejercicios.");
      }
    };

    loadExerciseNames();
  }, []);

  const handleRemoveExercise = (index: number) => {
    AppAlert.confirm(
      "Eliminar ejercicio",
      "¿Estás seguro que deseas eliminar este ejercicio de la rutina?",
      () => {
        const updatedExercises = [...exercises];
        updatedExercises.splice(index, 1);

        updatedExercises.forEach((ex, idx) => {
          ex.order = idx + 1;
        });

        setExercises(updatedExercises);
      }
    );
  };

  const handleSaveChanges = () => {
    setLoading(true);
    onReturn(exercises);
    navigation.goBack();
  };

  const handleCancel = () => {
    const hasChanges =
      JSON.stringify(exercises) !== JSON.stringify(selectedExercises);

    if (hasChanges) {
      AppAlert.confirm(
        "Guardar cambios",
        "¿Quieres guardar los cambios realizados antes de salir?",
        () => handleSaveChanges(),
        () => navigation.goBack()
      );
    } else {
      navigation.goBack();
    }
  };

  const renderExerciseItem = ({
    item,
    index,
  }: {
    item: RoutineExerciseFormData & { exercise_name?: string };
    index: number;
  }) => {
    return (
      <View className="bg-white mb-3 rounded-lg overflow-hidden shadow-sm">
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-lg text-gray-800">
                  {item.exercise_name ||
                    exerciseNames[item.exercise_id] ||
                    `Ejercicio #${item.exercise_id}`}
                </Text>
              </View>
              <View className="mt-1 flex-row flex-wrap">
                <View className="bg-gray-100 rounded-full px-2 py-0.5 mr-1 mb-1">
                  <Text className="text-xs text-gray-700">
                    {item.sets} series
                  </Text>
                </View>
                <View className="bg-gray-100 rounded-full px-2 py-0.5 mr-1 mb-1">
                  <Text className="text-xs text-gray-700">
                    {item.reps} reps
                  </Text>
                </View>
                <View className="bg-gray-100 rounded-full px-2 py-0.5 mb-1">
                  <Text className="text-xs text-gray-700">
                    {item.rest_time}s descanso
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              className="bg-red-50 rounded-full p-2"
              onPress={() => handleRemoveExercise(index)}
            >
              <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Ejercicios Seleccionados"
            onBack={handleCancel}
          />

          <View className="p-4">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {exercises.length}{" "}
              {exercises.length === 1
                ? "ejercicio seleccionado"
                : "ejercicios seleccionados"}
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Puedes eliminar cualquier ejercicio tocando el icono de eliminar
            </Text>
          </View>

          {exercises.length > 0 ? (
            <FlatList
              data={exercises}
              keyExtractor={(
                item: RoutineExerciseFormData & { exercise_name?: string },
                index: number
              ) => `exercise-${item.exercise_id}-${index}`}
              renderItem={renderExerciseItem}
              contentContainerClassName="px-4 pb-24"
            />
          ) : (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-lg text-gray-600 text-center">
                No hay ejercicios seleccionados
              </Text>
              <TouchableOpacity
                className="mt-4 bg-indigo-100 px-4 py-2 rounded-lg"
                onPress={() => handleSaveChanges()}
                testID="go-back-button"
              >
                <Text className="text-indigo-700">
                  Volver a añadir ejercicios
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {exercises.length > 0 && (
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <TouchableOpacity
                className="bg-indigo-600 rounded-lg py-3"
                onPress={handleSaveChanges}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Guardar cambios
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default SelectedExercisesScreen;
