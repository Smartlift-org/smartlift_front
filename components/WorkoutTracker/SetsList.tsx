import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { WorkoutExercise, WorkoutSet } from "../../services/routineService";
import { AntDesign } from "@expo/vector-icons";

type SetsListProps = {
  exercise: WorkoutExercise;
  viewMode?: boolean;
  updateSetDetails: (
    setIndex: number,
    field: keyof WorkoutSet,
    value: number | boolean
  ) => void;
  toggleSetCompletion: (setIndex: number) => void;
};

const SetsList: React.FC<SetsListProps> = ({
  exercise,
  viewMode = false,
  updateSetDetails,
  toggleSetCompletion,
}) => {
  return (
    <View className="w-full">
      <View className="flex-row justify-between pb-2 border-b border-gray-200 mb-2">
        <Text className="font-medium text-gray-600 w-[60px] text-center">
          Serie
        </Text>
        <Text className="font-medium text-gray-600 w-[60px] text-center">
          Peso
        </Text>
        <Text className="font-medium text-gray-600 w-[60px] text-center">
          Reps
        </Text>
        <Text className="font-medium text-gray-600 w-[60px] text-center">
          Completada
        </Text>
      </View>

      {exercise.sets.map((set, setIndex) => (
        <View
          key={`set_${setIndex}`}
          className="flex-row items-center justify-between py-2 border-b border-gray-100"
        >
          <Text className="text-base w-[60px] text-center text-gray-700">
            {set.set_number}
          </Text>

          {viewMode ? (
            <Text className="text-base w-[60px] text-center text-gray-700">
              {set.weight} kg
            </Text>
          ) : (
            <View className="flex-row items-center w-[60px] justify-center">
              <TextInput
                className="bg-gray-100 rounded py-1.5 px-2 text-base w-[45px] text-center"
                keyboardType="numeric"
                value={set.weight?.toString() || "0"}
                onChangeText={(text: string) => {
                  const value = text === "" ? 0 : parseInt(text, 10);
                  if (!isNaN(value)) {
                    updateSetDetails(setIndex, "weight", value);
                  }
                }}
              />
            </View>
          )}

          {viewMode ? (
            <Text className="text-base w-[60px] text-center text-gray-700">
              {set.reps}
            </Text>
          ) : (
            <View className="flex-row items-center w-[60px] justify-center">
              <TextInput
                className="bg-gray-100 rounded py-1.5 px-2 text-base w-[45px] text-center"
                keyboardType="numeric"
                value={set.reps?.toString() || "0"}
                onChangeText={(text: string) => {
                  const value = text === "" ? 0 : parseInt(text, 10);
                  if (!isNaN(value)) {
                    updateSetDetails(setIndex, "reps", value);
                  }
                }}
              />
            </View>
          )}

          <View className="w-[60px] items-center justify-center">
            {viewMode ? (
              set.completed ? (
                <View className="w-6 h-6 rounded bg-[#4f46e5] items-center justify-center">
                  <AntDesign name="check" size={16} color="white" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded border-2 border-gray-300" />
              )
            ) : (
              <TouchableOpacity
                className={`w-6 h-6 rounded ${
                  set.completed
                    ? "bg-[#4f46e5] border-[#4f46e5]"
                    : "bg-white border-2 border-[#0066CC]"
                } items-center justify-center`}
                onPress={() => toggleSetCompletion(setIndex)}
              >
                {set.completed && (
                  <AntDesign name="check" size={16} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default SetsList;
