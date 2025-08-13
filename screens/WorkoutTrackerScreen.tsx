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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
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
  ConfirmModal,
  WorkoutControls,
  CompleteWorkoutModal,
} from "../components/WorkoutTracker";

const AppAlert = {
  error: (title: string, message: string) => Alert.alert(title, message),
  success: (title: string, message: string) => Alert.alert(title, message),
  info: (title: string, message: string) => Alert.alert(title, message),
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
    confirmText: string = "Confirmar",
    cancelText: string = "Cancelar"
  ) => {
    Alert.alert(title, message, [
      { text: cancelText, onPress: onCancel, style: "cancel" },
      { text: confirmText, onPress: onConfirm },
    ]);
  },
};

type WorkoutTrackerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutTracker">;
  route: RouteProp<RootStackParamList, "WorkoutTracker">;
};

export default function WorkoutTrackerScreen({ navigation, route }: WorkoutTrackerScreenProps) {
  const routineId = route.params?.routineId;
  const existingWorkoutId = route.params?.workoutId;
  const viewMode = route.params?.viewMode === true;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [notes, setNotes] = useState<string>("");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const [workoutStatus, setWorkoutStatus] = useState<
    "not_started" | "in_progress" | "paused" | "completed" | "abandoned"
  >("not_started");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [effectiveTime, setEffectiveTime] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<
    "abandon" | "complete" | null
  >(null);
  const [showPauseReasonModal, setShowPauseReasonModal] =
    useState<boolean>(false);
  const [pauseReason, setPauseReason] = useState<string>("");
  const [showCompleteWorkoutModal, setShowCompleteWorkoutModal] =
    useState<boolean>(false);

  const pauseReasonOptions = [
    "Descanso",
    "Hidratación",
    "Ir al baño",
    "Atender llamada",
    "Fatiga muscular",
    "Otro",
  ];

  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const pauseStartTime = useRef<Date | null>(null);

  const currentElapsedTimeRef = useRef<number>(0);
  const currentEffectiveTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (existingWorkoutId) {
          setWorkoutId(existingWorkoutId.toString());
          await loadWorkoutData(existingWorkoutId);
        } else if (routineId) {
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
        AppAlert.error("Error", "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [routineId, existingWorkoutId]);

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
    try {
      const activeWorkouts = await workoutService.getActiveWorkouts();

      if (activeWorkouts.length > 0) {
        const activeWorkout = activeWorkouts[0];
        AppAlert.confirm(
          "Workout Activo Encontrado",
          `Ya tienes un workout activo. ¿Qué deseas hacer?`,
          () => {
            navigation.navigate("WorkoutTracker", {
              workoutId: activeWorkout.id,
              viewMode: false,
            });
          },
          () => {
            handleAbandonActiveWorkout(activeWorkout.id);
          },
          "Continuar Existente",
          "Abandonar y Crear Nuevo"
        );
        return;
      }

      setWorkoutStatus("in_progress");

      const result = await workoutService.createWorkout({
        routine_id: Number(routine!.id),
        name: routine!.name,
      });

      if (!result || !result.id) {
        throw new Error(
          "La respuesta del servidor no incluye un ID de workout"
        );
      }

      setWorkoutId(String(result.id));

      try {
        const workoutExercises = await workoutService.getWorkoutExercises(
          result.id
        );

        const formattedExercises = workoutExercises.map(
          (workoutExercise: any) => ({
            ...workoutExercise,
            exercise: workoutExercise.exercise,
            sets: workoutExercise.sets || [],
            planned_sets: workoutExercise.target_sets,
            planned_reps: workoutExercise.target_reps,
          })
        );

        setWorkoutExercises(formattedExercises);
        startTimer();
      } catch (error) {
        throw new Error("No se pudieron cargar los ejercicios del workout");
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
      if (!response) {
        throw new Error("No se pudo cargar el workout");
      }
      const workoutExercises = await workoutService.getWorkoutExercises(
        Number(id)
      );

      const mappedExercises =
        response.exercises?.map((routineExercise: any) => {
          const workoutExercise = workoutExercises.find(
            (we: any) => we.exercise_id === routineExercise.exercise.id
          );

          let mappedSets = routineExercise.sets || [];

          if (workoutExercise?.sets && workoutExercise.sets.length > 0) {
            mappedSets = workoutExercise.sets.map((backendSet: any) => ({
              set_number: backendSet.set_number || backendSet.order,
              reps: backendSet.reps || routineExercise.planned_reps,
              weight: backendSet.weight || 0,
              completed: backendSet.completed || false,
              rest_time: routineExercise.rest_time || 60,
            }));
          }

          return {
            ...routineExercise,
            id: workoutExercise?.id,
            routine_exercise_id:
              routineExercise.id || routineExercise.routine_exercise_id,
            sets: mappedSets,
          } as any;
        }) || [];

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
      setWorkoutExercises(mappedExercises);
      setNotes(response.notes || "");

      if (mappedExercises.length > 0) {
        setActiveExerciseIndex(0);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading workout data:", error);
      AppAlert.error("Error", "No se pudo cargar el entrenamiento");
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

      if (workoutId) {
        for (const exercise of workoutExercises) {
          const completedSets = exercise.sets.filter((set) => set.completed);

          for (const set of completedSets) {
            try {
              if ((exercise as any).id) {
                await workoutService.recordExerciseSet((exercise as any).id, {
                  weight: set.weight,
                  reps: set.reps,
                  set_type: "normal",
                  rpe: undefined,
                });
              }
            } catch (error) {
              console.error("Error saving set during pause:", error);
            }
          }

          const allSetsCompleted =
            exercise.sets.length > 0 &&
            exercise.sets.every((set) => set.completed);

          if (allSetsCompleted && (exercise as any).id) {
            try {
              await workoutService.completeExercise((exercise as any).id);
            } catch (error) {
              console.error("Error completing exercise during pause:", error);
            }
          }
        }

        await workoutService.pauseWorkout(Number(workoutId), pauseReason);
      }

      setWorkoutStatus("paused");
      pauseStartTime.current = new Date();
      setShowPauseReasonModal(false);
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
      navigation.navigate("RoutineList", {
        refresh: true,
      });
    } catch (error) {
      AppAlert.error("Error", "No se pudo abandonar el entrenamiento");
      setWorkoutStatus("abandoned");
      setShowConfirmModal(false);

      if (workoutId) {
        await workoutService.abandonWorkout(Number(workoutId));
      }
      navigation.navigate("RoutineList", {
        refresh: true,
      });
      throw error;
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleAbandonActiveWorkout = async (activeWorkoutId: number) => {
    try {
      await workoutService.abandonWorkout(activeWorkoutId);
      AppAlert.success("Éxito", "Workout anterior abandonado");
      await startWorkout();
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudo abandonar el workout anterior o crear el nuevo"
      );
      setWorkoutStatus("not_started");
    }
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

  const toggleSetCompletion = async (
    exerciseIndex: number,
    setIndex: number
  ) => {
    const updatedExercises = [...workoutExercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];
    const exercise = updatedExercises[exerciseIndex];

    set.completed = !set.completed;
    setWorkoutExercises(updatedExercises);

    if (set.completed && workoutId && (exercise as any).id) {
      try {
        await workoutService.recordExerciseSet((exercise as any).id, {
          weight: set.weight,
          reps: set.reps,
          set_type: "normal",
          rpe: undefined,
        });
      } catch (error) {
        console.error("Error saving set data:", error);
        const revertedExercises = [...workoutExercises];
        revertedExercises[exerciseIndex].sets[setIndex].completed =
          !set.completed;
        setWorkoutExercises(revertedExercises);
        AppAlert.error("Error", "No se pudo guardar los datos de la serie");
      }
    }
  };

  const saveWorkout = async () => {
    setShowCompleteWorkoutModal(true);
  };

  const handleCompleteWorkout = async (data: {
    perceivedIntensity: number;
    energyLevel: number;
    mood: string;
    notes: string;
  }) => {
    try {
      setShowCompleteWorkoutModal(false);

      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      if (workoutId) {
        for (const exercise of workoutExercises) {
          const completedSets = exercise.sets.filter((set) => set.completed);
          for (const set of completedSets) {
            try {
              if ((exercise as any).id) {
                await workoutService.recordExerciseSet((exercise as any).id, {
                  weight: set.weight,
                  reps: set.reps,
                  set_type: "normal",
                  rpe: undefined,
                });
              }
            } catch (error) {
              console.error("Error saving set during completion:", error);
            }
          }

          const allSetsCompleted =
            exercise.sets.length > 0 &&
            exercise.sets.every((set) => set.completed);

          if (allSetsCompleted && (exercise as any).id) {
            try {
              await workoutService.completeExercise((exercise as any).id);
            } catch (error) {
              console.error("Error completing exercise:", error);
            }
          }
        }
        await workoutService.completeWorkout(Number(workoutId), {
          perceived_intensity: data.perceivedIntensity,
          energy_level: data.energyLevel,
          mood: data.mood,
          notes: data.notes,
          total_duration_seconds: elapsedTime,
        });
      } else {
        const result = await workoutService.createWorkout({
          routine_id: routine?.id || 0,
        });
        if (result && result.id) {
          setWorkoutId(String(result.id));
        }
      }

      setWorkoutStatus("completed");
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
    }
  };

  const handleCancelCompleteWorkout = () => {
    setShowCompleteWorkoutModal(false);
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
                paddingBottom: !viewMode ? 100 : 20,
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
                        ].exercise.primary_muscles.join(", ")}
                      </Text>
                    </View>

                    {workoutExercises[activeExerciseIndex].exercise.images &&
                      workoutExercises[activeExerciseIndex].exercise.images
                        .length > 0 && (
                        <View className="mb-4">
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 4 }}
                          >
                            {workoutExercises[
                              activeExerciseIndex
                            ].exercise.images.map((url, imgIndex) => (
                              <Image
                                key={imgIndex}
                                source={{ uri: url }}
                                style={{
                                  width: Math.min(
                                    Dimensions.get("window").width * 0.45,
                                    180
                                  ),
                                  height: Math.min(
                                    Dimensions.get("window").width * 0.45,
                                    180
                                  ),
                                  borderRadius: 8,
                                  marginHorizontal: 6,
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

      <CompleteWorkoutModal
        visible={showCompleteWorkoutModal}
        onConfirm={handleCompleteWorkout}
        onCancel={handleCancelCompleteWorkout}
      />
    </SafeAreaView>
  );
}
