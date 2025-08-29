import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { challengeService } from "../../services/challengeService";
import { challengeAttemptService } from "../../services/challengeAttemptService";
import {
  Challenge,
  ChallengeAttempt,
  ChallengeExercise,
} from "../../types/challenge";
import AppAlert from "../../components/AppAlert";
import { formatTime } from "../../utils/challengeUtils";

type ChallengeExecutionScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ChallengeExecution"
  >;
  route: RouteProp<RootStackParamList, "ChallengeExecution">;
};

interface ExerciseProgress {
  exercise_id: number;
  completed_sets: number;
  start_time?: number;
  end_time?: number;
}

const ChallengeExecutionScreen: React.FC<ChallengeExecutionScreenProps> = ({
  navigation,
  route,
}) => {
  const { challengeId, attemptId } = route.params;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [exerciseProgress, setExerciseProgress] = useState<
    Record<number, ExerciseProgress>
  >({});
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<number | null>(null);
  const restIntervalRef = useRef<number | null>(null);

  const loadChallengeData = useCallback(async () => {
    try {
      const [challengeData, attemptData] = await Promise.all([
        challengeService.getChallengeDetail(challengeId),
        challengeAttemptService.getAttemptDetail(challengeId, attemptId),
      ]);

      setChallenge(challengeData);
      setAttempt(attemptData);

      const progress: Record<number, ExerciseProgress> = {};
      challengeData.challenge_exercises?.forEach((ex) => {
        if (ex.exercise?.id) {
          progress[ex.exercise.id] = {
            exercise_id: ex.exercise.id,
            completed_sets: 0,
          };
        }
      });
      setExerciseProgress(progress);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [challengeId, attemptId, navigation]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTotalTime(Date.now() - startTimeRef.current);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restTimeLeft]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleExitChallenge();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    loadChallengeData();
  }, [loadChallengeData]);

  const getCurrentExercise = (): ChallengeExercise | null => {
    if (
      !challenge ||
      !challenge.challenge_exercises ||
      currentExerciseIndex >= challenge.challenge_exercises.length
    ) {
      return null;
    }
    return challenge.challenge_exercises[currentExerciseIndex];
  };

  const handleCompleteSet = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise || !currentExercise.exercise?.id) return;

    const exerciseId = currentExercise.exercise.id;
    const newCompletedSets =
      (exerciseProgress[exerciseId]?.completed_sets || 0) + 1;

    setExerciseProgress((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed_sets: newCompletedSets,
      },
    }));

    if (newCompletedSets >= currentExercise.sets) {
      handleCompleteExercise();
    } else {
      if (currentExercise.rest_time_seconds > 0) {
        setIsResting(true);
        setRestTimeLeft(currentExercise.rest_time_seconds);
      }
      setCurrentSet(newCompletedSets + 1);
    }
  };

  const handleCompleteExercise = () => {
    if (!challenge) return;

    if (
      challenge.challenge_exercises &&
      currentExerciseIndex < challenge.challenge_exercises.length - 1
    ) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setRestTimeLeft(0);
    } else {
      handleCompleteChallenge();
    }
  };

  const handleCompleteChallenge = async () => {
    if (!challenge || !attempt) return;

    try {
      setIsCompleting(true);
      const completionTimeMs = Date.now() - startTimeRef.current;
      const completionTimeSeconds = Math.floor(completionTimeMs / 1000);

      const exerciseTimes: Record<string, number> = {};
      if (challenge.challenge_exercises) {
        challenge.challenge_exercises.forEach((ex, index) => {
          if (ex.exercise?.id) {
            exerciseTimes[ex.exercise.id.toString()] = Math.floor(
              completionTimeSeconds / challenge.challenge_exercises!.length
            );
          }
        });
      }

      const result = await challengeAttemptService.completeAttempt(
        challengeId,
        attemptId,
        {
          completion_time_seconds: completionTimeSeconds,
          exercise_times: exerciseTimes,
        }
      );

      AppAlert.success(
        "¡Desafío Completado! 🎉",
        `Tiempo: ${formatTime(completionTimeMs)}\n` +
          `Posición: #${result.leaderboard_position || "N/A"}\n` +
          `${result.is_new_personal_best ? "🏆 ¡Nuevo récord personal!" : ""}`
      );

      setTimeout(() => {
        navigation.replace("ChallengeLeaderboard", { challengeId });
      }, 2000);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleExitChallenge = () => {
    AppAlert.confirm(
      "Salir del Desafío",
      "¿Estás seguro que quieres salir? Tu progreso actual se perderá.",
      () => navigation.goBack()
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white mt-4">Preparando desafío...</Text>
      </View>
    );
  }

  if (!challenge || !attempt) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-xl">Error al cargar el desafío</Text>
      </View>
    );
  }

  const currentExercise = getCurrentExercise();
  if (!currentExercise) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-xl">Desafío completado</Text>
      </View>
    );
  }

  const currentProgress = exerciseProgress[currentExercise.exercise.id];
  const completedSets = currentProgress?.completed_sets || 0;
  const isLastExercise = challenge.challenge_exercises
    ? currentExerciseIndex === challenge.challenge_exercises.length - 1
    : false;
  const isLastSet = currentSet === currentExercise.sets;

  return (
    <View className="flex-1 bg-gray-900">
      <View className="bg-black p-4 pt-12">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={handleExitChallenge}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold">Salir</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white text-sm opacity-80">Tiempo Total</Text>
            <Text className="text-white text-2xl font-bold">
              {formatTime(totalTime)}
            </Text>
          </View>
          <View className="w-16" />
        </View>
      </View>

      <View className="bg-gray-800 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white font-bold">
            Ejercicio {currentExerciseIndex + 1} de{" "}
            {challenge.challenge_exercises?.length || 0}
          </Text>
          <Text className="text-blue-400">
            {challenge.challenge_exercises?.length
              ? Math.round(
                  ((currentExerciseIndex +
                    completedSets / currentExercise.sets) /
                    challenge.challenge_exercises.length) *
                    100
                )
              : 0}
            %
          </Text>
        </View>
        <View className="bg-gray-700 rounded-full h-2">
          <View
            className="bg-blue-500 h-2 rounded-full"
            style={{
              width: `${
                challenge.challenge_exercises?.length
                  ? ((currentExerciseIndex +
                      completedSets / currentExercise.sets) /
                      challenge.challenge_exercises.length) *
                    100
                  : 0
              }%`,
            }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-lg p-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {currentExercise.exercise.name}
          </Text>
          <Text className="text-gray-600 mb-4">
            Serie {currentSet} de {currentExercise.sets}
          </Text>

          <View className="bg-blue-50 rounded-lg p-4 mb-4">
            <Text className="text-blue-900 text-lg font-bold text-center">
              {currentExercise.reps} repeticiones
            </Text>
          </View>

          {currentExercise.notes && (
            <View className="bg-yellow-50 rounded-lg p-3 mb-4">
              <Text className="text-yellow-800 text-sm">
                💡 {currentExercise.notes}
              </Text>
            </View>
          )}

          <View className="flex-row justify-center mb-4">
            {Array.from({ length: currentExercise.sets }, (_, index) => (
              <View
                key={index}
                className={`w-8 h-8 rounded-full mx-1 justify-center items-center border-2 ${
                  index < completedSets
                    ? "bg-green-500 border-green-500"
                    : index === completedSets
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300 bg-gray-100"
                }`}
              >
                <Text
                  className={`font-bold ${
                    index < completedSets ? "text-white" : "text-gray-600"
                  }`}
                >
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {isResting && (
          <View className="bg-orange-500 rounded-lg p-6 mb-6">
            <Text className="text-white text-xl font-bold text-center mb-2">
              ⏰ Descanso
            </Text>
            <Text className="text-white text-3xl font-bold text-center">
              {Math.floor(restTimeLeft / 60)}:
              {(restTimeLeft % 60).toString().padStart(2, "0")}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="p-6 bg-gray-800">
        <TouchableOpacity
          className={`py-4 rounded-lg ${
            isResting ? "bg-gray-500" : "bg-green-500"
          }`}
          onPress={handleCompleteSet}
          disabled={isResting || isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xl font-bold text-center">
              {isResting
                ? `Descansando... ${restTimeLeft}s`
                : isLastExercise && isLastSet
                ? "🏁 Finalizar Desafío"
                : completedSets >= currentExercise.sets - 1
                ? "➡️ Siguiente Ejercicio"
                : "✅ Completar Serie"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChallengeExecutionScreen;
