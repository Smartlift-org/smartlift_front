import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  BackHandler,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import routineService, {
  Routine,
  WorkoutSet,
  WorkoutExercise,
} from "../services/routineService";
import workoutService from "../services/workoutService";
import {
  ExerciseSelector,
  ExerciseSets,
  PauseReasonModal,
  CompleteWorkoutModal,
  ConfirmModal,
  WorkoutControls,
} from "../components/WorkoutTracker";

const AppAlert = {
  error: (title: string, message: string) => Alert.alert(title, message),
  success: (title: string, message: string) => Alert.alert(title, message),
  info: (title: string, message: string) => Alert.alert(title, message),
};

type Props = {
  navigation: any;
  route: any;
};

export default function WorkoutTrackerScreen({ navigation, route }: Props) {
  const routineId = route.params?.routineId;

  const viewMode = route.params?.viewMode === true;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [notes, setNotes] = useState<string>("");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const [workoutStatus, setWorkoutStatus] = useState<
    "not_started" | "in_progress" | "paused" | "completed" | "abandoned"
  >("not_started");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [effectiveTime, setEffectiveTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<
    "abandon" | "complete" | null
  >(null);
  const [showPauseReasonModal, setShowPauseReasonModal] =
    useState<boolean>(false);
  const [pauseReason, setPauseReason] = useState<string>("");

  const pauseReasonOptions = [
    "Descanso",
    "Hidratación",
    "Ir al baño",
    "Atender llamada",
    "Fatiga muscular",
    "Otro",
  ];

  const [showCompleteWorkoutModal, setShowCompleteWorkoutModal] =
    useState<boolean>(false);
  const [perceivedIntensity, setPerceivedIntensity] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [mood, setMood] = useState<string>("neutral");

  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const pauseStartTime = useRef<Date | null>(null);

  const currentElapsedTimeRef = useRef<number>(0);
  const currentEffectiveTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        if (routineId) {
          const routineData = await routineService.getRoutine(routineId);

          setRoutine(routineData);

          const exercises: WorkoutExercise[] = routineData.routine_exercises
            ? routineData.routine_exercises.map((re) => ({
                routine_exercise_id: re.id,
                exercise: re.exercise,
                planned_sets: re.sets,
                planned_reps: re.reps,
                sets: Array.from({ length: re.sets }).map((_, idx) => ({
                  set_number: idx + 1,
                  weight: 0,
                  reps: re.reps,
                  completed: false,
                })),
              }))
            : [];

          setWorkoutExercises(exercises);
        } else {
          AppAlert.error("Error", "No se ha seleccionado una rutina");
          navigation.goBack();
        }
      } catch (error) {
        AppAlert.error("Error", "Error al cargar la rutina");
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId]);

  useEffect(() => {
    const handleBackButton = () => {
      if (viewMode || workoutStatus === "not_started") {
        navigation.goBack();
        return true;
      }

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );

    return () => {
      backHandler.remove();
    };
  }, [workoutStatus, navigation]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startWorkout = async () => {
    const now = new Date();
    setStartTime(now.toISOString());
    setWorkoutStatus("in_progress");

    try {
      // Creamos un workout basado en la rutina
      const result = await workoutService.createWorkout({
        routine_id: Number(routine!.id),
        name: routine!.name
      });

      if (result && result.id) {
        setWorkoutId(String(result.id));
        startTimer();
      } else {
        throw new Error(
          "La respuesta del servidor no incluye un ID de workout"
        );
      }
    } catch (error) {
      AppAlert.error("Error", "No se pudo iniciar el entrenamiento");

      setWorkoutStatus("not_started");
      return;
    }
  };

  useEffect(() => {
    if (route.params?.workoutId && viewMode) {
      loadWorkoutData(route.params.workoutId);
    }
  }, [route.params?.workoutId, viewMode]);

  const loadWorkoutData = async (id: string | number) => {
    try {
      setLoading(true);
      const response = await routineService.getWorkout(Number(id));
      if (response) {
        setElapsedTime(response.total_duration || 0);
        setEffectiveTime(response.effective_duration || 0);
        setWorkoutStatus(
          response.status as
            | "not_started"
            | "in_progress"
            | "paused"
            | "completed"
            | "abandoned"
        );
        setWorkoutExercises(response.exercises || []);
        setNotes(response.notes || "");

        if (response.exercises && response.exercises.length > 0) {
          setActiveExerciseIndex(0);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerInterval.current) return;

    currentElapsedTimeRef.current = elapsedTime;
    currentEffectiveTimeRef.current = effectiveTime;

    timerInterval.current = setInterval(() => {
      currentElapsedTimeRef.current += 1;
      currentEffectiveTimeRef.current += 1;

      setElapsedTime(currentElapsedTimeRef.current);
      setEffectiveTime(currentEffectiveTimeRef.current);
    }, 1000);
  };

  const pauseWorkout = () => {
    if (workoutStatus !== "in_progress") return;

    setShowPauseReasonModal(true);
  };

  const confirmPause = async () => {
    try {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      setWorkoutStatus("paused");
      pauseStartTime.current = new Date();
      setShowPauseReasonModal(false);

      if (workoutId) {
        await workoutService.pauseWorkout(Number(workoutId), pauseReason);
      }
    } catch (error) {
      AppAlert.error("Error", "No se pudo pausar el entrenamiento");
      startTimer();
      setWorkoutStatus("in_progress");
    }
  };

  const cancelPause = () => {
    setShowPauseReasonModal(false);
    setPauseReason("");
  };

  const resumeWorkout = async () => {
    try {
      if (workoutStatus !== "paused") return;

      const pauseEndTime = new Date();
      const pauseDurationSeconds = pauseStartTime.current
        ? Math.floor(
            (pauseEndTime.getTime() - pauseStartTime.current.getTime()) / 1000
          )
        : 0;

      setWorkoutStatus("in_progress");
      pauseStartTime.current = null;

      startTimer();

      if (workoutId) {
        await workoutService.resumeWorkout(Number(workoutId));
      }
    } catch (error) {
      AppAlert.error("Error", "No se pudo reanudar el entrenamiento");
      setWorkoutStatus("paused");
    }
  };

  const handleAbandonWorkout = () => {
    if (workoutStatus === "in_progress" || workoutStatus === "paused") {
      setShowConfirmModal(true);
      setConfirmAction("abandon");
    }
  };

  const confirmAbandonWorkout = async () => {
    try {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      setWorkoutStatus("abandoned");
      setShowConfirmModal(false);

      if (workoutId) {
        await workoutService.abandonWorkout(Number(workoutId));
      }
      navigation.navigate("Routines", {
        message: "Entrenamiento abandonado",
        onPress: () => {},
      });
    } catch (error) {
      throw error;
    }
  };

  const handleCompleteWorkout = () => {
    if (workoutStatus === "in_progress" || workoutStatus === "paused") {
      setShowCompleteWorkoutModal(true);
    }
  };

  const cancelCompleteWorkout = () => {
    setShowCompleteWorkoutModal(false);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const confirmCompleteWorkout = () => {
    setShowConfirmModal(false);
    setShowCompleteWorkoutModal(true);
  };

  const updateSetDetails = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: number | boolean
  ) => {
    const updatedExercises = [...workoutExercises];
    const updatedSets = [...updatedExercises[exerciseIndex].sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      sets: updatedSets,
    };
    setWorkoutExercises(updatedExercises);
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets[setIndex].completed =
      !updatedExercises[exerciseIndex].sets[setIndex].completed;
    setWorkoutExercises(updatedExercises);
  };

  const saveWorkout = async () => {
    try {
      setShowCompleteWorkoutModal(false);
      setSaving(true);

      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      if (workoutId) {
        // Si ya existe un workout, lo completamos con los datos adicionales
        await workoutService.completeWorkout(Number(workoutId), {
          perceived_intensity: perceivedIntensity,
          energy_level: energyLevel,
          mood: mood,
          notes: notes,
          total_duration_seconds: elapsedTime,    // Enviamos el tiempo total transcurrido según nuevo formato del backend
        });
      } else {
        // Si no existe, creamos uno nuevo basado en la rutina
        const result = await workoutService.createWorkout({
          routine_id: routine?.id || 0,
        });

        // Registramos cada ejercicio y sus sets
        if (result && result.id) {
          setWorkoutId(String(result.id));

          // En una implementación completa, aquí registraríamos los sets completados
          // usando los nuevos endpoints para cada ejercicio
        }
      }

      setWorkoutStatus("completed");

      // Usar reset en lugar de navigate para evitar volver al entrenamiento completado
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "WorkoutStats",
            params: {
              workoutId: workoutId || "",
              message: "Entrenamiento guardado correctamente",
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
      AppAlert.error(
        "Error",
        "No se pudo guardar el entrenamiento. Por favor, inténtalo de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0066CC" />
        <Text className="mt-2.5 text-base text-gray-700">
          Cargando rutina...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ConfirmModal
        visible={showConfirmModal}
        title={
          confirmAction === "abandon"
            ? "¿Abandonar entrenamiento?"
            : "¿Completar entrenamiento?"
        }
        message={
          confirmAction === "abandon"
            ? "Si abandonas, se guardará tu progreso actual pero el entrenamiento se marcará como incompleto."
            : "¿Estás seguro de que quieres finalizar este entrenamiento?"
        }
        onCancel={closeConfirmModal}
        onConfirm={
          confirmAction === "abandon" ? confirmAbandonWorkout : saveWorkout
        }
        cancelText="Cancelar"
        confirmText={confirmAction === "abandon" ? "Abandonar" : "Completar"}
        confirmType={confirmAction === "abandon" ? "danger" : "success"}
      />

      <PauseReasonModal
        visible={showPauseReasonModal}
        pauseReasonOptions={pauseReasonOptions}
        onCancel={cancelPause}
        onConfirm={(reason) => {
          setPauseReason(reason);
          confirmPause();
        }}
      />

      <CompleteWorkoutModal
        visible={showCompleteWorkoutModal}
        onCancel={cancelCompleteWorkout}
        onConfirm={(data) => {
          setPerceivedIntensity(data.perceivedIntensity);
          setEnergyLevel(data.energyLevel);
          setMood(data.mood);
          setNotes(data.notes);
          saveWorkout();
        }}
      />

      <View className="flex-1 bg-gray-50">
        {routine && (
          <>
            <ScreenHeader
              title={routine?.name || "Rutina"}
              onBack={() => navigation.goBack()}
              rightComponent={
                <View className="flex-row items-center">
                  <View className="bg-blue-100 px-2 py-1 rounded-full mr-2">
                    <Text className="text-blue-800 text-xs font-medium">
                      {routine?.difficulty || "N/A"}
                    </Text>
                  </View>
                  <View className="bg-gray-100 px-2 py-1 rounded-full">
                    <Text className="text-gray-800 text-xs font-medium">
                      {routine?.duration || "N/A"} min
                    </Text>
                  </View>
                </View>
              }
            />

            <ExerciseSelector
              exercises={workoutExercises}
              activeExerciseIndex={activeExerciseIndex}
              setActiveExerciseIndex={setActiveExerciseIndex}
            />
            
            <ScrollView 
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: !viewMode ? 100 : 20, // Extra padding when workout controls are shown
              }}
            >
              {workoutExercises.length > 0 &&
                activeExerciseIndex < workoutExercises.length && (
                  <View className="px-4 pt-2 pb-4">
                    <View className="mb-3">
                      <Text className="text-xl font-bold text-gray-800">
                        {workoutExercises[activeExerciseIndex].exercise.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {workoutExercises[
                          activeExerciseIndex
                        ].exercise.primary_muscles.join(", ")}{
                          ""
                        } •{
                          ""
                        }
                        {workoutExercises[activeExerciseIndex].exercise.equipment}
                      </Text>
                    </View>

                    {/* Imágenes del ejercicio */}
                    {workoutExercises[activeExerciseIndex].exercise.image_urls && 
                     workoutExercises[activeExerciseIndex].exercise.image_urls.length > 0 && (
                      <View className="mb-4">
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ paddingHorizontal: 4 }}
                        >
                          {workoutExercises[activeExerciseIndex].exercise.image_urls.map((url, imgIndex) => (
                            <Image
                              key={imgIndex}
                              source={{ uri: url }}
                              style={{
                                width: Math.min(Dimensions.get('window').width * 0.45, 180),
                                height: Math.min(Dimensions.get('window').width * 0.45, 180),
                                borderRadius: 8,
                                marginHorizontal: 6
                              }}
                              resizeMode="cover"
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    <ExerciseSets
                      exercise={workoutExercises[activeExerciseIndex]}
                      exerciseIndex={activeExerciseIndex}
                      viewMode={viewMode}
                      workoutStatus={workoutStatus}
                      updateSetDetails={updateSetDetails}
                      toggleSetCompletion={toggleSetCompletion}
                    />
                  </View>
                )}

              <View className="px-4 py-3 bg-white border-t border-gray-200">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Notas del entrenamiento:
                </Text>
                {viewMode ? (
                  <Text className="p-2 min-h-[80px] rounded-md bg-gray-50 text-gray-600">
                    {notes || "Sin notas"}
                  </Text>
                ) : (
                  <TextInput
                    className="p-2 min-h-[80px] bg-gray-50 border border-gray-200 rounded-md text-gray-800"
                    multiline
                    placeholder="Agregar notas sobre tu entrenamiento (opcional)"
                    value={notes}
                    onChangeText={setNotes}
                    textAlignVertical="top"
                  />
                )}
              </View>
            </ScrollView>

            {!viewMode && (
              <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <WorkoutControls
                  workoutStatus={workoutStatus}
                  elapsedTime={elapsedTime}
                  onStart={() => {
                    startWorkout();
                  }}
                  onPause={pauseWorkout}
                  onResume={() => {
                    resumeWorkout();
                  }}
                  onComplete={() => {
                    setShowConfirmModal(true);
                    setConfirmAction("complete");
                  }}
                  onAbandon={handleAbandonWorkout}
                  formatTime={formatTime}
                />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
