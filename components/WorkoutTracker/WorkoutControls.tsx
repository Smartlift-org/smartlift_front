import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface WorkoutControlsProps {
  workoutStatus:
    | "not_started"
    | "in_progress"
    | "paused"
    | "completed"
    | "abandoned";
  elapsedTime: number;
  viewMode?: boolean;
  saving?: boolean;
  startWorkout?: () => void;
  pauseWorkout?: () => void;
  resumeWorkout?: () => void;
  handleCompleteWorkout?: () => void;
  handleAbandonWorkout?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
  onAbandon?: () => void;
  formatTime: (timeInSeconds: number) => string;
}

const WorkoutControls: React.FC<WorkoutControlsProps> = ({
  workoutStatus,
  elapsedTime,
  viewMode = false,
  saving = false,
  startWorkout,
  pauseWorkout,
  resumeWorkout,
  handleCompleteWorkout,
  handleAbandonWorkout,
  onStart,
  onPause,
  onResume,
  onComplete,
  onAbandon,
  formatTime,
}) => {
  const handleStart = startWorkout || onStart;
  const handlePause = pauseWorkout || onPause;
  const handleResume = resumeWorkout || onResume;
  const handleComplete = handleCompleteWorkout || onComplete;
  const handleAbandon = handleAbandonWorkout || onAbandon;
  if (viewMode) {
    return null;
  }
  if (workoutStatus === "completed" || workoutStatus === "abandoned") {
    return null;
  }

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-sm text-gray-600">Duración</Text>
          <Text className="text-2xl font-bold text-indigo-600">
            {formatTime(elapsedTime)}
          </Text>
        </View>
        <View>
          <Text className="text-sm text-gray-600">Estado</Text>
          <View className="flex-row items-center">
            {workoutStatus === "not_started" && (
              <Text className="text-base font-medium text-yellow-500">
                No iniciado
              </Text>
            )}
            {workoutStatus === "in_progress" && (
              <Text className="text-base font-medium text-green-600">
                En progreso
              </Text>
            )}
            {workoutStatus === "paused" && (
              <Text className="text-base font-medium text-orange-500">
                Pausado
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row justify-between">
        {workoutStatus === "not_started" && (
          <TouchableOpacity
            className="flex-1 bg-indigo-600 py-3 rounded-lg flex-row justify-center items-center"
            onPress={handleStart}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text className="text-white font-medium ml-2">
                  Iniciar entrenamiento
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {workoutStatus === "in_progress" && (
          <>
            <TouchableOpacity
              className="flex-1 mr-2 bg-orange-500 py-3 rounded-lg flex-row justify-center items-center"
              onPress={handlePause}
              disabled={saving}
            >
              <Ionicons name="pause" size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-2">Pausar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-600 py-3 rounded-lg flex-row justify-center items-center"
              onPress={handleComplete}
              disabled={saving}
            >
              <MaterialIcons name="done" size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-2">Completar</Text>
            </TouchableOpacity>
          </>
        )}

        {workoutStatus === "paused" && (
          <>
            <TouchableOpacity
              className="flex-1 mr-2 bg-green-600 py-3 rounded-lg flex-row justify-center items-center"
              onPress={handleResume}
              disabled={saving}
            >
              <Ionicons name="play" size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-2">Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-lg flex-row justify-center items-center"
              onPress={handleAbandon}
              disabled={saving}
            >
              <MaterialIcons name="close" size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-2">Abandonar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default WorkoutControls;
