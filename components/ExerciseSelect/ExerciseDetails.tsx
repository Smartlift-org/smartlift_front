import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Exercise } from "../../types/exercise";
import VideoPlayer from "../VideoPlayer";

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
  const screenWidth = Dimensions.get("window").width;
  const imageSize = Math.min(screenWidth * 0.45, 180);

  return (
    <View className="flex-1 bg-white rounded-t-3xl shadow-xl">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-xl font-bold text-center text-gray-800 mb-2">
            {exercise.name}
          </Text>

          <VideoPlayer 
            videoId={exercise.video_url || "https://youtu.be/xdmxM-v4KQg"} 
          />

          {exercise.images && exercise.images.length > 0 ? (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                {exercise.images.map((url: string, imgIndex: number) => (
                  <Image
                    key={imgIndex}
                    source={{ uri: url }}
                    style={{
                      width: imageSize,
                      height: imageSize,
                      borderRadius: 8,
                      marginHorizontal: 6,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View className="mt-4">
            <Text className="text-lg font-bold mb-2 text-gray-800 text-center">
              Información del ejercicio
            </Text>

            <View className="flex-row justify-center mb-4">
              <View className="bg-indigo-100 px-3 py-1 rounded-full">
                <Text className="text-sm text-black font-medium">
                  Nivel:{" "}
                  {exercise.level === "beginner"
                    ? "Principiante"
                    : exercise.level === "intermediate"
                    ? "Intermedio"
                    : "Avanzado"}
                </Text>
              </View>
            </View>

            <Text className="text-base font-semibold text-gray-800 mb-2 text-center">
              Músculos trabajados
            </Text>

            <View className="flex-row flex-wrap justify-center gap-2 mb-4">
              {exercise.primary_muscles &&
                exercise.primary_muscles.map((muscle, index) => (
                  <View
                    key={index}
                    className="bg-indigo-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-sm text-black capitalize font-medium">
                      {muscle}
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          {exercise.instructions ? (
            <View className="mt-4 w-full">
              <Text className="font-semibold text-gray-700 mb-2 text-center">
                Instrucciones:
              </Text>
              {(() => {
                try {
                  const parsedInstructions = JSON.parse(exercise.instructions);
                  return (
                    <View className="bg-gray-50 p-4 rounded-lg">
                      {Array.isArray(parsedInstructions) &&
                        parsedInstructions.map((instruction, index) => (
                          <View key={index} className="flex-row mb-3">
                            <Text className="text-black font-bold mr-3">
                              {index + 1}.
                            </Text>
                            <Text className="text-sm text-black flex-1">
                              {instruction}
                            </Text>
                          </View>
                        ))}
                    </View>
                  );
                } catch (e) {
                  return (
                    <Text className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {exercise.instructions}
                    </Text>
                  );
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
              <Text className="text-black mb-1 font-medium">Series</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-center font-medium"
                keyboardType="numeric"
                value={sets}
                onChangeText={onSetsChange}
                placeholder="3"
              />
            </View>
            <View className="flex-1 mx-2">
              <Text className="text-black mb-1 font-medium">Repeticiones</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-center font-medium"
                keyboardType="numeric"
                value={reps}
                onChangeText={onRepsChange}
                placeholder="12"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-black mb-1 font-medium">Descanso (s)</Text>
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
