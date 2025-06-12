import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
// Using basic types to avoid React Navigation import issues
import { RootStackParamList } from '../types';
import routineService, { Routine, WorkoutSet, WorkoutExercise, WorkoutSession } from '../services/routineService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

// Define simple props interface to avoid module compatibility issues
type Props = {
  navigation: any; // Using any for navigation to avoid ESM/CommonJS compatibility issues
  route: {
    params: {
      routineId: number;
    };
  };
};

const WorkoutTrackerScreen: React.FC<Props> = ({ navigation, route }) => {
  const routineId = route.params?.routineId;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        if (routineId) {
          const routineData = await routineService.getRoutine(routineId);
          setRoutine(routineData);
          
          // Initialize workout exercises from routine
          const exercises: WorkoutExercise[] = routineData.routine_exercises.map(re => ({
            routine_exercise_id: re.id,
            exercise: re.exercise,
            planned_sets: re.sets,
            planned_reps: re.reps,
            sets: Array.from({ length: re.sets }).map((_, idx) => ({
              set_number: idx + 1,
              weight: 0,
              reps: re.reps,
              completed: false
            }))
          }));
          
          setWorkoutExercises(exercises);
        } else {
          // Handle case when no routine is selected
          Alert.alert('Error', 'No se ha seleccionado una rutina');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', 'Error al cargar la rutina');
        console.error('Error al cargar la rutina:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId]);

  // Update a specific field in a workout set
  const updateSetDetails = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: number | boolean) => {
    // Use direct state update instead of functional update to avoid TypeScript errors
    const updatedExercises = [...workoutExercises];
    const updatedSets = [...updatedExercises[exerciseIndex].sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    updatedExercises[exerciseIndex] = { ...updatedExercises[exerciseIndex], sets: updatedSets };
    setWorkoutExercises(updatedExercises);
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const currentValue = workoutExercises[exerciseIndex].sets[setIndex].completed;
    updateSetDetails(exerciseIndex, setIndex, 'completed', !currentValue);
  };

  const saveWorkout = async () => {
    if (!routine) return;
    
    try {
      setSaving(true);
      const today = new Date();
      const workoutSession: WorkoutSession = {
        routine_id: routine.id,
        routine_name: routine.name,
        date: today.toISOString(),
        exercises: workoutExercises,
        notes: notes
      };
      
      // Store workout history in AsyncStorage until we have a backend endpoint
      const existingHistoryString = await AsyncStorage.getItem('@workout_history');
      let workoutHistory: WorkoutSession[] = [];
      
      if (existingHistoryString) {
        workoutHistory = JSON.parse(existingHistoryString);
      }
      
      workoutHistory.push(workoutSession);
      await AsyncStorage.setItem('@workout_history', JSON.stringify(workoutHistory));
      
      Alert.alert(
        'Éxito',
        '¡Entrenamiento registrado exitosamente!',
        [
          { text: 'Aceptar', onPress: () => navigation.navigate('RoutineList') }
        ]
      );
    } catch (error) {
      console.error('Error al guardar el entrenamiento:', error);
      Alert.alert('Error', 'Error al guardar el entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const renderSets = (exerciseIndex: number) => {
    const exercise = workoutExercises[exerciseIndex];
    
    return (
      <View style={styles.setsContainer}>
        <View style={styles.setsHeader}>
          <Text style={styles.headerText}>Serie</Text>
          <Text style={styles.headerText}>Peso</Text>
          <Text style={styles.headerText}>Reps</Text>
          <Text style={styles.headerText}>Hecho</Text>
        </View>
        
        {exercise.sets.map((set, setIndex) => (
          <View key={`set-${setIndex}`} style={styles.setRow}>
            <Text style={styles.setText}>{set.set_number}</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={set.weight.toString()}
                onChangeText={(text: string) => {
                  const value = text ? parseInt(text) : 0;
                  updateSetDetails(exerciseIndex, setIndex, 'weight', value);
                }}
              />
              <Text style={styles.unit}>kg</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={set.reps.toString()}
                onChangeText={(text: string) => {
                  const value = text ? parseInt(text) : 0;
                  updateSetDetails(exerciseIndex, setIndex, 'reps', value);
                }}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.checkBox,
                set.completed && styles.checkBoxChecked
              ]}
              onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
            >
              {set.completed && (
                <AntDesign name="check" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderExerciseSelector = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseTabs}>
        {workoutExercises.map((exercise, index) => (
          <TouchableOpacity
            key={`exercise-tab-${index}`}
            style={[
              styles.exerciseTab,
              activeExerciseIndex === index && styles.activeExerciseTab
            ]}
            onPress={() => setActiveExerciseIndex(index)}
          >
            <Text 
              style={[
                styles.exerciseTabText,
                activeExerciseIndex === index && styles.activeExerciseTabText
              ]}
              numberOfLines={1}
            >
              {exercise.exercise.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando rutina...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      {routine && (
        <>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <AntDesign name="arrowleft" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.header}>
            <Text style={styles.routineTitle}>{routine.name}</Text>
            <Text style={styles.routineDescription}>{routine.difficulty} • {routine.duration} min</Text>
          </View>
          </View>
          
          {renderExerciseSelector()}
          
          {workoutExercises.length > 0 && activeExerciseIndex < workoutExercises.length && (
            <View style={styles.exerciseContainer}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{workoutExercises[activeExerciseIndex].exercise.name}</Text>
                <Text style={styles.exerciseDetail}>
                  {workoutExercises[activeExerciseIndex].exercise.primary_muscles.join(', ')} • 
                  {workoutExercises[activeExerciseIndex].exercise.equipment}
                </Text>
              </View>
              
              {renderSets(activeExerciseIndex)}
            </View>
          )}
          
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notas del entrenamiento:</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              placeholder="Agregar notas sobre tu entrenamiento (opcional)"
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.finishButton}
              onPress={saveWorkout}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.finishButtonText}>Guardar Entrenamiento</Text>
                  <MaterialIcons name="save" size={20} color="white" />
                </>
              )}
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
    backgroundColor: '#f8f9fa',
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: 0,
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  header: {
    flex: 1,
    marginBottom: 10,
  },
  routineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  routineDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  exerciseTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    maxHeight: 50,
    marginTop: 8,
  },
  exerciseTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
    minWidth: 100,
    alignItems: 'center',
  },
  activeExerciseTab: {
    backgroundColor: '#0066CC',
  },
  exerciseTabText: {
    fontWeight: '500',
    color: '#333',
  },
  activeExerciseTabText: {
    color: 'white',
  },
  exerciseContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  exerciseHeader: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  setsContainer: {
    width: '100%',
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#666',
    width: 60,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setText: {
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 16,
    width: 45,
    textAlign: 'center',
  },
  unit: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0066CC',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#0066CC',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  finishButton: {
    backgroundColor: '#0066CC',
    borderRadius: 25,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default WorkoutTrackerScreen;
