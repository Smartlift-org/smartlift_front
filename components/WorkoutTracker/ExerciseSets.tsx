import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { WorkoutExercise, WorkoutSet } from "../../services/routineService";

interface ExerciseSetsProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  viewMode: boolean;
  workoutStatus:
    | "not_started"
    | "in_progress"
    | "paused"
    | "completed"
    | "abandoned";
  updateSetDetails: (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: number | boolean
  ) => void;
  toggleSetCompletion: (exerciseIndex: number, setIndex: number) => void;
}

const ExerciseSets: React.FC<ExerciseSetsProps> = ({
  exercise,
  exerciseIndex,
  viewMode,
  workoutStatus,
  updateSetDetails,
  toggleSetCompletion,
}) => {
  const isInputDisabled =
    viewMode ||
    workoutStatus === "not_started" ||
    workoutStatus === "completed" ||
    workoutStatus === "abandoned";

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">
        {exercise.exercise.name}
      </Text>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-600">
          Series totales: {exercise.sets.length}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-sm font-medium text-gray-600 w-12 text-center">
          Set
        </Text>
        <Text className="text-sm font-medium text-gray-600 w-16 text-center">
          Peso
        </Text>
        <Text className="text-sm font-medium text-gray-600 w-16 text-center">
          Reps
        </Text>
        <Text className="text-sm font-medium text-gray-600 w-16 text-center">
          Completo
        </Text>
      </View>

      {exercise.sets.map((set, setIndex) => (
        <View
          key={setIndex}
          className="flex-row items-center justify-between py-2 border-b border-gray-100"
        >
          <Text className="text-base w-12 text-center">{setIndex + 1}</Text>

          <View className="flex-row items-center w-16 justify-center">
            {viewMode || workoutStatus === "completed" ? (
              <Text className="text-base text-center text-gray-700">
                {set.weight}
              </Text>
            ) : (
              <TextInput
                className="bg-gray-50 rounded-md py-1 px-2 text-center text-base w-12"
                value={set.weight.toString()}
                onChangeText={(text: string) => {
                  const value = parseInt(text) || 0;
                  updateSetDetails(exerciseIndex, setIndex, "weight", value);
                }}
                keyboardType="numeric"
                editable={!isInputDisabled}
              />
            )}
            <Text className="text-xs text-gray-500 ml-1">kg</Text>
          </View>

          <View className="flex-row items-center w-16 justify-center">
            {viewMode || workoutStatus === "completed" ? (
              <Text className="text-base text-center text-gray-700">
                {set.reps}
              </Text>
            ) : (
              <TextInput
                className="bg-gray-50 rounded-md py-1 px-2 text-center text-base w-12"
                value={set.reps.toString()}
                onChangeText={(text: string) => {
                  const value = parseInt(text) || 0;
                  updateSetDetails(exerciseIndex, setIndex, "reps", value);
                }}
                keyboardType="numeric"
                editable={!isInputDisabled}
              />
            )}
          </View>

          <TouchableOpacity
            className="w-16 items-center justify-center"
            onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
            disabled={isInputDisabled}
          >
            <View
              className={`w-6 h-6 rounded border ${
                set.completed
                  ? "bg-indigo-600 border-indigo-600"
                  : "border-gray-400"
              } items-center justify-center`}
            >
              {set.completed && (
                <AntDesign name="check" size={14} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default ExerciseSets;
