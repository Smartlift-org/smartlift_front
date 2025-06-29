import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Exercise } from "../../types/exercise";

type ExerciseDetailsProps = {
  exercise: Exercise;
  sets: string;
  reps: string;
  restTime: string;
  onSetsChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRestTimeChange: (value: string) => void;
  onAddToRoutine: () => void;
  loading: boolean;
};

const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({
  exercise,
  sets,
  reps,
  restTime,
  onSetsChange,
  onRepsChange,
  onRestTimeChange,
  onAddToRoutine,
  loading,
}) => {
  return (
    <View className="flex-1 bg-white rounded-t-3xl shadow-xl">
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-4">
          <Text className="text-xl font-bold mt-4 text-gray-800">
            {exercise.name}
          </Text>

          <View className="flex-row items-center mt-2">
            <Text
              className={`text-sm px-2 py-1 rounded-full ${
                exercise.level === "beginner"
                  ? "bg-green-100 text-green-800"
                  : exercise.level === "intermediate"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {exercise.level === "beginner"
                ? "Principiante"
                : exercise.level === "intermediate"
                ? "Intermedio"
                : "Avanzado"}
            </Text>

            <Text className="text-sm text-gray-600 ml-2">
              {exercise.primary_muscles ? exercise.primary_muscles.join(", ") : ""}
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0
                ? `, ${exercise.secondary_muscles.join(", ")}`
                : ""}
            </Text>
          </View>

          {exercise.instructions ? (
            <View className="mt-4 w-full">
              <Text className="font-semibold text-gray-700 mb-2 text-center">Instrucciones:</Text>
              {(() => {
                try {
                  const parsedInstructions = JSON.parse(exercise.instructions);
                  return (
                    <View className="bg-gray-50 p-4 rounded-lg">
                      {Array.isArray(parsedInstructions) && parsedInstructions.map((instruction, index) => (
                        <View key={index} className="flex-row mb-3">
                          <Text className="text-indigo-600 font-bold mr-3">{index + 1}.</Text>
                          <Text className="text-sm text-gray-700 flex-1">{instruction}</Text>
                        </View>
                      ))}
                    </View>
                  );
                } catch (e) {
                  return <Text className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{exercise.instructions}</Text>;
                }
              })()}
            </View>
          ) : (
            <Text className="text-sm text-gray-600 mt-3 text-center">
              Sin instrucciones disponibles
            </Text>
          )}
        </View>

        <View className="mt-6 bg-gray-50 p-4 rounded-lg">
          <Text className="text-lg font-semibold mb-4 text-gray-800 text-center">
            Configuración del ejercicio
          </Text>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 mb-1 font-medium">Series</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-center font-medium"
                keyboardType="numeric"
                value={sets}
                onChangeText={onSetsChange}
                placeholder="3"
              />
            </View>
            <View className="flex-1 mx-2">
              <Text className="text-gray-700 mb-1 font-medium">Repeticiones</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-center font-medium"
                keyboardType="numeric"
                value={reps}
                onChangeText={onRepsChange}
                placeholder="12"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 mb-1 font-medium">Descanso (s)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-center font-medium"
                keyboardType="numeric"
                value={restTime}
                onChangeText={onRestTimeChange}
                placeholder="60"
              />
            </View>
          </View>


        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-indigo-600 rounded-lg py-4 px-6 shadow-md elevation-3"
          onPress={onAddToRoutine}
          disabled={loading}
          style={{
            shadowColor: "#4338ca",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Añadir a la rutina
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExerciseDetails;
