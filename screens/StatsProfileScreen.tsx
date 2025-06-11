import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import useCustomAlert from "../components/useCustomAlert";
import userStatsService from "../services/userStatsService";

type StatsProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "StatsProfile">;
  route: { params: { fromRedirect?: boolean } };
};

// Constants for form options
const EXPERIENCE_LEVELS = [
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Avanzado", value: "advanced" },
];

const ACTIVITY_LEVELS = [
  { label: "Sedentario", value: "sedentary" },
  { label: "Ligeramente activo", value: "lightly_active" },
  { label: "Moderadamente activo", value: "moderately_active" },
  { label: "Muy activo", value: "very_active" },
  { label: "Extremadamente activo", value: "extremely_active" },
];

const FITNESS_GOALS = [
  { label: "Pérdida de peso", value: "weight_loss" },
  { label: "Tonificación muscular", value: "muscle_tone" },
  { label: "Ganancia de músculo", value: "muscle_gain" },
  { label: "Mejora de resistencia", value: "endurance" },
  { label: "Mejora de fuerza", value: "strength" },
  { label: "Mantenimiento", value: "maintenance" },
];

const DAYS_OF_WEEK = [
  { key: "monday", label: "Lunes", value: "1" },
  { key: "tuesday", label: "Martes", value: "2" },
  { key: "wednesday", label: "Miércoles", value: "3" },
  { key: "thursday", label: "Jueves", value: "4" },
  { key: "friday", label: "Viernes", value: "5" },
  { key: "saturday", label: "Sábado", value: "6" },
  { key: "sunday", label: "Domingo", value: "7" },
];

