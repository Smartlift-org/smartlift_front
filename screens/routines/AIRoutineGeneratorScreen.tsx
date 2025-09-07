import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import userStatsService, {
  UserStats,
  translateGenderToBackend,
} from "../../services/userStatsService";
import aiRoutineService from "../../services/aiRoutineService";
import { FontAwesome5 } from "@expo/vector-icons";

type AIRoutineGeneratorScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "AIRoutineGenerator"
  >;
  route: RouteProp<RootStackParamList, "AIRoutineGenerator">;
};

const AIRoutineGeneratorScreen: React.FC<AIRoutineGeneratorScreenProps> = ({
  navigation,
  route,
}) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [timePerSession, setTimePerSession] = useState(60);
  const [generatePerDay, setGeneratePerDay] = useState(true);
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

  const handleGenerate = async () => {
    if (!userStats) {
      AppAlert.error("Error", "No se pudo acceder a tus datos de perfil.");
      return;
    }

    const validateUserData = () => {
      const errors = [];

      if (!userStats.age || userStats.age < 13 || userStats.age > 100) {
        errors.push("Edad debe estar entre 13 y 100 años");
      }

      if (
        !userStats.weight ||
        userStats.weight <= 0 ||
        userStats.weight > 300
      ) {
        errors.push("Peso debe estar entre 1 y 300 kg");
      }

      if (
        !userStats.height ||
        userStats.height < 100 ||
        userStats.height > 250
      ) {
        errors.push("Altura debe estar entre 100 y 250 cm");
      }

      if (errors.length > 0) {
        AppAlert.error(
          "Datos incompletos",
          `Por favor completa tu perfil:\n${errors.join("\n")}`
        );
        return false;
      }

      return true;
    };

    if (!validateUserData()) {
      return;
    }

    setLoading(true);
    try {
      const aiParams = {
        age: userStats.age || 25,
        gender: userStats.gender
          ? (translateGenderToBackend(userStats.gender) as
              | "male"
              | "female"
              | "other")
          : "other",
        weight: userStats.weight ? parseFloat(userStats.weight.toString()) : 70,
        height: userStats.height
          ? parseFloat(userStats.height.toString())
          : 170,
        experience_level:
          (userStats.experience_level as
            | "beginner"
            | "intermediate"
            | "advanced") || "beginner",
        frequency_per_week: generatePerDay ? userStats.available_days || 3 : 1,
        time_per_session: timePerSession,
        goal: userStats.fitness_goal || "Mejorar condición física general",
      };

      const result = await aiRoutineService.generateAndSaveRoutines(aiParams);
      const { routines, savedResults } = result;

      if (savedResults.failed === 0) {
        const successMessage = generatePerDay
          ? `Se crearon ${routines.length} rutinas exitosamente (una para cada día disponible). Ya están disponibles en tu lista de rutinas.`
          : "Se creó 1 rutina exitosamente. Ya está disponible en tu lista de rutinas.";

        AppAlert.success("¡Rutinas creadas!", successMessage);

        navigation.reset({
          index: 1,
          routes: [{ name: "UserHome" }, { name: "RoutineList" }],
        });
      } else if (savedResults.success > 0) {
        AppAlert.info(
          "Rutinas parcialmente creadas",
          `Se crearon ${savedResults.success} rutinas exitosamente, pero ${savedResults.failed} fallaron. Revisa tu lista de rutinas.`
        );
        navigation.reset({
          index: 1,
          routes: [{ name: "UserHome" }, { name: "RoutineList" }],
        });
      } else {
        AppAlert.error(
          "Error al guardar rutinas",
          "Las rutinas se generaron correctamente pero no se pudieron guardar. Intenta nuevamente."
        );
        navigation.navigate("ReviewRoutines", { routines });
      }
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message ||
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
                    userStats?.available_days || 1
                  } rutinas diferentes, una para cada día`
                : "Se generará una rutina completa para todos tus días de entrenamiento"}
            </Text>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Duración por sesión
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600">15 min</Text>
              <Text className="text-gray-600">180 min</Text>
            </View>

            <View className="mb-4">
              <Text className="text-center text-lg font-semibold text-indigo-600 mb-2">
                {timePerSession} minutos
              </Text>

              <View className="flex-row justify-center items-center">
                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded-lg mr-3"
                  onPress={() =>
                    setTimePerSession(Math.max(15, timePerSession - 15))
                  }
                >
                  <Text className="text-gray-700 font-semibold">-15</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-indigo-600 px-6 py-2 rounded-lg mx-3"
                  onPress={() => setTimePerSession(60)}
                >
                  <Text className="text-white font-semibold">60 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded-lg ml-3"
                  onPress={() =>
                    setTimePerSession(Math.min(180, timePerSession + 15))
                  }
                >
                  <Text className="text-gray-700 font-semibold">+15</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm text-gray-500 text-center">
              Ajusta la duración ideal para cada sesión de entrenamiento
            </Text>
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
