import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import ScreenHeader from "../../components/ScreenHeader";
import { AIRoutine } from "../../types/routineModification";

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ModifiedRoutineResult"
  >;
  route: RouteProp<RootStackParamList, "ModifiedRoutineResult">;
};

const ModifiedRoutineResultScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { originalRoutine, modifiedRoutine, appliedModifications } =
    route.params;
  const [activeTab, setActiveTab] = useState<"comparison" | "details">(
    "comparison"
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-yellow-600";
      case "advanced":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleAcceptRoutine = () => {
    Alert.alert(
      "Rutina Aceptada",
      "La rutina modificada ha sido guardada en tu lista de rutinas.",
      [
        {
          text: "Ver Rutinas",
          onPress: () => navigation.navigate("UserHome"),
        },
        {
          text: "Modificar Más",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleRejectRoutine = () => {
    Alert.alert("Rutina Rechazada", "¿Qué te gustaría hacer?", [
      {
        text: "Modificar Nuevamente",
        onPress: () => navigation.goBack(),
      },
      {
        text: "Volver al Inicio",
        onPress: () => navigation.navigate("UserHome"),
      },
    ]);
  };

  const renderRoutineCard = (
    routine: AIRoutine,
    title: string,
    isModified: boolean = false
  ) => (
    <View
      className={`p-4 rounded-lg border-2 ${
        isModified ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
      } mb-4`}
    >
      <View className="flex-row items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800 flex-1">
          {title}
        </Text>
        {isModified && (
          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">NUEVA</Text>
          </View>
        )}
      </View>

      <Text className="text-xl font-bold text-gray-900 mb-2">
        {routine.name}
      </Text>
      <Text className="text-gray-600 mb-3">{routine.description}</Text>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <FontAwesome5 name="clock" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-1">{routine.duration} min</Text>
        </View>

        <View className="flex-row items-center">
          <FontAwesome5 name="signal" size={14} color="#6B7280" />
          <Text
            className={`ml-1 font-medium ${getDifficultyColor(
              routine.difficulty
            )}`}
          >
            {routine.difficulty}
          </Text>
        </View>

        <View className="flex-row items-center">
          <FontAwesome5 name="dumbbell" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-1">
            {routine.routine_exercises.length} ejercicios
          </Text>
        </View>
      </View>

      {/* Lista de ejercicios */}
      <View className="border-t border-gray-200 pt-3">
        <Text className="font-medium text-gray-800 mb-2">Ejercicios:</Text>
        {routine.routine_exercises
          .slice(0, 3)
          .map((exercise: any, index: number) => (
            <View
              key={exercise.id}
              className="flex-row justify-between items-center py-1"
            >
              <Text className="text-gray-700 flex-1">
                {index + 1}. {exercise.exercise.name}
              </Text>
              <Text className="text-gray-600 text-sm">
                {exercise.sets}x{exercise.reps}
              </Text>
            </View>
          ))}
        {routine.routine_exercises.length > 3 && (
          <Text className="text-gray-500 text-sm mt-1">
            +{routine.routine_exercises.length - 3} ejercicios más
          </Text>
        )}
      </View>
    </View>
  );

  const renderChangesApplied = () => (
    <View className="p-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Cambios Aplicados
      </Text>

      {appliedModifications.difficulty && (
        <View className="mb-3 p-3 bg-blue-50 rounded-lg">
          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="signal" size={16} color="#3B82F6" />
            <Text className="ml-2 font-medium text-blue-800">Dificultad</Text>
          </View>
          <Text className="text-blue-700">
            {appliedModifications.difficulty}
          </Text>
        </View>
      )}

      {appliedModifications.duration && (
        <View className="mb-3 p-3 bg-purple-50 rounded-lg">
          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="clock" size={16} color="#8B5CF6" />
            <Text className="ml-2 font-medium text-purple-800">Duración</Text>
          </View>
          <Text className="text-purple-700">
            {appliedModifications.duration}
          </Text>
        </View>
      )}

      {appliedModifications.exercisesAdded &&
        appliedModifications.exercisesAdded.length > 0 && (
          <View className="mb-3 p-3 bg-green-50 rounded-lg">
            <View className="flex-row items-center mb-1">
              <FontAwesome5 name="plus" size={16} color="#10B981" />
              <Text className="ml-2 font-medium text-green-800">
                Ejercicios Agregados
              </Text>
            </View>
            {appliedModifications.exercisesAdded.map(
              (exercise: string, index: number) => (
                <Text key={index} className="text-green-700">
                  • {exercise}
                </Text>
              )
            )}
          </View>
        )}

      {appliedModifications.exercisesReplaced &&
        appliedModifications.exercisesReplaced.length > 0 && (
          <View className="mb-3 p-3 bg-yellow-50 rounded-lg">
            <View className="flex-row items-center mb-1">
              <FontAwesome5 name="exchange-alt" size={16} color="#F59E0B" />
              <Text className="ml-2 font-medium text-yellow-800">
                Ejercicios Reemplazados
              </Text>
            </View>
            {appliedModifications.exercisesReplaced.map(
              (replacement: string, index: number) => (
                <Text key={index} className="text-yellow-700">
                  • {replacement}
                </Text>
              )
            )}
          </View>
        )}

      {appliedModifications.volumeChanges && (
        <View className="mb-3 p-3 bg-indigo-50 rounded-lg">
          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="chart-bar" size={16} color="#6366F1" />
            <Text className="ml-2 font-medium text-indigo-800">Volumen</Text>
          </View>
          <Text className="text-indigo-700">
            {appliedModifications.volumeChanges}
          </Text>
        </View>
      )}

      {appliedModifications.restTimeChanges && (
        <View className="mb-3 p-3 bg-orange-50 rounded-lg">
          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="pause" size={16} color="#F97316" />
            <Text className="ml-2 font-medium text-orange-800">Descansos</Text>
          </View>
          <Text className="text-orange-700">
            {appliedModifications.restTimeChanges}
          </Text>
        </View>
      )}
    </View>
  );

  const renderDetailedComparison = () => (
    <View className="p-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Comparación Detallada
      </Text>

      {/* Tabla de comparación */}
      <View className="bg-white rounded-lg border border-gray-200">
        <View className="flex-row border-b border-gray-200">
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="font-medium text-gray-800">Aspecto</Text>
          </View>
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="font-medium text-gray-800">Original</Text>
          </View>
          <View className="flex-1 p-3">
            <Text className="font-medium text-gray-800">Modificada</Text>
          </View>
        </View>

        <View className="flex-row border-b border-gray-200">
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="text-gray-700">Duración</Text>
          </View>
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="text-gray-600">
              {originalRoutine.duration} min
            </Text>
          </View>
          <View className="flex-1 p-3">
            <Text className="text-green-600 font-medium">
              {modifiedRoutine.duration} min
            </Text>
          </View>
        </View>

        <View className="flex-row border-b border-gray-200">
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="text-gray-700">Dificultad</Text>
          </View>
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className={getDifficultyColor(originalRoutine.difficulty)}>
              {originalRoutine.difficulty}
            </Text>
          </View>
          <View className="flex-1 p-3">
            <Text
              className={`${getDifficultyColor(
                modifiedRoutine.difficulty
              )} font-medium`}
            >
              {modifiedRoutine.difficulty}
            </Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="text-gray-700">Ejercicios</Text>
          </View>
          <View className="flex-1 p-3 border-r border-gray-200">
            <Text className="text-gray-600">
              {originalRoutine.routine_exercises.length}
            </Text>
          </View>
          <View className="flex-1 p-3">
            <Text className="text-green-600 font-medium">
              {modifiedRoutine.routine_exercises.length}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="Rutina Modificada" />

      <ScrollView className="flex-1">
        {/* Comparación de rutinas */}
        <View className="p-4">
          {renderRoutineCard(originalRoutine, "Rutina Original")}
          {renderRoutineCard(modifiedRoutine, "Rutina Modificada", true)}
        </View>

        {/* Tabs */}
        <View className="bg-white">
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setActiveTab("comparison")}
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === "comparison"
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === "comparison" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                Cambios Aplicados
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("details")}
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === "details"
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === "details" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                Comparación Detallada
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido de tabs */}
          {activeTab === "comparison"
            ? renderChangesApplied()
            : renderDetailedComparison()}
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleRejectRoutine}
            className="flex-1 py-4 rounded-lg border-2 border-gray-300 items-center"
          >
            <View className="flex-row items-center">
              <FontAwesome5 name="times" size={16} color="#6B7280" />
              <Text className="text-gray-700 font-semibold ml-2">Rechazar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAcceptRoutine}
            className="flex-1 py-4 rounded-lg bg-green-600 items-center"
          >
            <View className="flex-row items-center">
              <FontAwesome5 name="check" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">
                Aceptar Rutina
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-3 py-3 items-center"
        >
          <Text className="text-blue-600 font-medium">
            Modificar Nuevamente
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ModifiedRoutineResultScreen;
