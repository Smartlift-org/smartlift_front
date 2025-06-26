import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Using basic types to avoid React Navigation import issues
import { RootStackParamList } from "../types";
import routineService, { Routine } from "../services/routineService";
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";

// Define simple props interface to avoid ESM/CommonJS compatibility issues
type Props = {
  navigation: any; // Using any for navigation to avoid compatibility issues
  route: any;
};

const RoutineListScreen: React.FC<Props> = ({ navigation, route }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await routineService.getRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Error al cargar rutinas:', error);
      AppAlert.error('Error', 'Error al cargar rutinas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutines();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  // Efecto adicional para actualizar cuando volvamos de la pantalla de creación
  useEffect(() => {
    if (route.params?.refresh) {
      loadRoutines();
    }
  }, [route.params?.refresh]);

  // Mostrar mensaje si estamos iniciando un workout
  useEffect(() => {
    if (route.params?.startWorkout) {
      AppAlert.info(
        "Iniciar entrenamiento", 
        "Selecciona una rutina para comenzar tu entrenamiento", 
        [{ text: "Entendido", style: "default" }]
      );
    }
  }, [route.params?.startWorkout]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'principiante':
        return '#4CAF50'; // Verde
      case 'intermediate':
      case 'intermedio':
        return '#FF9800'; // Naranja
      case 'advanced':
      case 'avanzado':
        return '#F44336'; // Rojo
      default:
        return '#2196F3'; // Azul
    }
  };
  
  // Traducir nivel de dificultad
  const translateDifficulty = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const getExerciseCount = (routine: Routine): number => {
    return routine.routine_exercises.length;
  };

  // Explicitly type the renderItem function parameter to fix TypeScript error
  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <TouchableOpacity
      style={styles.routineItem}
      onPress={() => navigation.navigate("WorkoutTracker", { routineId: item.id })}
    >
      <View style={styles.routineHeader}>
        <Text style={styles.routineName}>{item.name}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{translateDifficulty(item.difficulty)}</Text>
        </View>
      </View>

      <Text style={styles.routineDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.routineStats}>
        <View style={styles.statItem}>
          <FontAwesome5 name="dumbbell" size={14} color="#666" />
          <Text style={styles.statText}>{getExerciseCount(item)} ejercicios</Text>
        </View>
        <View style={styles.statItem}>
          <AntDesign name="clockcircle" size={14} color="#666" />
          <Text style={styles.statText}>{item.duration} min</Text>
        </View>
        <Text style={styles.statText}>
          Creada: {item.formatted_created_at.split(' ')[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenHeader
        title="Tus Rutinas"
        onBack={() => {
          // Usar reset para limpiar la pila de navegación y evitar volver atrás a la pantalla de creación
          navigation.reset({
            index: 0,
            routes: [{ name: "UserHome" }]
          });
        }}
      />
      
      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </View>
      ) : (
        <>
          {routines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="dumbbell" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No se encontraron rutinas</Text>
              <Text style={styles.emptySubText}>Crea una rutina para comenzar</Text>
            </View>
          ) : (
            <FlatList
              data={routines}
              renderItem={renderRoutineItem}
              keyExtractor={(item: Routine) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#0066CC"]}
                />
              }
            />
          )}

          <TouchableOpacity
            style={styles.workoutHistoryButton}
            onPress={() => navigation.navigate("WorkoutStats")}
          >
            <Text style={styles.workoutHistoryText}>Ver Historial de Entrenamientos</Text>
            <FontAwesome5 name="history" size={16} color="#0066CC" />
          </TouchableOpacity>

          {/* Botones flotantes */}
          <View style={{ position: "absolute", right: 16, bottom: 80 }}>
            {/* Botón para generar rutinas con IA */}
            <TouchableOpacity
              style={[styles.floatingButton, { backgroundColor: "#5046e5", marginBottom: 12 }]}
              onPress={() => navigation.navigate("AIRoutineGenerator")}
            >
              <FontAwesome5 name="magic" size={20} color="white" />
            </TouchableOpacity>
            
            {/* Botón para añadir nueva rutina manualmente */}
            <TouchableOpacity
              style={[styles.floatingButton, { backgroundColor: "#0066CC" }]}
              onPress={() => navigation.navigate("RoutineCreate")}
            >
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 80,
  },
  routineItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  routineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  workoutHistoryButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHistoryText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default RoutineListScreen;
