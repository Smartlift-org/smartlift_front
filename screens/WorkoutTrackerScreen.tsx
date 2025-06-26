import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Modal,
  FlatList
} from 'react-native';
// Using basic types to avoid React Navigation import issues
import { RootStackParamList } from '../types';
import routineService, { Routine, WorkoutSet, WorkoutExercise, WorkoutSession } from '../services/routineService';
import { apiClient } from '../services/apiClient';
import AppAlert from '../components/AppAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Define simple props interface to avoid module compatibility issues
type Props = {
  navigation: any; // Using any for navigation to avoid ESM/CommonJS compatibility issues
  route: {
    params: {
      routineId: number;
      viewMode?: boolean; // true si solo queremos ver detalles, false/undefined para modo entrenamiento
    };
  };
};

const WorkoutTrackerScreen: React.FC<Props> = ({ navigation, route }): React.ReactElement => {
  const routineId = route.params?.routineId;
  // Determina si estamos en modo visualización (solo ver detalles) o modo entrenamiento
  const viewMode = route.params?.viewMode === true;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  // Timer and workout state variables
  const [workoutStatus, setWorkoutStatus] = useState<'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned'>('not_started');
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Total time in seconds
  const [effectiveTime, setEffectiveTime] = useState<number>(0); // Time excluding pauses
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'abandon' | 'complete' | null>(null);
  const [showPauseReasonModal, setShowPauseReasonModal] = useState<boolean>(false);
  const [pauseReason, setPauseReason] = useState<string>('');
  const [showCustomReasonInput, setShowCustomReasonInput] = useState<boolean>(false);
  
  // Opciones predefinidas para razones de pausa
  const pauseReasonOptions = [
    "Descanso",
    "Hidratación",
    "Ir al baño",
    "Atender llamada",
    "Fatiga muscular",
    "Otro"
  ];
  
  // Estados para el modal de completar entrenamiento
  const [showCompleteWorkoutModal, setShowCompleteWorkoutModal] = useState<boolean>(false);
  const [perceivedIntensity, setPerceivedIntensity] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [mood, setMood] = useState<string>('neutral');
  
  // Refs for timer
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const workoutId = useRef<number | null>(null);
  const pauseStartTime = useRef<Date | null>(null);
  // Refs para almacenar los valores actuales del temporizador
  const currentElapsedTimeRef = useRef<number>(0);
  const currentEffectiveTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        if (routineId) {
          const routineData = await routineService.getRoutine(routineId);
          // Log de diagnóstico para ver la estructura completa de los datos recibidos
          console.log('Datos de rutina recibidos:', JSON.stringify(routineData));
          console.log('Ejercicios en la rutina:', 
            routineData.routine_exercises ? 
            `${routineData.routine_exercises.length} ejercicios encontrados` : 
            'No se encontraron ejercicios');
          
          setRoutine(routineData);
          
          // Initialize workout exercises from routine
          // Verificamos que routine_exercises exista antes de intentar usar map
          const exercises: WorkoutExercise[] = routineData.routine_exercises ? routineData.routine_exercises.map(re => ({
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
          })) : [];
          
          setWorkoutExercises(exercises);
        } else {
          // Handle case when no routine is selected
          AppAlert.error('Error', 'No se ha seleccionado una rutina');
          navigation.goBack();
        }
      } catch (error) {
        AppAlert.error('Error', 'Error al cargar la rutina');
        console.error('Error al cargar la rutina:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId]);

  // Efecto para manejar el botón de retroceso del dispositivo y limpiar recursos
  useEffect(() => {
    const handleBackButton = () => {
      // Si estamos en modo visualización o no hemos iniciado entrenamiento, permitir volver
      if (viewMode || workoutStatus === 'not_started') {
        navigation.goBack();
        return true; 
      }
      // Evitar salir mientras hay un entrenamiento en progreso
      return true; // Bloqueamos el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      backHandler.remove();
    };
  }, [workoutStatus, navigation]); // Permitir el comportamiento por defecto de retroceso

  // Formatear el tiempo en formato mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Iniciar el workout
  const startWorkout = async () => {
    // Registrar tiempo de inicio
    const now = new Date();
    setStartTime(now.toISOString());
    setWorkoutStatus('in_progress');

    // Crear registro inicial de workout en el backend
    try {
      // El controlador Rails espera exactamente estos campos en esta estructura
      // routine_id debe ser un número, no una cadena
      const workoutParams = {
        routine_id: Number(routine!.id),
        name: routine!.name, // nombre del workout (usando el nombre de la rutina)
        workout_type: 'routine_based' // tipo de workout (basado en rutina según el backend)
      };
      
      // Verificamos que los datos sean válidos
      if (!workoutParams.routine_id || isNaN(workoutParams.routine_id)) {
        throw new Error('ID de rutina inválido');
      }
      
      console.log('Parámetros del workout a enviar:', workoutParams);
      
      // Datos completos para nuestro estado local
      const workoutData: WorkoutSession = {
        routine_id: routine!.id,
        routine_name: routine!.name,
        date: now.toISOString(),
        start_time: now.toISOString(),
        status: 'in_progress',
        exercises: workoutExercises,
        notes: ''
      };

      // Vamos a enviar directamente una estructura con el objeto workout anidado
      // para asegurarnos de que llegue correctamente al backend
      const response = await apiClient.post('/workouts', { 
        workout: workoutParams
      });
      console.log('Respuesta al crear workout:', response.data);
      
      if (response.data && response.data.id) {
        workoutId.current = response.data.id;
        // Iniciar el temporizador
        startTimer();
      } else {
        throw new Error('La respuesta del servidor no incluye un ID de workout');
      }
    } catch (error) {
      console.error('Error al iniciar entrenamiento:', error);
      AppAlert.error('Error', 'No se pudo iniciar el entrenamiento');
      // Revertir el estado del entrenamiento si falla la creación
      setWorkoutStatus('not_started');
      return; // Salir del método sin iniciar el timer
    }
  };

  // Iniciar el temporizador
  const startTimer = () => {
    // Si ya hay un intervalo activo, no crear otro
    if (timerInterval.current) return;
    
    // Sincronizar las referencias con los valores de estado actuales
    currentElapsedTimeRef.current = elapsedTime;
    currentEffectiveTimeRef.current = effectiveTime;
    
    timerInterval.current = setInterval(() => {
      // Incrementar las referencias
      currentElapsedTimeRef.current += 1;
      currentEffectiveTimeRef.current += 1;
      
      // Actualizar los estados con los valores actuales de las referencias
      setElapsedTime(currentElapsedTimeRef.current);
      setEffectiveTime(currentEffectiveTimeRef.current);
    }, 1000);
  };

  // Pausar el workout
  const pauseWorkout = () => {
    if (workoutStatus !== 'in_progress') return;
    
    // Mostrar modal para pedir razón de pausa
    setShowPauseReasonModal(true);
  };

  // Confirmar pausa con razón
  const confirmPause = async () => {
    // Cerrar modal
    setShowPauseReasonModal(false);
    
    // Limpiar el temporizador
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    // Guardar la hora de inicio de la pausa
    pauseStartTime.current = new Date();
    
    // Actualizar estado
    setWorkoutStatus('paused');
    
    try {
      // Actualizar en el backend
      if (workoutId.current) {
        await routineService.pauseWorkout(workoutId.current, pauseReason);
        console.log('Workout pausado con razón:', pauseReason);
      }
    } catch (error) {
      console.error('Error al pausar el workout:', error);
    }
  };

  // Cancelar pausa
  const cancelPause = () => {
    setShowPauseReasonModal(false);
    setPauseReason('');
    setShowCustomReasonInput(false);
  };

  // Continuar el workout
  const resumeWorkout = async () => {
    if (workoutStatus !== 'paused') return;
    
    // Calcular el tiempo de pausa
    let pauseDuration = 0;
    if (pauseStartTime.current) {
      pauseDuration = Math.floor((new Date().getTime() - pauseStartTime.current.getTime()) / 1000);
      pauseStartTime.current = null;
    }

    // Iniciar el temporizador nuevamente
    startTimer();
    setWorkoutStatus('in_progress');
    
    // Limpiar la razón de pausa para la próxima vez
    setPauseReason('');
    
    // Actualizar en el backend
    try {
      if (workoutId.current) {
        await routineService.resumeWorkout(workoutId.current);
      }
    } catch (error) {
      console.error('Error al reanudar el workout:', error);
    }
  };

  // Iniciar proceso de abandonar el workout
  const handleAbandonWorkout = () => {
    if (workoutStatus === 'in_progress' || workoutStatus === 'paused') {
      AppAlert.confirm(
        "Abandonar entrenamiento",
        "¿Estás seguro que deseas abandonar este entrenamiento? El progreso será guardado como 'abandonado'.",
        confirmAbandonWorkout,
        () => console.log("Cancelado")
      );
    }
  };

  // Confirmar abandono del workout
  const confirmAbandonWorkout = async () => {
    if (workoutStatus !== 'in_progress' && workoutStatus !== 'paused') return;
    
    // Detener el temporizador si está activo
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    // Establecer el tiempo de finalización y el estado
    const endTimeDate = new Date();
    const endTimeISO = endTimeDate.toISOString();
    setEndTime(endTimeISO);
    setWorkoutStatus('abandoned');
    
    // Cerrar el modal
    setShowConfirmModal(false);
    setConfirmAction(null);
    
    try {
      // Guardar el workout como abandonado en el backend
      if (workoutId.current) {
        await routineService.abandonWorkout(workoutId.current);
      }
      
      // Navegar a la pantalla de resumen o rutinas con mensaje de confirmación
      navigation.navigate('Routines', {
        message: 'Entrenamiento abandonado',
        onPress: () => {}
      });
      
    } catch (error) {
      console.error('Error al abandonar el workout:', error);
      AppAlert.error('Error', 'No se pudo abandonar el entrenamiento');
    }
  };

  // Iniciar proceso de completar el workout
  const handleCompleteWorkout = () => {
    if (workoutStatus === 'in_progress' || workoutStatus === 'paused') {
      // Mostrar modal para datos adicionales
      setShowCompleteWorkoutModal(true);
    }
  };
  
  // Cancelar completar workout
  const cancelCompleteWorkout = () => {
    setShowCompleteWorkoutModal(false);
  };

  // Actualizar el dialog de confirmación
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

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
    try {
      // Cerrar modal
      setShowCompleteWorkoutModal(false);
      setSaving(true);
      
      // Detener el temporizador si está activo
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      
      const currentDateTime = new Date().toISOString();
      const currentDate = currentDateTime.split('T')[0];
      
      // Create or update workout data
      const workoutData = {
        routine_id: routineId,
        routine_name: routine?.name || '',
        date: currentDate,
        start_time: startTime,
        end_time: currentDateTime,
        total_duration: elapsedTime,
        effective_duration: effectiveTime,
        status: 'completed' as const,
        exercises: workoutExercises.map(exercise => ({
          routine_exercise_id: exercise.routine_exercise_id,
          exercise: exercise.exercise,
          planned_sets: exercise.planned_sets,
          planned_reps: exercise.planned_reps,
          sets: exercise.sets
        })),
        perceived_intensity: perceivedIntensity,
        energy_level: energyLevel,
        mood: mood,
        notes: notes
      };

      // If there's an existing workout ID, update it; otherwise create a new one
      if (workoutId.current) {
        await routineService.completeWorkout(workoutId.current, {
          perceived_intensity: perceivedIntensity,
          energy_level: energyLevel,
          mood: mood,
          notes: notes
        });
      } else {
        const result = await routineService.createWorkout(workoutData as WorkoutSession);
        workoutId.current = result.id || null;
      }

      // Actualizar estado
      setWorkoutStatus('completed');

      // Navegar a la pantalla de estadísticas del workout para mostrar los resultados
      navigation.navigate('WorkoutStats', {
        workoutId: workoutId.current,
        message: 'Entrenamiento guardado correctamente'
      });

    } catch (error) {
      console.error('Error al guardar el workout:', error);
      AppAlert.error('Error', 'No se pudo guardar el entrenamiento');
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
              {viewMode ? (
                <Text style={styles.readOnlyText}>{set.weight}<Text style={styles.unit}> kg</Text></Text>
              ) : (
                <>
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
                </>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              {viewMode ? (
                <Text style={styles.readOnlyText}>{set.reps}</Text>
              ) : (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  onChangeText={(text: string) => {
                    const value = text ? parseInt(text) : 0;
                    updateSetDetails(exerciseIndex, setIndex, 'reps', value);
                  }}
                />
              )}
            </View>
            
            {viewMode ? (
              <View style={[styles.checkBox, set.completed && styles.checkBoxChecked, viewMode && styles.checkBoxReadOnly]}>
                {set.completed && (
                  <AntDesign name="check" size={16} color="white" />
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.checkBox, set.completed && styles.checkBoxChecked]} 
                onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
                activeOpacity={0.8}
              >
                {set.completed && (
                  <AntDesign name="check" size={16} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderWorkoutControls = () => {
    if (viewMode) {
      // En modo visualización, no mostramos ningún botón adicional para volver
      return null;
    }
    
    // En modo entrenamiento, mostrar controles según el estado actual
    return (
      <View style={styles.workoutControlsContainer}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Tiempo total:</Text>
          <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
        </View>
        
        <View style={styles.controlsRow}>
          {workoutStatus === 'not_started' ? (
            <TouchableOpacity 
              style={styles.startButton}
              onPress={startWorkout}
            >
              <Text style={styles.startButtonText}>Iniciar Entrenamiento</Text>
              <FontAwesome5 name="play" size={16} color="white" />
            </TouchableOpacity>
          ) : workoutStatus === 'in_progress' ? (
            <>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={pauseWorkout}
              >
                <FontAwesome5 name="pause" size={18} color="white" />
                <Text style={styles.controlButtonText}>Pausar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.completeButton]}
                onPress={handleCompleteWorkout}
              >
                <FontAwesome5 name="check" size={18} color="white" />
                <Text style={styles.controlButtonText}>Completar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.abandonButton]}
                onPress={handleAbandonWorkout}
              >
                <FontAwesome5 name="times" size={18} color="white" />
                <Text style={styles.controlButtonText}>Abandonar</Text>
              </TouchableOpacity>
            </>
          ) : workoutStatus === 'paused' ? (
            <>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={resumeWorkout}
              >
                <FontAwesome5 name="play" size={18} color="white" />
                <Text style={styles.controlButtonText}>Continuar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.completeButton]}
                onPress={handleCompleteWorkout}
              >
                <FontAwesome5 name="check" size={18} color="white" />
                <Text style={styles.controlButtonText}>Completar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.abandonButton]}
                onPress={handleAbandonWorkout}
              >
                <FontAwesome5 name="times" size={18} color="white" />
                <Text style={styles.controlButtonText}>Abandonar</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
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
            >
              {exercise.exercise.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent={true}
      animationType="fade"
      onRequestClose={closeConfirmModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {confirmAction === 'abandon' ? '¿Abandonar entrenamiento?' : '¿Completar entrenamiento?'}
          </Text>
          <Text style={styles.modalText}>
            {confirmAction === 'abandon' 
              ? 'Si abandonas, se guardará tu progreso actual pero el entrenamiento se marcará como incompleto.' 
              : '¿Estás seguro de que quieres finalizar este entrenamiento?'}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]} 
              onPress={closeConfirmModal}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalConfirmButton]} 
              onPress={confirmAction === 'abandon' ? confirmAbandonWorkout : saveWorkout}
            >
              <Text style={[styles.modalButtonText, styles.modalConfirmButtonText]}>
                {confirmAction === 'abandon' ? 'Abandonar' : 'Completar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPauseReasonModal = () => (
    <Modal
      visible={showPauseReasonModal}
      transparent={true}
      animationType="fade"
      onRequestClose={cancelPause}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>¿Por qué pausas?</Text>
          
          <View style={styles.reasonOptionsContainer}>
            {pauseReasonOptions.map((reason) => (
              <TouchableOpacity 
                key={reason}
                style={[styles.reasonOptionButton, (pauseReason === reason || (reason === "Otro" && showCustomReasonInput)) && styles.selectedReasonOption]}
                onPress={() => {
                  setPauseReason(reason !== "Otro" ? reason : "");
                  setShowCustomReasonInput(reason === "Otro");
                }}
              >
                <Text style={[styles.reasonOptionText, (pauseReason === reason || (reason === "Otro" && showCustomReasonInput)) && styles.selectedReasonOptionText]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Campo de texto personalizado si se selecciona "Otro" */}
          {showCustomReasonInput && (
            <TextInput
              style={styles.pauseReasonInput}
              placeholder="Ingresa tu razón personalizada"
              value={pauseReason}
              onChangeText={setPauseReason}
              multiline={true}
              maxLength={100}
              autoFocus
            />
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={cancelPause}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalConfirmButton, (showCustomReasonInput && !pauseReason) && styles.disabledButton]}
              onPress={confirmPause}
              disabled={showCustomReasonInput && !pauseReason}
            >
              <Text style={[styles.modalButtonText, styles.modalConfirmButtonText, (showCustomReasonInput && !pauseReason) && styles.disabledButtonText]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Modal para completar entrenamiento con datos adicionales
  const renderCompleteWorkoutModal = () => (
    <Modal
      visible={showCompleteWorkoutModal}
      transparent={true}
      animationType="fade"
      onRequestClose={cancelCompleteWorkout}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Completa tu entrenamiento</Text>
          
          <Text style={styles.modalSubtitle}>Intensidad percibida (1-10)</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
              <TouchableOpacity
                key={`intensity-${value}`}
                style={[styles.ratingButton, perceivedIntensity === value && styles.selectedRating]}
                onPress={() => setPerceivedIntensity(value)}
              >
                <Text style={[styles.ratingText, perceivedIntensity === value && styles.selectedRatingText]}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalSubtitle}>Nivel de energía (1-10)</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
              <TouchableOpacity
                key={`energy-${value}`}
                style={[styles.ratingButton, energyLevel === value && styles.selectedRating]}
                onPress={() => setEnergyLevel(value)}
              >
                <Text style={[styles.ratingText, energyLevel === value && styles.selectedRatingText]}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalSubtitle}>¿Cómo te sientes?</Text>
          <View style={styles.moodContainer}>
            <TouchableOpacity
              style={[styles.moodButton, mood === 'great' && styles.selectedMood]}
              onPress={() => setMood('great')}
            >
              <FontAwesome5 name="grin-beam" size={24} color={mood === 'great' ? "#fff" : "#333"} />
              <Text style={[styles.moodText, mood === 'great' && styles.selectedMoodText]}>Genial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.moodButton, mood === 'good' && styles.selectedMood]}
              onPress={() => setMood('good')}
            >
              <FontAwesome5 name="smile" size={24} color={mood === 'good' ? "#fff" : "#333"} />
              <Text style={[styles.moodText, mood === 'good' && styles.selectedMoodText]}>Bien</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.moodButton, mood === 'neutral' && styles.selectedMood]}
              onPress={() => setMood('neutral')}
            >
              <FontAwesome5 name="meh" size={24} color={mood === 'neutral' ? "#fff" : "#333"} />
              <Text style={[styles.moodText, mood === 'neutral' && styles.selectedMoodText]}>Normal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.moodButton, mood === 'tired' && styles.selectedMood]}
              onPress={() => setMood('tired')}
            >
              <FontAwesome5 name="tired" size={24} color={mood === 'tired' ? "#fff" : "#333"} />
              <Text style={[styles.moodText, mood === 'tired' && styles.selectedMoodText]}>Cansado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.moodButton, mood === 'exhausted' && styles.selectedMood]}
              onPress={() => setMood('exhausted')}
            >
              <FontAwesome5 name="dizzy" size={24} color={mood === 'exhausted' ? "#fff" : "#333"} />
              <Text style={[styles.moodText, mood === 'exhausted' && styles.selectedMoodText]}>Agotado</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Notas</Text>
          <TextInput
            style={styles.completeWorkoutNotes}
            placeholder="Añade notas sobre este entrenamiento"
            value={notes}
            onChangeText={setNotes}
            multiline={true}
            maxLength={200}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={cancelCompleteWorkout}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={saveWorkout}
            >
              <Text style={[styles.modalButtonText, styles.modalConfirmButtonText]}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      {renderConfirmModal()}
      {renderPauseReasonModal()}
      {renderCompleteWorkoutModal()}
      <View style={styles.container}>
        {routine && (
          <>
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="#333" />
              </TouchableOpacity>
              <View style={styles.header}>
                <Text style={styles.routineTitle}>{routine?.name || 'Rutina'}</Text>
                <Text style={styles.routineDescription}>{routine?.difficulty || 'N/A'} • {routine?.duration || 'N/A'} min</Text>
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
              {viewMode ? (
                <Text style={[styles.notesInput, {color: '#555'}]}>
                  {notes || 'Sin notas'}
                </Text>
              ) : (
                <TextInput
                  style={styles.notesInput}
                  multiline
                  placeholder="Agregar notas sobre tu entrenamiento (opcional)"
                  value={notes}
                  onChangeText={setNotes}
                  textAlignVertical="top"
                />
              )}
            </View>
            
            {/* Workout Controls */}
            {renderWorkoutControls()}
            

          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    maxHeight: '85%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f2f2f2',
  },
  modalConfirmButton: {
    backgroundColor: '#0066CC',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButtonText: {
    color: 'white',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeExerciseTabText: {
    color: 'white',
  },
  workoutControlsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  controlButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  abandonButton: {
    backgroundColor: '#F44336',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: 0,
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
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  checkBoxReadOnly: {
    opacity: 0.7,
    pointerEvents: 'none',
  },
  readOnlyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
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
  completeWorkoutNotes: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#0066CC',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  selectedRatingText: {
    color: '#fff',
    fontWeight: '600',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMood: {
    backgroundColor: '#0066CC',
  },
  moodText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  selectedMoodText: {
    color: '#fff',
  },
  finishButtonContainer: {
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
  pauseReasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  reasonOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reasonOptionButton: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedReasonOption: {
    backgroundColor: '#0066CC',
  },
  reasonOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedReasonOptionText: {
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  disabledButtonText: {
    color: '#888888',
  },


});

export default WorkoutTrackerScreen;
