import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import workoutService from '../services/workoutService';
import { RootStackParamList } from '../types';
import { Workout } from '../types/workout';
import AppAlert from '../components/AppAlert';

type WorkoutInProgressScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutInProgress">;
  route: { params: { workoutId: number } };
};

const WorkoutInProgressScreen: React.FC<WorkoutInProgressScreenProps> = ({ navigation, route }) => {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    setLoading(true);
    try {
      const data = await workoutService.getWorkout(workoutId);
      setWorkout(data);
      // Determinar cuál es el ejercicio actual basado en el progreso
      // Por simplicidad, solo usamos el índice por ahora
    } catch (error) {
      console.error(`Error al cargar entrenamiento ID ${workoutId}:`, error);
      AppAlert.error("Error", "No se pudo cargar el entrenamiento. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseWorkout = async () => {
    if (!workout) return;
    
    setUpdating(true);
    try {
      await workoutService.pauseWorkout(workout.id);
      AppAlert.info(
        "Entrenamiento pausado", 
        "Tu entrenamiento ha sido pausado. Puedes continuarlo más tarde desde la pantalla de entrenamientos activos."
      );
      navigation.navigate("Home");
    } catch (error) {
      console.error(`Error al pausar entrenamiento ${workout.id}:`, error);
      AppAlert.error("Error", "No se pudo pausar el entrenamiento. Inténtalo de nuevo.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!workout) return;
    
    Alert.alert(
      "Completar entrenamiento",
      "¿Estás seguro de que quieres completar este entrenamiento?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Completar",
          onPress: async () => {
            setUpdating(true);
            try {
              await workoutService.completeWorkout(workout.id);
              AppAlert.success(
                "¡Entrenamiento completado!", 
                "Tu entrenamiento ha sido marcado como completado."
              );
              navigation.navigate("Home");
            } catch (error) {
              console.error(`Error al completar entrenamiento ${workout.id}:`, error);
              AppAlert.error("Error", "No se pudo completar el entrenamiento. Inténtalo de nuevo.");
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">Cargando entrenamiento...</Text>
      </SafeAreaView>
    );
  }

  if (!workout || !workout.routine || !workout.routine.exercises || workout.routine.exercises.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1 justify-center items-center p-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#d1d5db" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            No se pudo cargar el entrenamiento o esta rutina no tiene ejercicios
          </Text>
          <TouchableOpacity
            className="mt-6 bg-indigo-600 rounded-lg py-3 px-6"
            onPress={() => navigation.navigate("ActiveWorkouts")}
          >
            <Text className="text-white font-semibold">Volver a entrenamientos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Obtener el ejercicio actual basado en el índice
  const currentExercise = workout.routine.exercises[currentExerciseIndex];
  const hasNextExercise = currentExerciseIndex < workout.routine.exercises.length - 1;
  const hasPreviousExercise = currentExerciseIndex > 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                "¿Quieres salir?",
                "Si sales, tu progreso se guardará y podrás continuar más tarde.",
                [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  {
                    text: "Salir y guardar",
                    onPress: handlePauseWorkout
                  }
                ]
              );
            }}
            className="w-10"
          >
            <AntDesign name="arrowleft" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-center flex-1">Entrenamiento</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Información de la rutina */}
      <View className="bg-indigo-50 p-4">
        <Text className="text-lg font-bold text-indigo-800">{workout.routine.name}</Text>
        <View className="flex-row mt-1">
          <Text className="text-sm text-indigo-600">
            Ejercicio {currentExerciseIndex + 1} de {workout.routine.exercises.length}
          </Text>
        </View>
      </View>

      {/* Ejercicio actual */}
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4">
          <Text className="text-lg font-bold text-gray-800">
            {currentExercise.exercise?.name || `Ejercicio ${currentExerciseIndex + 1}`}
          </Text>

          <View className="flex-row mt-4 justify-around">
            <View className="items-center">
              <Text className="text-sm text-gray-600">Series</Text>
              <Text className="text-lg font-bold text-indigo-700">{currentExercise.sets}</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-sm text-gray-600">Repeticiones</Text>
              <Text className="text-lg font-bold text-indigo-700">{currentExercise.reps}</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-sm text-gray-600">Descanso</Text>
              <Text className="text-lg font-bold text-indigo-700">{currentExercise.rest_time}s</Text>
            </View>
          </View>

          {/* Botones para navegar entre ejercicios */}
          <View className="flex-row justify-between mt-8">
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 rounded-lg ${hasPreviousExercise ? 'bg-gray-200' : 'bg-gray-100'}`}
              onPress={() => {
                if (hasPreviousExercise) {
                  setCurrentExerciseIndex(currentExerciseIndex - 1);
                }
              }}
              disabled={!hasPreviousExercise}
            >
              <Ionicons name="arrow-back" size={20} color={hasPreviousExercise ? '#4f46e5' : '#9ca3af'} />
              <Text className={`ml-2 ${hasPreviousExercise ? 'text-indigo-600' : 'text-gray-400'}`}>
                Anterior
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 rounded-lg ${hasNextExercise ? 'bg-gray-200' : 'bg-gray-100'}`}
              onPress={() => {
                if (hasNextExercise) {
                  setCurrentExerciseIndex(currentExerciseIndex + 1);
                }
              }}
              disabled={!hasNextExercise}
            >
              <Text className={`mr-2 ${hasNextExercise ? 'text-indigo-600' : 'text-gray-400'}`}>
                Siguiente
              </Text>
              <Ionicons name="arrow-forward" size={20} color={hasNextExercise ? '#4f46e5' : '#9ca3af'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Aquí iría un componente para registrar el progreso, timer, etc */}
        <View className="bg-white rounded-lg shadow-sm p-4 mt-4">
          <Text className="text-base font-semibold text-gray-800 mb-3">Registrar progreso</Text>
          
          {/* Placeholder para interfaz de registro de progreso (se implementaría más adelante) */}
          <View className="h-32 bg-gray-100 rounded-lg justify-center items-center">
            <Text className="text-gray-600">Aquí iría la interfaz de registro de series</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View className="bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-indigo-600 py-3 rounded-lg shadow-sm flex-row justify-center items-center"
          onPress={handleCompleteWorkout}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">Completar entrenamiento</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mt-3 py-3 rounded-lg border border-gray-300 flex-row justify-center items-center"
          onPress={handlePauseWorkout}
          disabled={updating}
        >
          <Ionicons name="pause" size={20} color="#6b7280" />
          <Text className="text-gray-700 font-semibold ml-2">Pausar para continuar después</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WorkoutInProgressScreen;
