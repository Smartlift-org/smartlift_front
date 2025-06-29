import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import AppAlert from "../components/AppAlert";
import ScreenHeader from "../components/ScreenHeader";
import routineService from "../services/routineService";

type RoutineCreateScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineCreate">;
};

const DIFFICULTY_LEVELS = [
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Avanzado", value: "advanced" },
];

const RoutineCreateScreen: React.FC<RoutineCreateScreenProps> = ({
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [duration, setDuration] = useState<string>("30");

  const validateForm = (): boolean => {
    if (!name.trim()) {
      AppAlert.error("Error", "El nombre de la rutina es obligatorio.");
      return false;
    }

    if (name.trim().length > 50) {
      AppAlert.error("Error", "El nombre no puede exceder los 50 caracteres.");
      return false;
    }

    if (!description.trim()) {
      AppAlert.error("Error", "La descripción de la rutina es obligatoria.");
      return false;
    }

    if (description.trim().length < 10) {
      AppAlert.error(
        "Error",
        "La descripción debe tener al menos 10 caracteres."
      );
      return false;
    }

    if (description.trim().length > 500) {
      AppAlert.error(
        "Error",
        "La descripción no puede exceder los 500 caracteres."
      );
      return false;
    }

    if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
      AppAlert.error("Error", "La dificultad seleccionada no es válida.");
      return false;
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      AppAlert.error("Error", "La duración debe ser un número positivo.");
      return false;
    }

    if (durationNum > 180) {
      AppAlert.error("Error", "La duración no puede exceder los 180 minutos.");
      return false;
    }

    return true;
  };

  const handleContinueToExerciseSelection = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const nameExists = await routineService.checkRoutineNameExists(name.trim());
      
      if (nameExists) {
        AppAlert.error(
          "Nombre duplicado", 
          "Ya existe una rutina con este nombre. Por favor, elige un nombre diferente."
        );
        return;
      }
      
      navigation.navigate("ExerciseSelect", {
        routineData: {
          name: name.trim(),
          description: description.trim(),
          difficulty,
          duration: Number(duration),
        },
      });
    } catch (error) {
      AppAlert.error("Error", "Ocurrió un error al validar el nombre de la rutina. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1">
          <ScreenHeader
            title="Crear Rutina"
            onBack={() => navigation.goBack()}
          />

          <ScrollView className="flex-1 p-4">
            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-1">
                Nombre de la Rutina*
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Ingresa un nombre para tu rutina"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-1">Descripción*</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Describe en qué consiste esta rutina"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-1">Dificultad*</Text>
              <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={difficulty}
                  onValueChange={(
                    value: "beginner" | "intermediate" | "advanced"
                  ) => setDifficulty(value)}
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <Picker.Item
                      key={level.value}
                      label={level.label}
                      value={level.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-12">
              <Text className="text-sm text-gray-600 mb-1">
                Duración Estimada (minutos)*
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Tiempo aproximado para completar la rutina"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View className="p-4 bg-white border-t border-gray-200 shadow-lg">
            <TouchableOpacity
              className="bg-indigo-600 rounded-lg py-3 mt-6 shadow-sm"
              onPress={handleContinueToExerciseSelection}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Crear Rutina
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default RoutineCreateScreen;
