import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import routineService from '../services/routineService';
import workoutService from '../services/workoutService';
import { RootStackParamList } from '../types';
import { Routine } from '../types/routine';
import AppAlert from '../components/AppAlert';

type RoutineSelectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineSelect">;
  route: { 
    params?: { 
      fromActiveWorkouts?: boolean 
    } 
  };
};

const RoutineSelectScreen: React.FC<RoutineSelectScreenProps> = ({ navigation, route }) => {
  const { fromActiveWorkouts = false } = route.params || {};
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startingWorkout, setStartingWorkout] = useState<boolean>(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const data = await routineService.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error("Error al cargar rutinas:", error);
      AppAlert.error("Error", "No se pudieron cargar las rutinas. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (routineId: number) => {
    setSelectedRoutineId(routineId);
    setStartingWorkout(true);
    
    try {
      const workout = await workoutService.createWorkout({ routine_id: routineId });
      setStartingWorkout(false);
      
      AppAlert.success(
        "¡Entrenamiento iniciado!", 
        "Tu entrenamiento ha sido iniciado. ¡A ejercitarse!"
      );
      
      // Navegar a la pantalla de entrenamiento en progreso
      navigation.navigate("WorkoutInProgress", { workoutId: workout.id });
    } catch (error) {
      console.error("Error al iniciar entrenamiento:", error);
      AppAlert.error("Error", "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.");
      setStartingWorkout(false);
    }
  };

  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <TouchableOpacity 
      className="bg-white mb-4 rounded-lg overflow-hidden shadow-sm"
      onPress={() => handleStartWorkout(item.id)}
      disabled={startingWorkout && selectedRoutineId === item.id}
    >
      {/* Imagen o placeholder */}
      {item.image_url ? (
        <Image 
          source={{ uri: item.image_url }} 
          className="w-full h-32"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 bg-gray-200 justify-center items-center">
          <MaterialCommunityIcons name="dumbbell" size={40} color="#666" />
        </View>
      )}
      
      {/* Info de rutina */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        
        <View className="flex-row flex-wrap mt-1">
          <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
            <Text className="text-xs text-gray-700">
              {item.difficulty === 'beginner' ? 'Principiante' : 
               item.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
            </Text>
          </View>
          
          <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
            <Text className="text-xs text-gray-700">{item.duration} min</Text>
          </View>
          
          <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
            <Text className="text-xs text-gray-700">
              {item.exercises ? item.exercises.length : 0} ejercicios
            </Text>
          </View>
        </View>
        
        <Text className="text-gray-600 mt-2" numberOfLines={2}>
          {item.description}
        </Text>
        
        {/* Botón para iniciar entrenamiento */}
        <TouchableOpacity
          className="mt-3 bg-indigo-600 rounded-lg py-2 px-4 shadow-sm"
          onPress={() => handleStartWorkout(item.id)}
          disabled={startingWorkout && selectedRoutineId === item.id}
        >
          {(startingWorkout && selectedRoutineId === item.id) ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-white text-center font-semibold">Iniciar entrenamiento</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => {
              if (fromActiveWorkouts) {
                navigation.navigate("ActiveWorkouts");
              } else {
                navigation.goBack();
              }
            }}
            className="w-10"
          >
            <AntDesign name="arrowleft" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-center flex-1">Elegir Rutina</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="mt-4 text-gray-600">Cargando rutinas...</Text>
          </View>
        ) : routines.length > 0 ? (
          <FlatList
            data={routines}
            keyExtractor={(item: Routine) => item.id.toString()}
            renderItem={renderRoutineItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-6">
            <MaterialCommunityIcons name="dumbbell" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
              No tienes rutinas disponibles
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Crea una rutina primero para poder iniciar un entrenamiento
            </Text>
            <TouchableOpacity
              className="mt-6 bg-indigo-600 rounded-lg py-3 px-6"
              onPress={() => navigation.navigate("RoutineCreate")}
            >
              <Text className="text-white font-semibold">Crear rutina</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoutineSelectScreen;
