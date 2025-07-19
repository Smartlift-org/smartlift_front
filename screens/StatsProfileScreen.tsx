import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import AppAlert from "../components/AppAlert";
import userStatsService from "../services/userStatsService";
import ScreenHeader from "../components/ScreenHeader";

type StatsProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "StatsProfile">;
  route: { params: { fromRedirect?: boolean } };
};

const EXPERIENCE_LEVELS = [
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Avanzado", value: "advanced" },
];

const ACTIVITY_LEVELS = [
  { label: "Sedentario", value: "sedentary" },
  { label: "Moderado", value: "moderate" },
  { label: "Activo", value: "active" },
];

const FITNESS_GOALS = [
  { label: "Pérdida de peso", value: "weight_loss" },
  { label: "Tonificación muscular", value: "muscle_tone" },
  { label: "Ganancia de músculo", value: "muscle_gain" },
  { label: "Mejora de resistencia", value: "endurance" },
  { label: "Mejora de fuerza", value: "strength" },
  { label: "Mantenimiento", value: "maintenance" },
];

const MIN_AVAILABLE_DAYS = 1;
const MAX_AVAILABLE_DAYS = 7;

const StatsProfileScreen: React.FC<StatsProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const fromRedirect = route.params?.fromRedirect || false;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(fromRedirect);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [fitnessGoal, setFitnessGoal] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("");
  const [equipmentAvailable, setEquipmentAvailable] = useState<boolean>(false);
  const [hasPhysicalLimitations, setHasPhysicalLimitations] =
    useState<boolean>(false);
  const [physicalLimitations, setPhysicalLimitations] = useState<string>("");
  const [availableDaysCount, setAvailableDaysCount] = useState<string>("");

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const stats = await userStatsService.getUserStats();
      if (stats) {
        setUserStats(stats);
        setHeight(stats.height?.toString() || "");
        setWeight(stats.weight?.toString() || "");
        setAge(stats.age?.toString() || "");
        setGender(stats.gender || "");
        setFitnessGoal(stats.fitness_goal || "");
        setExperienceLevel(stats.experience_level || "");
        setActivityLevel(stats.activity_level || "");
        setEquipmentAvailable(stats.equipment_available || false);

        setPhysicalLimitations(stats.physical_limitations || "");
        setHasPhysicalLimitations(stats.physical_limitations !== "Ninguna");

        if (stats.available_days) {
          setAvailableDaysCount(stats.available_days.toString());
        } else if (!fromRedirect) {
          AppAlert.info(
            "Información no encontrada",
            "No se encontró información de perfil. Por favor completa tu perfil."
          );
          setIsEditing(true);
        }
      } else if (!fromRedirect) {
        AppAlert.info(
          "Información no encontrada",
          "No se encontró información de perfil. Por favor completa tu perfil."
        );
        setIsEditing(true);
      }
    } catch (error) {
      AppAlert.error("Error", "Ocurrió un error al cargar tu información.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateAvailableDays = (): boolean => {
    const daysCount = parseInt(availableDaysCount);
    return (
      !isNaN(daysCount) &&
      daysCount >= MIN_AVAILABLE_DAYS &&
      daysCount <= MAX_AVAILABLE_DAYS
    );
  };

  const handleAvailableDaysChange = (value: string): void => {
    if (value === "" || /^[0-9]+$/.test(value)) {
      if (value === "" || value.length <= 1) {
        setAvailableDaysCount(value);
      }
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    const missingFields: string[] = [];

    if (!height) missingFields.push("Estatura");
    if (!weight) missingFields.push("Peso");
    if (!age) missingFields.push("Edad");
    if (!gender) missingFields.push("Género");
    if (!fitnessGoal) missingFields.push("Objetivo fitness");
    if (!experienceLevel) missingFields.push("Nivel de experiencia");
    if (!availableDaysCount) missingFields.push("Días disponibles");
    if (!activityLevel) missingFields.push("Nivel de actividad");
    if (hasPhysicalLimitations && !physicalLimitations.trim())
      missingFields.push("Descripción de limitaciones físicas");

    if (availableDaysCount && !validateAvailableDays()) {
      AppAlert.error(
        "Valor inválido",
        `Los días disponibles deben ser un número entre ${MIN_AVAILABLE_DAYS} y ${MAX_AVAILABLE_DAYS}`
      );
      return;
    }

    if (missingFields.length > 0) {
      AppAlert.error(
        "Campos requeridos",
        `Por favor completa los siguientes campos: ${missingFields.join(", ")}`
      );
      return;
    }

    setIsSaving(true);

    try {
      const userStatsData = {
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        age: age ? parseInt(age) : undefined,
        gender,
        fitness_goal: fitnessGoal,
        experience_level: experienceLevel,
        available_days: availableDaysCount
          ? parseInt(availableDaysCount)
          : undefined,
        equipment_available: equipmentAvailable,
        activity_level: activityLevel,
        physical_limitations: hasPhysicalLimitations
          ? physicalLimitations
          : "Ninguna",
      };

      let statsResponse;
      if (userStats) {
        statsResponse = await userStatsService.updateUserStats(userStatsData);
      } else {
        statsResponse = await userStatsService.createUserStats(userStatsData);
      }

      setUserStats(statsResponse);
      setIsEditing(false);

      if (fromRedirect) {
        AppAlert.info(
          "¡Perfil Completado!",
          "Gracias por completar tu perfil. Ahora puedes comenzar a utilizar todas las funciones de la aplicación."
        );

        navigation.reset({
          index: 0,
          routes: [{ name: "UserHome" }],
        });
      } else {
        AppAlert.info(
          "¡Actualizado!",
          "Tus estadísticas han sido actualizadas correctamente."
        );
      }
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudo actualizar tu información. Intenta más tarde."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600 font-medium">
          Cargando información...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1">
          <ScreenHeader
            title="Perfil de Estadísticas"
            onBack={() => navigation.goBack()}
            rightComponent={
              !isEditing ? (
                <TouchableOpacity
                  className="bg-indigo-600 rounded-lg py-2 px-4 shadow-sm"
                  onPress={() => setIsEditing(true)}
                >
                  <Text className="text-white text-center font-medium">
                    {fromRedirect ? "Completar Perfil" : "Editar Estadísticas"}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />

          <ScrollView className="flex-1 p-4">
            <Text className="text-2xl font-bold text-indigo-900 mb-6">
              Mi Información Fitness
            </Text>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Medidas Básicas
              </Text>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Altura (cm)</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Altura en cm"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={(text: string) =>
                    setHeight(text.replace(/[^0-9]/g, ""))
                  }
                  editable={isEditing}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Peso (kg)</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Peso en kg"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={(text: string) =>
                    setWeight(text.replace(/[^0-9.]/g, ""))
                  }
                  editable={isEditing}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Edad</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Edad"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={(text: string) =>
                    setAge(text.replace(/[^0-9]/g, ""))
                  }
                  editable={isEditing}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Género</Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={gender}
                      onValueChange={(value: string) => setGender(value)}
                    >
                      <Picker.Item label="Selecciona tu género" value="" />
                      <Picker.Item label="Masculino" value="male" />
                      <Picker.Item label="Femenino" value="female" />
                      <Picker.Item label="No binario" value="non_binary" />
                      <Picker.Item
                        label="Prefiero no decir"
                        value="prefer_not_to_say"
                      />
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {gender === "male"
                      ? "Masculino"
                      : gender === "female"
                      ? "Femenino"
                      : gender === "non_binary"
                      ? "No binario"
                      : gender === "prefer_not_to_say"
                      ? "Prefiero no decir"
                      : "No especificado"}
                  </Text>
                )}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Detalles de Entrenamiento
              </Text>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">
                  Objetivo de Fitness
                </Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={fitnessGoal}
                      onValueChange={(value: string) => setFitnessGoal(value)}
                    >
                      <Picker.Item label="Selecciona tu objetivo" value="" />
                      {FITNESS_GOALS.map((goal) => (
                        <Picker.Item
                          key={goal.value}
                          label={goal.label}
                          value={goal.value}
                        />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {FITNESS_GOALS.find((goal) => goal.value === fitnessGoal)
                      ?.label || "No especificado"}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">
                  Nivel de Experiencia
                </Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={experienceLevel}
                      onValueChange={(value: string) =>
                        setExperienceLevel(value)
                      }
                    >
                      <Picker.Item label="Selecciona tu nivel" value="" />
                      {EXPERIENCE_LEVELS.map((level) => (
                        <Picker.Item
                          key={level.value}
                          label={level.label}
                          value={level.value}
                        />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {EXPERIENCE_LEVELS.find(
                      (level) => level.value === experienceLevel
                    )?.label || "No especificado"}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">
                  Nivel de Actividad
                </Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={activityLevel}
                      onValueChange={(value: string) => setActivityLevel(value)}
                    >
                      <Picker.Item
                        label="Selecciona tu nivel de actividad"
                        value=""
                      />
                      {ACTIVITY_LEVELS.map((level) => (
                        <Picker.Item
                          key={level.value}
                          label={level.label}
                          value={level.value}
                        />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {ACTIVITY_LEVELS.find(
                      (level) => level.value === activityLevel
                    )?.label || "No especificado"}
                  </Text>
                )}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Equipo y Limitaciones
              </Text>

              <View className="flex-row items-center mb-4">
                <Text className="text-sm text-gray-600 flex-1">
                  ¿Tienes equipo disponible?
                </Text>
                {isEditing ? (
                  <TouchableOpacity
                    onPress={() => setEquipmentAvailable(!equipmentAvailable)}
                    className={`p-2 rounded-lg ${
                      equipmentAvailable ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <Text
                      className={
                        equipmentAvailable ? "text-white" : "text-gray-600"
                      }
                    >
                      {equipmentAvailable ? "Sí" : "No"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="font-medium">
                    {equipmentAvailable ? "Sí" : "No"}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-gray-600 flex-1">
                    ¿Tienes limitaciones físicas?
                  </Text>
                  {isEditing ? (
                    <TouchableOpacity
                      onPress={() =>
                        setHasPhysicalLimitations(!hasPhysicalLimitations)
                      }
                      className={`p-2 rounded-lg ${
                        hasPhysicalLimitations ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <Text
                        className={
                          hasPhysicalLimitations
                            ? "text-white"
                            : "text-gray-600"
                        }
                      >
                        {hasPhysicalLimitations ? "Sí" : "No"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="font-medium">
                      {hasPhysicalLimitations ? "Sí" : "No"}
                    </Text>
                  )}
                </View>

                {hasPhysicalLimitations && (
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base mt-2"
                    placeholder="Describe tus limitaciones físicas"
                    value={physicalLimitations}
                    onChangeText={setPhysicalLimitations}
                    multiline
                    editable={isEditing}
                  />
                )}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Días Disponibles para Entrenar
              </Text>

              <View className="mb-2">
                <Text className="text-sm text-gray-600 mb-1">
                  Cantidad de días disponibles para entrenar (1-7):
                </Text>

                {isEditing ? (
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                    placeholder="Cantidad de días (1-7)"
                    value={availableDaysCount}
                    onChangeText={handleAvailableDaysChange}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {availableDaysCount || "No especificado"}
                  </Text>
                )}

                {isEditing && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Ingresa un número entre 1 y 7 que represente cuántos días a
                    la semana puedes entrenar.
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {isEditing && (
            <View className="p-4 bg-white border-t border-gray-200 shadow-lg">
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-gray-300 py-3 px-6 rounded-lg flex-1 mr-2"
                  onPress={() => {
                    setIsEditing(false);
                    loadUserStats();
                  }}
                >
                  <Text className="text-gray-700 text-center font-semibold">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-indigo-600 rounded-lg py-3 px-6 shadow-sm flex-1 ml-2"
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white text-center font-medium">
                      {fromRedirect ? "Completar Perfil" : "Guardar"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default StatsProfileScreen;
