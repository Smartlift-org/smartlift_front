import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Exercise } from "../../types/exercise";

type ExerciseListProps = {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  selectedExerciseId: number | null;
};

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onSelectExercise,
  selectedExerciseId,
}) => {
  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExerciseId === item.id;

    return (
      <TouchableOpacity
        className={`mb-3 rounded-lg overflow-hidden border ${
          isSelected ? "border-indigo-600" : "border-gray-300"
        }`}
        onPress={() => onSelectExercise(item)}
      >
        <View className="flex-row">
          {item.image_urls && item.image_urls.length > 0 && (
            <Image
              source={{ uri: item.image_urls[0] }}
              className="w-20 h-20"
              resizeMode="cover"
            />
          )}

          <View className="flex-1 p-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-lg font-semibold text-gray-800 flex-1">
                {item.name}
              </Text>
              {isSelected && (
                <View className="bg-indigo-600 rounded-full p-1">
                  <AntDesign name="check" size={16} color="#ffffff" />
                </View>
              )}
            </View>

            <Text className="text-sm text-gray-600 mb-1">
              {item.primary_muscles ? item.primary_muscles.join(", ") : ""}
              {item.secondary_muscles && item.secondary_muscles.length > 0
                ? `, ${item.secondary_muscles.join(", ")}`
                : ""}
            </Text>

            <View className="flex-row items-center mt-1">
              <Text
                className={`text-xs px-2 py-1 rounded-full ${
                  item.level === "beginner"
                    ? "bg-green-100 text-green-800"
                    : item.level === "intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.level === "beginner"
                  ? "Principiante"
                  : item.level === "intermediate"
                  ? "Intermedio"
                  : "Avanzado"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {exercises.length > 0 ? (
        <FlatList
          data={exercises}
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
    </>
  );
};

export default ExerciseList;
