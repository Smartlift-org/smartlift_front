import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineService, { Routine, RoutineExercise, RoutineFormData } from "../services/routineService";
import { RootStackParamList } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineEdit">;
  route: {
    params: {
      routineId: number;
    };
  };
};

const RoutineEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { routineId } = route.params;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [formData, setFormData] = useState<RoutineFormData>({
    name: "",
    description: "",
    difficulty: "beginner",
    duration: 0,
    routine_exercises_attributes: [],
  });

  // Cargar datos de la rutina
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        const data = await routineService.getRoutine(routineId);
        setRoutine(data);
        
        // Inicializar el formulario con los datos de la rutina
        setFormData({
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          duration: data.duration,
          routine_exercises_attributes: data.routine_exercises.map(exercise => ({
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_time: exercise.rest_time,
            order: exercise.order,
          })),
        });
      } catch (error) {
        console.error("Error al cargar la rutina:", error);
        AppAlert.error("Error", "No se pudo cargar la rutina");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId]);

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    // Validar formulario
    if (!formData.name.trim()) {
      AppAlert.error("Error", "Debes proporcionar un nombre para la rutina");
      return;
    }

    if (!formData.description.trim()) {
      AppAlert.error("Error", "Debes proporcionar una descripción para la rutina");
      return;
    }

    if (!formData.routine_exercises_attributes || formData.routine_exercises_attributes.length === 0) {
      AppAlert.error("Error", "La rutina debe tener al menos un ejercicio");
      return;
    }

    try {
      setSaving(true);
      await routineService.updateRoutine(routineId, formData);
      AppAlert.success("Éxito", "Rutina actualizada correctamente");
      navigation.navigate("RoutineManagement", { refresh: true });
    } catch (error) {
      console.error("Error al actualizar la rutina:", error);
      AppAlert.error("Error", "No se pudo actualizar la rutina");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExercise = async (exerciseId: number, index: number) => {
    try {
      // Actualizar localmente primero para UI responsiva
      const updatedExercises = formData.routine_exercises_attributes ? 
        [...formData.routine_exercises_attributes] : [];
      updatedExercises.splice(index, 1);
      
      // Actualizar orden de los ejercicios restantes
      updatedExercises.forEach((ex, idx) => {
        ex.order = idx + 1;
      });
      
      setFormData({
        ...formData,
        routine_exercises_attributes: updatedExercises,
      });
      
      // Intentar eliminar en el backend solo si es un ejercicio existente
      // Si es un ejercicio recién añadido, no tendrá ID en la base de datos
      if (routine && routine.routine_exercises[index]?.id) {
        await routineService.removeExerciseFromRoutine(routineId, routine.routine_exercises[index].id);
      }
    } catch (error) {
      console.error("Error al eliminar ejercicio:", error);
      AppAlert.error("Error", "No se pudo eliminar el ejercicio");
      // Si falla la eliminación, recargar la rutina
      navigation.replace("RoutineEdit", { routineId });
    }
  };

  const handleAddExercises = () => {
    // Guardamos primero los cambios básicos de la rutina
    routineService.updateRoutine(routineId, {
      name: formData.name,
      description: formData.description,
      difficulty: formData.difficulty,
      duration: formData.duration,
    })
    .then(() => {
      // Navegamos a la pantalla de selección de ejercicios
      navigation.navigate("ExerciseSelect", {
        routineData: {
          name: formData.name,
          description: formData.description,
          difficulty: formData.difficulty,
          duration: formData.duration
        }
      });
    })
    .catch(error => {
      console.error("Error al guardar cambios básicos:", error);
      AppAlert.error("Error", "No se pudieron guardar los cambios de la rutina");
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Editando Rutina" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Cargando rutina...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Editando Rutina" onBack={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre de la Rutina</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value: string) => handleChange("name", value)}
            placeholder="Ej. Rutina de Fuerza"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value: string) => handleChange("description", value)}
            placeholder="Describe brevemente esta rutina"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dificultad</Text>
          <View style={styles.difficultySelector}>
            {["beginner", "intermediate", "advanced"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyOption,
                  formData.difficulty === level && styles.selectedDifficulty,
                ]}
                onPress={() => handleChange("difficulty", level)}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    formData.difficulty === level && styles.selectedDifficultyText,
                  ]}
                >
                  {level === "beginner"
                    ? "Principiante"
                    : level === "intermediate"
                    ? "Intermedio"
                    : "Avanzado"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Duración Aproximada (minutos)</Text>
          <TextInput
            style={styles.input}
            value={formData.duration.toString()}
            onChangeText={(value: string) => {
              const parsed = parseInt(value) || 0;
              handleChange("duration", parsed);
            }}
            keyboardType="number-pad"
            placeholder="Ej. 45"
          />
        </View>

        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={handleAddExercises}
            >
              <AntDesign name="plus" size={18} color="white" />
              <Text style={styles.addExerciseText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {!formData.routine_exercises_attributes || formData.routine_exercises_attributes.length === 0 ? (
            <View style={styles.emptyExercises}>
              <FontAwesome5 name="dumbbell" size={40} color="#ddd" />
              <Text style={styles.emptyText}>
                No hay ejercicios en esta rutina
              </Text>
              <Text style={styles.emptySubtext}>
                Agrega ejercicios para completar tu rutina
              </Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {formData.routine_exercises_attributes && formData.routine_exercises_attributes.map((ex, index) => {
                // Buscar el ejercicio completo en la rutina original
                const exerciseData = routine?.routine_exercises.find(
                  (e) => e.exercise_id === ex.exercise_id
                );
                if (!exerciseData) return null;

                return (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>
                        {exerciseData.exercise.name}
                      </Text>
                      <Text style={styles.exerciseDetails}>
                        {ex.sets} series × {ex.reps} reps • {ex.rest_time}s descanso
                      </Text>
                      <View style={styles.exerciseTags}>
                        <View style={styles.exerciseTag}>
                          <Text style={styles.tagText}>
                            {exerciseData.exercise.category}
                          </Text>
                        </View>
                        {exerciseData.exercise.equipment && (
                          <View style={styles.exerciseTag}>
                            <Text style={styles.tagText}>
                              {exerciseData.exercise.equipment}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeExerciseButton}
                      onPress={() => handleRemoveExercise(ex.exercise_id, index)}
                    >
                      <MaterialIcons name="delete" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              <AntDesign name="save" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  difficultySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedDifficulty: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  difficultyText: {
    fontWeight: "500",
    color: "#666",
  },
  selectedDifficultyText: {
    color: "white",
  },
  exercisesSection: {
    marginTop: 16,
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addExerciseButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  addExerciseText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyExercises: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ddd",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#999",
    textAlign: "center",
  },
  exercisesList: {
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: "row",
  },
  exerciseTag: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  removeExerciseButton: {
    justifyContent: "center",
    paddingLeft: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#0066CC",
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A3CFFF",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default RoutineEditScreen;
