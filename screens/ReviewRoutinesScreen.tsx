import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import aiRoutineService from "../services/aiRoutineService";
import { AIRoutineResponse } from "../types/aiRoutines";

type Props = {
  navigation: any;
  route: any;
};

const ReviewRoutinesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { routines } = route.params as { routines: AIRoutineResponse[] };
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!routines || routines.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Revisar Rutinas"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center p-4">
          <FontAwesome5 name="exclamation-circle" size={64} color="#f87171" />
          <Text className="mt-4 text-xl font-bold text-gray-800">
            No se han generado rutinas
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            Hubo un problema al generar las rutinas. Por favor, intenta
            nuevamente.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-indigo-600 py-3 px-6 rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-medium">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedRoutine = routines[selectedRoutineIndex];

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await aiRoutineService.saveGeneratedRoutines(routines);
      AppAlert.success("¡Éxito!", "Rutinas guardadas correctamente");
      navigation.navigate("RoutineList", { refresh: true });
    } catch (error) {
      console.error("Error al guardar rutinas:", error);
      AppAlert.error("Error", "No se pudieron guardar las rutinas");
    } finally {
      setSaving(false);
    }
  };

  const titleSuffix =
    routines.length > 1 ? " (Día " + (selectedRoutineIndex + 1) + ")" : "";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title={"Revisar Rutina" + titleSuffix}
        onBack={() => navigation.goBack()}
      />

      {routines.length > 1 && (
        <View className="flex-row flex-wrap p-3 bg-white">
          {routines.map((_, index) => (
            <TouchableOpacity
              key={index}
              className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                index === selectedRoutineIndex ? "bg-indigo-600" : "bg-gray-200"
              }`}
              onPress={() => setSelectedRoutineIndex(index)}
            >
              <Text
                className={`${
                  index === selectedRoutineIndex
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Día {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-xl font-bold mb-2">
            {selectedRoutine.routine.name}
          </Text>
          <View className="flex-row items-center mb-2">
            <View className="px-2 py-1 bg-indigo-100 rounded mr-2">
              <Text className="text-indigo-800 text-xs font-medium">
                {selectedRoutine.routine.difficulty === "beginner"
                  ? "Principiante"
                  : selectedRoutine.routine.difficulty === "intermediate"
                  ? "Intermedio"
                  : "Avanzado"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome5 name="clock" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                {selectedRoutine.routine.duration} min
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 mb-4">
            {selectedRoutine.routine.description}
          </Text>

          <View className="bg-indigo-50 p-3 rounded-lg">
            <Text className="text-indigo-800">
              {selectedRoutine.descripcion}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-bold mb-2">Ejercicios:</Text>
        {selectedRoutine.routine.routine_exercises_attributes.map(
          (exercise, index) => (
            <View
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 mb-3"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium text-base">
                  Ejercicio ID: {exercise.exercise_id}
                </Text>
                <View className="bg-gray-100 px-2 py-1 rounded">
                  <Text className="text-xs text-gray-600">
                    Orden: {exercise.order}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                <View className="bg-gray-100 rounded-lg p-2 mr-2 mb-2">
                  <Text className="text-gray-700">{exercise.sets} series</Text>
                </View>

                <View className="bg-gray-100 rounded-lg p-2 mr-2 mb-2">
                  <Text className="text-gray-700">
                    {exercise.reps} repeticiones
                  </Text>
                </View>

                <View className="bg-gray-100 rounded-lg p-2 mb-2">
                  <Text className="text-gray-700">
                    {exercise.rest_time}s descanso
                  </Text>
                </View>
              </View>
            </View>
          )
        )}

        <View className="bg-yellow-50 p-4 rounded-lg mb-8">
          <Text className="text-yellow-800">
            Nota: Los IDs de ejercicios se reemplazarán con los nombres reales
            cuando el backend esté completo.
          </Text>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          disabled={saving}
          className={`py-3 rounded-lg ${
            saving ? "bg-gray-400" : "bg-indigo-600"
          }`}
          onPress={handleSaveAll}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium text-center">
              Guardar {routines.length > 1 ? "Todas las Rutinas" : "Rutina"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ReviewRoutinesScreen;