const StatsProfileScreen: React.FC<StatsProfileScreenProps> = ({ navigation, route }) => {
  const fromRedirect = route.params?.fromRedirect || false;
  const { showAlert, AlertComponent } = useCustomAlert();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(fromRedirect);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<any>(null);

  // Form states
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [fitnessGoal, setFitnessGoal] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("");
  const [equipmentAvailable, setEquipmentAvailable] = useState<boolean>(false);
  const [hasPhysicalLimitations, setHasPhysicalLimitations] = useState<boolean>(false);
  const [physicalLimitations, setPhysicalLimitations] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

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
        
        // Initialize physical limitations
        const hasLimits = stats.physical_limitations && stats.physical_limitations !== "Ninguna";
        setHasPhysicalLimitations(Boolean(hasLimits));
        setPhysicalLimitations(hasLimits ? stats.physical_limitations : "");
        
        // Initialize selected days from the numerical value
        initializeSelectedDays(stats.available_days?.toString() || "");
      } else if (!fromRedirect) {
        // Only show error if not coming from a redirect (initial setup)
        showAlert({
          title: "Información no encontrada",
          message: "No se encontró información de perfil. Por favor completa tu perfil.",
          primaryButtonText: "Entendido"
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
      showAlert({
        title: "Error",
        message: "Ocurrió un error al cargar tu información.",
        primaryButtonText: "Aceptar"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSelectedDays = (daysValue: string): void => {
    const newSelectedDays = { ...selectedDays };
    const dayValues = daysValue.split(',');
    
    for (const day of DAYS_OF_WEEK) {
      newSelectedDays[day.key] = dayValues.includes(day.value.toString());
    }
    setSelectedDays(newSelectedDays);
  };

  // Calculate the number of available days for the backend
  const calculateAvailableDaysNumber = (): string => {
    // Collect all selected days and join them with commas
    const selectedDayValues = DAYS_OF_WEEK
      .filter(day => selectedDays[day.key])
      .map(day => day.value.toString());
    
    return selectedDayValues.join(',');  // Return comma-separated list of days
  };

  // Toggle selection of a day
  const toggleDaySelection = (day: string): void => {
    const newSelectedDays = { ...selectedDays };
    
    // Toggle the selected day
    newSelectedDays[day] = !newSelectedDays[day];
    
    setSelectedDays(newSelectedDays);
  };

  const handleSaveProfile = async (): Promise<void> => {
    // Comprehensive validation for all required fields
    const missingFields: string[] = [];
    
    if (!height) missingFields.push("Estatura");
    if (!weight) missingFields.push("Peso");
    if (!age) missingFields.push("Edad");
    if (!gender) missingFields.push("Género");
    if (!fitnessGoal) missingFields.push("Objetivo fitness");
    if (!experienceLevel) missingFields.push("Nivel de experiencia");
    if (calculateAvailableDaysNumber() === '') missingFields.push("Días disponibles");
    if (!activityLevel) missingFields.push("Nivel de actividad");
    if (hasPhysicalLimitations && !physicalLimitations.trim()) missingFields.push("Descripción de limitaciones físicas");
    
    // Check if any days are selected
    if (Object.values(selectedDays).every(day => !day)) {
      missingFields.push("Al menos un día disponible");
    }
    
    if (missingFields.length > 0) {
      showAlert({
        title: "Campos obligatorios",
        message: `Por favor complete los siguientes campos: \n${missingFields.join("\n")}.`,
        primaryButtonText: "Entendido"
      });
      return;
    }

    setIsSaving(true);

    // First, try to update user stats
    try {
      const userStatsData = {
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        age: age ? parseInt(age) : undefined,
        gender,
        fitness_goal: fitnessGoal,
        experience_level: experienceLevel,
        available_days: calculateAvailableDaysNumber(),
        equipment_available: equipmentAvailable,
        activity_level: activityLevel,
        physical_limitations: hasPhysicalLimitations ? physicalLimitations : "Ninguna",
      };

      let statsResponse;
      if (userStats) {
        // Update existing stats
        statsResponse = await userStatsService.updateUserStats(userStatsData);
      } else {
        // Create new stats
        statsResponse = await userStatsService.createUserStats(userStatsData);
      }

      setUserStats(statsResponse);
      setIsEditing(false);
      
      // Show different messages based on whether this was an initial profile completion or update
      if (fromRedirect) {
        showAlert({
          title: "¡Perfil Completado!",
          message: "Gracias por completar tu perfil. Ahora puedes comenzar a utilizar todas las funciones de la aplicación.",
          primaryButtonText: "¡Vamos!"
        });
        
        // Return to home screen if this was called during first login profile completion
        navigation.reset({
          index: 0,
          routes: [{ name: "UserHome" }],
        });
      } else {
        showAlert({
          title: "¡Actualizado!",
          message: "Tus estadísticas han sido actualizadas correctamente.",
          primaryButtonText: "Aceptar"
        });
      }
    } catch (error) {
      console.error("Error saving stats:", error);
      showAlert({
        title: "Error",
        message: "No se pudo actualizar tu información. Intenta más tarde.",
        primaryButtonText: "Aceptar"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600 font-medium">Cargando información...</Text>
      </SafeAreaView>
    );
  }

  // Placeholder for rendering
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-indigo-600 font-semibold">← Volver</Text>
            </TouchableOpacity>
            
            {!isEditing && (
              <TouchableOpacity 
                className="bg-indigo-600 rounded-lg py-2 px-4 shadow-sm"
                onPress={() => setIsEditing(true)}
              >
                <Text className="text-white text-center font-medium">
                  {fromRedirect ? "Completar Perfil" : "Editar Estadísticas"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Main Content */}
          <ScrollView className="flex-1 p-4">
            <Text className="text-2xl font-bold text-indigo-900 mb-6">Mi Información Fitness</Text>
            
            <AlertComponent />
            
            {/* Basic Measurements */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Medidas Básicas</Text>
              
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Altura (cm)</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Altura en cm"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={(text: string) => setHeight(text.replace(/[^0-9]/g, ''))}
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
                  onChangeText={(text: string) => setWeight(text.replace(/[^0-9.]/g, ''))}
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
                  onChangeText={(text: string) => setAge(text.replace(/[^0-9]/g, ''))}
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
                      <Picker.Item label="Prefiero no decir" value="prefer_not_to_say" />
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {gender === "male" ? "Masculino" : 
                    gender === "female" ? "Femenino" : 
                    gender === "non_binary" ? "No binario" : 
                    gender === "prefer_not_to_say" ? "Prefiero no decir" : "No especificado"}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Fitness Details */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Detalles de Entrenamiento</Text>
              
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Objetivo de Fitness</Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={fitnessGoal}
                      onValueChange={(value: string) => setFitnessGoal(value)}
                    >
                      <Picker.Item label="Selecciona tu objetivo" value="" />
                      {FITNESS_GOALS.map((goal) => (
                        <Picker.Item key={goal.value} label={goal.label} value={goal.value} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {FITNESS_GOALS.find(goal => goal.value === fitnessGoal)?.label || "No especificado"}
                  </Text>
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Nivel de Experiencia</Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={experienceLevel}
                      onValueChange={(value: string) => setExperienceLevel(value)}
                    >
                      <Picker.Item label="Selecciona tu nivel" value="" />
                      {EXPERIENCE_LEVELS.map((level) => (
                        <Picker.Item key={level.value} label={level.label} value={level.value} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {EXPERIENCE_LEVELS.find(level => level.value === experienceLevel)?.label || "No especificado"}
                  </Text>
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Nivel de Actividad</Text>
                {isEditing ? (
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={activityLevel}
                      onValueChange={(value: string) => setActivityLevel(value)}
                    >
                      <Picker.Item label="Selecciona tu nivel de actividad" value="" />
                      {ACTIVITY_LEVELS.map((level) => (
                        <Picker.Item key={level.value} label={level.label} value={level.value} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {ACTIVITY_LEVELS.find(level => level.value === activityLevel)?.label || "No especificado"}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Equipment and Limitations */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Equipo y Limitaciones</Text>
              
              <View className="flex-row items-center mb-4">
                <Text className="text-sm text-gray-600 flex-1">¿Tienes equipo disponible?</Text>
                {isEditing ? (
                  <TouchableOpacity 
                    onPress={() => setEquipmentAvailable(!equipmentAvailable)}
                    className={`p-2 rounded-lg ${equipmentAvailable ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <Text className={equipmentAvailable ? 'text-white' : 'text-gray-600'}>
                      {equipmentAvailable ? 'Sí' : 'No'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="font-medium">{equipmentAvailable ? 'Sí' : 'No'}</Text>
                )}
              </View>
              
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-gray-600 flex-1">¿Tienes limitaciones físicas?</Text>
                  {isEditing ? (
                    <TouchableOpacity 
                      onPress={() => setHasPhysicalLimitations(!hasPhysicalLimitations)}
                      className={`p-2 rounded-lg ${hasPhysicalLimitations ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                      <Text className={hasPhysicalLimitations ? 'text-white' : 'text-gray-600'}>
                        {hasPhysicalLimitations ? 'Sí' : 'No'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="font-medium">{hasPhysicalLimitations ? 'Sí' : 'No'}</Text>
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
            
            {/* Available Days */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Días Disponibles para Entrenar</Text>
              
              {isEditing ? (
                <View>
                  <Text className="text-sm text-gray-600 mb-2">
                    Selecciona los días de la semana que entrenas:
                  </Text>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity 
                      key={day.key}
                      onPress={() => toggleDaySelection(day.key)}
                      className={`p-3 mb-2 rounded-lg flex-row items-center ${selectedDays[day.key] ? 'bg-indigo-600' : 'bg-white border border-gray-300'}`}
                    >
                      <Text className={`${selectedDays[day.key] ? 'text-white' : 'text-gray-800'}`}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  <Text className="text-sm text-gray-600 mb-1">Días seleccionados:</Text>
                  <Text className="bg-white border border-gray-300 rounded-lg p-3 text-base">
                    {DAYS_OF_WEEK.filter(day => selectedDays[day.key])
                      .map(day => day.label)
                      .join(', ') || "Ninguno seleccionado"}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          {/* Fixed buttons at the bottom */}
          {isEditing && (
            <View className="p-4 bg-white border-t border-gray-200 shadow-lg">
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  className="bg-gray-300 py-3 px-6 rounded-lg flex-1 mr-2"
                  onPress={() => {
                    setIsEditing(false);
                    loadUserStats(); // Reset to original values
                  }}
                >
                  <Text className="text-gray-700 text-center font-semibold">Cancelar</Text>
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
      <AlertComponent />
    </>
  );
};

export default StatsProfileScreen;
