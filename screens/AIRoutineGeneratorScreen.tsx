import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import userStatsService, { UserStats } from "../services/userStatsService";
import aiRoutineService from "../services/aiRoutineService";
import { AIRoutineRequest, AIRoutineResponse } from "../types/aiRoutines";
import { FontAwesome5 } from "@expo/vector-icons";

type Props = {
  navigation: any;
  route: any;
};

const FOCUS_AREAS = [
  "Pecho",
  "Espalda",
  "Brazos",
  "Hombros",
  "Piernas",
  "Core",
  "Cardio",
  "Funcional",
];

const AIRoutineGeneratorScreen: React.FC<Props> = ({ navigation, route }) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [generatePerDay, setGeneratePerDay] = useState(false);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const stats = await userStatsService.getUserStats();
        setUserStats(stats);
      } catch (error) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar tus datos. Verifica tu conexión."
        );
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, []);

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleGenerate = async () => {
    if (!userStats) {
      AppAlert.error("Error", "No se pudo acceder a tus datos de perfil.");
      return;
    }

    setLoading(true);
    try {
      const request: AIRoutineRequest = {
        userStats,
        generatePerDay,
        preferences: {
          focusAreas,
          equipment:
            typeof userStats.equipment_available === "boolean"
              ? userStats.equipment_available
                ? "Sí"
                : "No"
              : typeof userStats.equipment_available === "string"
              ? userStats.equipment_available
              : "",
          additionalNotes,
        },
      };

      const result = await aiRoutineService.generateRoutines(request);

      navigation.navigate("ReviewRoutines", { routines: result });
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron generar las rutinas. Intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Generador IA de Rutinas"
        onBack={() => navigation.goBack()}
      />

      {loadingUserData ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="mt-4 text-gray-600">Cargando tus datos...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <View className="bg-indigo-100 p-4 rounded-lg mb-6">
            <Text className="text-indigo-800 text-base">
              Nuestro asistente de IA creará rutinas personalizadas basadas en
              tu perfil, objetivos y preferencias.
            </Text>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Tu perfil fitness
            </Text>

            {userStats && (
              <>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Experiencia:</Text>
                  <Text className="font-medium">
                    {userStats.experience_level}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Objetivo:</Text>
                  <Text className="font-medium">{userStats.fitness_goal}</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Días disponibles:</Text>
                  <Text className="font-medium">
                    {userStats.available_days} días/semana
                  </Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Equipo disponible:</Text>
                  <Text className="font-medium">
                    {userStats.equipment_available || "No especificado"}
                  </Text>
                </View>

                <TouchableOpacity
                  className="mt-2 flex-row items-center"
                  onPress={() => navigation.navigate("StatsProfile")}
                >
                  <Text className="text-indigo-600 font-medium mr-1">
                    Editar perfil
                  </Text>
                  <FontAwesome5 name="edit" size={14} color="#4f46e5" />
                </TouchableOpacity>
              </>
            )}
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Opciones de generación
            </Text>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base text-gray-700">
                Generar una rutina para cada día disponible
              </Text>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#c7d2fe" }}
                thumbColor={generatePerDay ? "#4f46e5" : "#f4f4f5"}
                ios_backgroundColor="#e2e8f0"
                onValueChange={setGeneratePerDay}
                value={generatePerDay}
              />
            </View>

            <Text className="text-sm text-gray-500 mb-4">
              {generatePerDay
                ? `Se generarán ${
                    userStats?.available_days || 0
                  } rutinas diferentes, una para cada día`
                : "Se generará una rutina completa para todos tus días de entrenamiento"}
            </Text>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Áreas de enfoque (opcional)
            </Text>

            <View className="flex-row flex-wrap">
              {FOCUS_AREAS.map((area) => (
                <TouchableOpacity
                  key={area}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                    focusAreas.includes(area) ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                  onPress={() => toggleFocusArea(area)}
                >
                  <Text
                    className={`${
                      focusAreas.includes(area) ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Notas adicionales (opcional)
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-gray-700 min-h-[100px]"
              multiline
              placeholder="Agrega instrucciones específicas o preferencias (ej: 'Quiero entrenar en casa', 'Prefiero ejercicios con mancuernas', etc.)"
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
            />
          </View>

          <TouchableOpacity
            className={`py-4 rounded-lg mb-8 ${
              loading ? "bg-gray-400" : "bg-indigo-600"
            }`}
            disabled={loading}
            onPress={handleGenerate}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium text-center text-lg">
                Generar Rutina
                {generatePerDay &&
                userStats?.available_days &&
                userStats.available_days > 1
                  ? "s"
                  : ""}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AIRoutineGeneratorScreen;
