import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { WorkoutExercise } from "../../services/routineService";

interface ExerciseSelectorProps {
  exercises: WorkoutExercise[];
  activeExerciseIndex: number;
  setActiveExerciseIndex: (index: number) => void;
  viewMode?: boolean;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  activeExerciseIndex,
  setActiveExerciseIndex,
  viewMode,
}) => {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2 px-4">
        <Text className="text-lg font-bold text-gray-800">Ejercicios</Text>
        <Text className="text-sm text-indigo-600">
          {exercises.length}{" "}
          {exercises.length === 1 ? "ejercicio" : "ejercicios"}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pb-2 px-4"
      >
        {exercises.map((exercise, index) => {
          const completedSets = exercise.sets.filter(
            (set) => set.completed
          ).length;
          const totalSets = exercise.sets.length;
          const isActive = index === activeExerciseIndex;

          return (
            <TouchableOpacity
              key={index}
              className={`mr-3 p-3 rounded-lg ${
                isActive
                  ? "bg-indigo-100 border border-indigo-300"
                  : "bg-white border border-gray-200"
              } ${viewMode ? "min-w-28" : ""}`}
              onPress={() => setActiveExerciseIndex(index)}
            >
              <Text
                className={`font-medium ${
                  isActive ? "text-indigo-700" : "text-gray-700"
                }`}
                numberOfLines={1}
              >
                {exercise.exercise.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-1 bg-indigo-600 rounded-full"
                    style={{ width: `${(completedSets / totalSets) * 100}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-600 ml-2">
                  {viewMode
                    ? `${exercise.planned_sets}×${exercise.planned_reps}`
                    : `${completedSets}/${totalSets}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ExerciseSelector;
