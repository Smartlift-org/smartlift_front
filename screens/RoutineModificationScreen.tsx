import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineModificationService from "../services/routineModificationService";
import { 
  AIRoutine, 
  RoutineModificationRequest, 
  MUSCLE_GROUPS 
} from "../types/routineModification";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineModification">;
};

const RoutineModificationScreen: React.FC<Props> = ({ navigation }) => {
  const [availableRoutines, setAvailableRoutines] = useState<AIRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<AIRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'exercises'>('general');

  const [modifications, setModifications] = useState<RoutineModificationRequest>({
    difficulty: { maintain: true, increase: false, decrease: false },
    duration: { maintain: true, shorter: false, longer: false },
    focus: {},
    exercises: { addMoreFor: [], removeBodyParts: [], replaceSpecific: [] },
    volume: { maintain: true, moreSets: false, fewerSets: false, moreReps: false, fewerReps: false },
    restTime: { maintain: true, shorter: false, longer: false },
    specificInstructions: ""
  });

  useEffect(() => {
    loadUserAIRoutines();
  }, []);

  const loadUserAIRoutines = async () => {
    try {
      setLoading(true);
      const routines = await routineModificationService.getUserAIRoutines();
      setAvailableRoutines(routines);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserAIRoutines();
    setRefreshing(false);
  };

  const handleRoutineSelection = (routine: AIRoutine) => {
    setSelectedRoutine(routine);
  };

  const handleDifficultyChange = (type: 'increase' | 'decrease' | 'maintain') => {
    const newRequest: RoutineModificationRequest = {
      ...modifications,
      difficulty: {
        increase: type === 'increase',
        decrease: type === 'decrease',
        maintain: type === 'maintain'
      }
    };
    setModifications(newRequest);
  };

  const handleDurationChange = (type: 'shorter' | 'longer' | 'maintain') => {
    const newRequest: RoutineModificationRequest = {
      ...modifications,
      duration: {
        shorter: type === 'shorter',
        longer: type === 'longer',
        maintain: type === 'maintain'
      }
    };
    setModifications(newRequest);
  };

  const handleFocusChange = (focusType: string, value: boolean) => {
    const newRequest: RoutineModificationRequest = {
      ...modifications,
      focus: {
        ...modifications.focus,
        [focusType]: value
      }
    };
    setModifications(newRequest);
  };

  const handleMuscleGroupChange = (action: 'addMoreFor' | 'removeBodyParts', muscleGroup: string) => {
    const newExercises = { ...modifications.exercises };
    if (action === 'addMoreFor') {
      const currentList = newExercises.addMoreFor || [];
      newExercises.addMoreFor = currentList.includes(muscleGroup)
        ? currentList.filter(item => item !== muscleGroup)
        : [...currentList, muscleGroup];
    } else if (action === 'removeBodyParts') {
      const currentList = newExercises.removeBodyParts || [];
      newExercises.removeBodyParts = currentList.includes(muscleGroup)
        ? currentList.filter(item => item !== muscleGroup)
        : [...currentList, muscleGroup];
    }
    const newRequest: RoutineModificationRequest = {
      ...modifications,
      exercises: newExercises
    };
    setModifications(newRequest);
  };

  const handleVolumeChange = (type: 'moreSets' | 'fewerSets' | 'moreReps' | 'fewerReps' | 'maintain') => {
    const newRequest: RoutineModificationRequest = {
      ...modifications,
      volume: {
        moreSets: type === 'moreSets',
        fewerSets: type === 'fewerSets',
        moreReps: type === 'moreReps',
        fewerReps: type === 'fewerReps',
        maintain: type === 'maintain'
      }
    };
    setModifications(newRequest);
  };

  const handleRestTimeChange = (type: 'shorter' | 'longer' | 'maintain') => {
    const newRequest: RoutineModificationRequest = {
      ...modifications,
      restTime: {
        shorter: type === 'shorter',
        longer: type === 'longer',
        maintain: type === 'maintain'
      }
    };
    setModifications(newRequest);
  };

  const handleSubmitModification = async () => {
    if (!selectedRoutine) {
      AppAlert.error("Error", "Debes seleccionar una rutina para modificar");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        routineId: selectedRoutine.id,
        originalRoutine: selectedRoutine,
        modifications: modifications
      };

      const result = await routineModificationService.modifyRoutine(payload);
      
      navigation.navigate('ModifiedRoutineResult', {
        originalRoutine: selectedRoutine,
        modifiedRoutine: result.data.modifiedRoutine,
        appliedModifications: result.data.appliedModifications
      });
      
    } catch (error: any) {
      AppAlert.error('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderRoutineCard = (routine: AIRoutine) => (
    <TouchableOpacity
      key={routine.id}
      onPress={() => handleRoutineSelection(routine)}
      className={`p-4 mb-3 rounded-lg border-2 ${
        selectedRoutine?.id === routine.id 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2">
          {routine.name}
        </Text>
        <View className="flex-row items-center">
          <FontAwesome5 
            name={selectedRoutine?.id === routine.id ? "dot-circle" : "circle"} 
            size={20} 
            color={selectedRoutine?.id === routine.id ? "#3B82F6" : "#9CA3AF"} 
          />
        </View>
      </View>
      
      <Text className="text-gray-600 mb-3" numberOfLines={2}>
        {routine.description}
      </Text>
      
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <FontAwesome5 name="clock" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-1">{routine.duration} min</Text>
        </View>
        
        <View className="flex-row items-center">
          <FontAwesome5 name="signal" size={14} color="#6B7280" />
          <Text className={`ml-1 font-medium ${getDifficultyColor(routine.difficulty)}`}>
            {routine.difficulty}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <FontAwesome5 name="dumbbell" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-1">{routine.routine_exercises.length} ejercicios</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGeneralTab = () => (
    <View className="p-4">
      {/* Dificultad */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Dificultad</Text>
        <View className="flex-row justify-between">
          {[
            { key: 'decrease', label: 'Más fácil', icon: 'arrow-down' },
            { key: 'maintain', label: 'Mantener', icon: 'minus' },
            { key: 'increase', label: 'Más difícil', icon: 'arrow-up' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleDifficultyChange(option.key as any)}
              className={`flex-1 mx-1 p-3 rounded-lg border-2 items-center ${
                modifications.difficulty[option.key as keyof typeof modifications.difficulty]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <FontAwesome5 
                name={option.icon as any} 
                size={20} 
                color={modifications.difficulty[option.key as keyof typeof modifications.difficulty] ? "#3B82F6" : "#6B7280"} 
              />
              <Text className={`mt-2 text-center ${
                modifications.difficulty[option.key as keyof typeof modifications.difficulty] ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Duración */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Duración</Text>
        <View className="flex-row justify-between">
          {[
            { key: 'shorter', label: 'Más corta', icon: 'compress-alt' },
            { key: 'maintain', label: 'Mantener', icon: 'minus' },
            { key: 'longer', label: 'Más larga', icon: 'expand-alt' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleDurationChange(option.key as any)}
              className={`flex-1 mx-1 p-3 rounded-lg border-2 items-center ${
                modifications.duration[option.key as keyof typeof modifications.duration]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <FontAwesome5 
                name={option.icon as any} 
                size={20} 
                color={modifications.duration[option.key as keyof typeof modifications.duration] ? "#3B82F6" : "#6B7280"} 
              />
              <Text className={`mt-2 text-center ${
                modifications.duration[option.key as keyof typeof modifications.duration] ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Enfoque */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Enfoque</Text>
        <View className="flex-row flex-wrap">
          {[
            { key: 'strength', label: 'Fuerza', icon: 'dumbbell' },
            { key: 'endurance', label: 'Resistencia', icon: 'running' },
            { key: 'hypertrophy', label: 'Hipertrofia', icon: 'muscle' },
            { key: 'cardio', label: 'Cardio', icon: 'heartbeat' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleFocusChange(option.key, !modifications.focus[option.key as keyof typeof modifications.focus])}
              className={`w-1/2 p-3 mb-2 ${option.key === 'strength' || option.key === 'endurance' ? 'pr-1' : 'pl-1'}`}
            >
              <View className={`p-3 rounded-lg border-2 items-center ${
                modifications.focus[option.key as keyof typeof modifications.focus]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}>
                <FontAwesome5 
                  name={option.icon as any} 
                  size={20} 
                  color={modifications.focus[option.key as keyof typeof modifications.focus] ? "#3B82F6" : "#6B7280"} 
                />
                <Text className={`mt-2 text-center ${
                  modifications.focus[option.key as keyof typeof modifications.focus] ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {option.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderExercisesTab = () => (
    <View className="p-4">
      {/* Agregar más ejercicios para */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Agregar más ejercicios para:</Text>
        <View className="flex-row flex-wrap">
          {MUSCLE_GROUPS.map((muscleGroup) => (
            <TouchableOpacity
              key={muscleGroup}
              onPress={() => handleMuscleGroupChange('addMoreFor', muscleGroup)}
              className={`m-1 px-3 py-2 rounded-full border-2 ${
                modifications.exercises.addMoreFor.includes(muscleGroup)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className={`${
                modifications.exercises.addMoreFor.includes(muscleGroup) 
                  ? 'text-green-600 font-medium' 
                  : 'text-gray-600'
              }`}>
                {muscleGroup}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quitar ejercicios de */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Quitar ejercicios de:</Text>
        <View className="flex-row flex-wrap">
          {MUSCLE_GROUPS.map((muscleGroup) => (
            <TouchableOpacity
              key={muscleGroup}
              onPress={() => handleMuscleGroupChange('removeBodyParts', muscleGroup)}
              className={`m-1 px-3 py-2 rounded-full border-2 ${
                modifications.exercises.removeBodyParts.includes(muscleGroup)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className={`${
                modifications.exercises.removeBodyParts.includes(muscleGroup) 
                  ? 'text-red-600 font-medium' 
                  : 'text-gray-600'
              }`}>
                {muscleGroup}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Volumen */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Series y Repeticiones</Text>
        <View className="flex-row justify-between mb-3">
          {[
            { key: 'moreSets', label: 'Más series', icon: 'plus' },
            { key: 'maintain', label: 'Mantener', icon: 'minus' },
            { key: 'fewerSets', label: 'Menos series', icon: 'minus' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleVolumeChange(option.key as any)}
              className={`flex-1 mx-1 p-3 rounded-lg border-2 items-center ${
                modifications.volume[option.key as keyof typeof modifications.volume]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <FontAwesome5 
                name={option.icon as any} 
                size={16} 
                color={modifications.volume[option.key as keyof typeof modifications.volume] ? "#3B82F6" : "#6B7280"} 
              />
              <Text className={`mt-1 text-center text-sm ${
                modifications.volume[option.key as keyof typeof modifications.volume] ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View className="flex-row justify-between">
          {[
            { key: 'moreReps', label: 'Más reps', icon: 'plus' },
            { key: 'maintain', label: 'Mantener', icon: 'minus' },
            { key: 'fewerReps', label: 'Menos reps', icon: 'minus' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleVolumeChange(option.key as any)}
              className={`flex-1 mx-1 p-3 rounded-lg border-2 items-center ${
                modifications.volume[option.key as keyof typeof modifications.volume]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <FontAwesome5 
                name={option.icon as any} 
                size={16} 
                color={modifications.volume[option.key as keyof typeof modifications.volume] ? "#3B82F6" : "#6B7280"} 
              />
              <Text className={`mt-1 text-center text-sm ${
                modifications.volume[option.key as keyof typeof modifications.volume] ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Descansos */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Tiempo de descanso</Text>
        <View className="flex-row justify-between">
          {[
            { key: 'shorter', label: 'Más cortos', icon: 'compress-alt' },
            { key: 'maintain', label: 'Mantener', icon: 'minus' },
            { key: 'longer', label: 'Más largos', icon: 'expand-alt' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleRestTimeChange(option.key as any)}
              className={`flex-1 mx-1 p-3 rounded-lg border-2 items-center ${
                modifications.restTime[option.key as keyof typeof modifications.restTime]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <FontAwesome5 
                name={option.icon as any} 
                size={20} 
                color={modifications.restTime[option.key as keyof typeof modifications.restTime] ? "#3B82F6" : "#6B7280"} 
              />
              <Text className={`mt-2 text-center ${
                modifications.restTime[option.key as keyof typeof modifications.restTime] ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Instrucciones específicas */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Instrucciones específicas</Text>
        <TextInput
          value={modifications.specificInstructions}
          onChangeText={(text: string) => {
            const newRequest: RoutineModificationRequest = {
              ...modifications,
              specificInstructions: text
            };
            setModifications(newRequest);
          }}
          placeholder="Ej: Evitar ejercicios de rodillas por lesión, más ejercicios unilaterales..."
          multiline
          numberOfLines={4}
          className="p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-800"
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="Modificar Rutinas IA" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Cargando rutinas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="Modificar Rutinas IA" />
      
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Selección de rutina */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Selecciona una rutina para modificar
          </Text>
          
          {availableRoutines.length === 0 ? (
            <View className="p-8 items-center">
              <FontAwesome5 name="robot" size={48} color="#9CA3AF" />
              <Text className="text-gray-600 text-center mt-4">
                No tienes rutinas generadas por IA disponibles
              </Text>
            </View>
          ) : (
            availableRoutines.map(renderRoutineCard)
          )}
        </View>

        {/* Opciones de modificación */}
        {selectedRoutine && (
          <View className="bg-white mt-4">
            {/* Tabs */}
            <View className="flex-row border-b border-gray-200">
              <TouchableOpacity
                onPress={() => setActiveTab('general')}
                className={`flex-1 py-4 items-center border-b-2 ${
                  activeTab === 'general' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Text className={`font-medium ${
                  activeTab === 'general' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Ajustes Generales
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('exercises')}
                className={`flex-1 py-4 items-center border-b-2 ${
                  activeTab === 'exercises' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Text className={`font-medium ${
                  activeTab === 'exercises' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Ejercicios y Volumen
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenido de tabs */}
            {activeTab === 'general' ? renderGeneralTab() : renderExercisesTab()}
          </View>
        )}
      </ScrollView>

      {/* Botón de envío */}
      {selectedRoutine && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSubmitModification}
            disabled={submitting}
            className={`py-4 rounded-lg items-center ${
              submitting ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            {submitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Modificando rutina...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Modificar Rutina</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RoutineModificationScreen;
