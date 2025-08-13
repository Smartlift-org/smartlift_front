import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import routineValidationService from "../services/routineValidationService";
import { RoutineValidation } from "../types/aiRoutines";

type RoutineValidationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoutineValidation">;
  route: RouteProp<RootStackParamList, "RoutineValidation">;
};

const RoutineValidationScreen: React.FC<RoutineValidationScreenProps> = ({ navigation, route }) => {
  const [pendingRoutines, setPendingRoutines] = useState<RoutineValidation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingRoutines();
  }, []);

  const loadPendingRoutines = async () => {
    try {
      const routines = await routineValidationService.getPendingRoutines();
      setPendingRoutines(routines);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingRoutines();
    setRefreshing(false);
  };

  const handleRoutinePress = (routine: RoutineValidation) => {
    navigation.navigate("RoutineValidationDetail", { routineId: routine.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "approved":
        return "Aprobada";
      case "rejected":
        return "Rechazada";
      default:
        return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Validar Rutinas IA"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-gray-600 mt-4">
            Cargando rutinas pendientes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Validar Rutinas IA"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Rutinas Pendientes
            </Text>
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-800 font-semibold">
                {pendingRoutines.length}
              </Text>
            </View>
          </View>

          {pendingRoutines.length === 0 ? (
            <View className="bg-white rounded-lg shadow-sm p-8 items-center">
              <FontAwesome5 name="check-circle" size={48} color="#10b981" />
              <Text className="text-lg font-semibold text-gray-800 mt-4 text-center">
                ¡Todo al día!
              </Text>
              <Text className="text-gray-600 mt-2 text-center">
                No hay rutinas pendientes de validación
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {pendingRoutines.map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  className="bg-white rounded-lg shadow-sm p-4"
                  onPress={() => handleRoutinePress(routine)}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2">
                      {routine.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${getDifficultyColor(
                        routine.difficulty
                      )}`}
                    >
                      <Text className="text-xs font-medium">
                        {getDifficultyText(routine.difficulty)}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-600 mb-3" numberOfLines={2}>
                    {routine.description}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <FontAwesome5 name="clock" size={14} color="#6b7280" />
                        <Text className="text-gray-600 ml-1 text-sm">
                          {routine.duration} min
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <FontAwesome5
                          name="dumbbell"
                          size={14}
                          color="#6b7280"
                        />
                        <Text className="text-gray-600 ml-1 text-sm">
                          {routine.exercises_count} ejercicios
                        </Text>
                      </View>
                    </View>
                    <Text
                      className={`text-sm font-medium ${getStatusColor(
                        routine.validation_status
                      )}`}
                    >
                      {getStatusText(routine.validation_status)}
                    </Text>
                  </View>

                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <FontAwesome5 name="user" size={14} color="#6b7280" />
                        <Text className="text-gray-600 ml-1 text-sm">
                          {routine.user.first_name} {routine.user.last_name}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-xs">
                        {new Date(routine.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center">
                      <FontAwesome5 name="robot" size={14} color="#4f46e5" />
                      <Text className="text-indigo-600 ml-1 text-sm font-medium">
                        Generada por IA
                      </Text>
                    </View>
                    <FontAwesome5
                      name="chevron-right"
                      size={14}
                      color="#9ca3af"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoutineValidationScreen;
