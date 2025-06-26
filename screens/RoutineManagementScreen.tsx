import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineService, { Routine } from "../services/routineService";

// Define simple props interface
type Props = {
  navigation: any;
  route: any;
};

const RoutineManagementScreen: React.FC<Props> = ({ navigation, route }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [routinesInUse, setRoutinesInUse] = useState<Record<number, boolean>>({});

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await routineService.getRoutines();
      setRoutines(data);
      
      // Verificar cuáles rutinas están en uso
      const inUseMap: Record<number, boolean> = {};
      for (const routine of data) {
        inUseMap[routine.id] = await routineService.isRoutineInUse(routine.id);
      }
      setRoutinesInUse(inUseMap);
      
    } catch (error) {
      console.error("Error al cargar rutinas:", error);
      AppAlert.error("Error", "Error al cargar rutinas");
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

  // Función para eliminar una rutina
  const handleDeleteRoutine = (routine: Routine) => {
    // Verificar si la rutina está en uso antes de permitir su eliminación
    if (routinesInUse[routine.id]) {
      AppAlert.error(
        "No se puede eliminar", 
        "Esta rutina está siendo utilizada en un entrenamiento activo. Finaliza el entrenamiento antes de eliminarla."
      );
      return;
    }
    
    AppAlert.confirm(
      "Eliminar rutina",
      `¿Estás seguro de que deseas eliminar la rutina "${routine.name}"?`,
      async () => {
        try {
          await routineService.deleteRoutine(routine.id);
          AppAlert.success("Éxito", "Rutina eliminada correctamente");
          loadRoutines(); // Recargar la lista de rutinas
        } catch (error) {
          console.error("Error al eliminar rutina:", error);
          AppAlert.error("Error", "No se pudo eliminar la rutina");
        }
      }
    );
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
      case "principiante":
        return "#4CAF50"; // Verde
      case "intermediate":
      case "intermedio":
        return "#FF9800"; // Naranja
      case "advanced":
      case "avanzado":
        return "#F44336"; // Rojo
      default:
        return "#2196F3"; // Azul
    }
  };
  
  // Traducir nivel de dificultad
  const translateDifficulty = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return difficulty;
    }
  };

  const getExerciseCount = (routine: Routine): number => {
    return routine.routine_exercises.length;
  };

  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <View style={styles.routineItem}>
      {/* Indicador de rutina en uso */}
      {routinesInUse[item.id] && (
        <View style={styles.inUseIndicator}>
          <Text style={styles.inUseText}>En uso</Text>
        </View>
      )}
      {/* Información de la rutina */}
      <View style={styles.routineContent}>
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
            Creada: {item.formatted_created_at.split(" ")[0]}
          </Text>
        </View>
      </View>

      {/* Botones de acción para cada rutina */}
      <View style={styles.routineActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: "#4F46E5" }]}
          onPress={() => navigation.navigate("WorkoutTracker", { routineId: item.id })}
        >
          <FontAwesome5 name="play" size={16} color="white" />
        </TouchableOpacity>
        
        {/* Botón de edición: desactivado si la rutina está en uso */}
        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: routinesInUse[item.id] ? "#9CA3AF" : "#059669" 
          }]}
          onPress={() => {
            if (routinesInUse[item.id]) {
              AppAlert.info(
                "No se puede editar", 
                "Esta rutina está siendo utilizada en un entrenamiento activo. Finaliza el entrenamiento antes de editarla."
              );
              return;
            }
            navigation.navigate("RoutineEdit", { routineId: item.id });
          }}
        >
          <AntDesign name="edit" size={16} color="white" />
        </TouchableOpacity>
        
        {/* Botón de eliminación: desactivado si la rutina está en uso */}
        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: routinesInUse[item.id] ? "#9CA3AF" : "#DC2626" 
          }]}
          onPress={() => handleDeleteRoutine(item)}
        >
          <AntDesign name="delete" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenHeader
        title="Gestión de Rutinas"
        onBack={() => navigation.goBack()}
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
                
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate("RoutineCreate")}
                >
                  <Text style={styles.createButtonText}>Crear rutina</Text>
                  <AntDesign name="plus" size={20} color="white" />
                </TouchableOpacity>
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

            {/* Botones flotantes */}
            <View style={styles.floatingButtonsContainer}>
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
            
            {/* Botón para iniciar entrenamiento */}
            <TouchableOpacity
              style={styles.startWorkoutButton}
              onPress={() => navigation.navigate("RoutineList", { startWorkout: true })}
            >
              <Text style={styles.startWorkoutText}>Ir a Iniciar Entrenamiento</Text>
              <FontAwesome5 name="play-circle" size={18} color="white" />
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 20,
    color: "#666",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0066CC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    marginTop: 16,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    marginRight: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  routineItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
  },
  routineContent: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  routineActions: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  routineDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  routineStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  floatingButtonsContainer: {
    position: "absolute",
    right: 16,
    bottom: 80,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startWorkoutButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#10B981",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startWorkoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  inUseIndicator: {
    position: 'absolute',
    top: 8,
    right: 80,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  inUseText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RoutineManagementScreen;
