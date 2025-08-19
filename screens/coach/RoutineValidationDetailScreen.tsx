import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import RoutineEditModal from "../../components/RoutineEditModal";
import routineValidationService from "../../services/routineValidationService";

type RoutineValidationDetailScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "RoutineValidationDetail"
  >;
  route: RouteProp<RootStackParamList, "RoutineValidationDetail">;
};

const RoutineValidationDetailScreen: React.FC<
  RoutineValidationDetailScreenProps
> = ({ navigation, route }) => {
  const { routineId } = route.params;
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadRoutineDetails();
  }, []);

  const loadRoutineDetails = async () => {
    try {
      const routineData = await routineValidationService.getRoutineDetails(
        routineId
      );
      setRoutine(routineData);
    } catch (error: any) {
      AppAlert.error("Error", error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setActionType("approve");
    setShowNotesInput(true);
  };

  const handleReject = () => {
    setActionType("reject");
    setShowNotesInput(true);
  };

  const confirmAction = async () => {
    if (actionType === "reject" && !notes.trim()) {
      AppAlert.error(
        "Error",
        "Las notas son obligatorias para rechazar una rutina"
      );
      return;
    }

    setValidating(true);
    try {
      if (actionType === "approve") {
        await routineValidationService.approveRoutine(
          routineId,
          notes.trim() || undefined
        );
        AppAlert.success(
          "¡Rutina aprobada!",
          "La rutina ha sido aprobada exitosamente"
        );
      } else if (actionType === "reject") {
        await routineValidationService.rejectRoutine(routineId, notes.trim());
        AppAlert.success("Rutina rechazada", "La rutina ha sido rechazada");
      }

      navigation.goBack();
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setValidating(false);
      setShowNotesInput(false);
      setActionType(null);
      setNotes("");
    }
  };

  const cancelAction = () => {
    setShowNotesInput(false);
    setActionType(null);
    setNotes("");
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSave = async (editData: any) => {
    setEditing(true);
    try {
      const updatedRoutine = await routineValidationService.editRoutine(
        routineId,
        editData
      );
      
      setRoutine(updatedRoutine);
      setShowEditModal(false);
      
      if (editData.auto_validate) {
        AppAlert.success(
          "¡Rutina editada y validada!",
          "La rutina ha sido editada y aprobada automáticamente"
        );
        navigation.goBack();
      } else {
        AppAlert.success(
          "¡Rutina editada!",
          "Los cambios han sido guardados exitosamente"
        );
      }
    } catch (error: any) {
      AppAlert.error("Error", error.message);
    } finally {
      setEditing(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
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
          title="Validar Rutina"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-gray-600 mt-4">Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Validar Rutina"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">No se pudo cargar la rutina</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="Validar Rutina" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-4">
        <View className="py-4">
          {/* Header de la rutina */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xl font-bold text-gray-800 flex-1 mr-2">
                {routine.name}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${getDifficultyColor(
                  routine.difficulty
                )}`}
              >
                <Text className="text-sm font-medium">
                  {getDifficultyText(routine.difficulty)}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 mb-4">{routine.description}</Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <FontAwesome5 name="clock" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">
                    {routine.duration} minutos
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome5 name="dumbbell" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">
                    {routine.routine_exercises?.length || 0} ejercicios
                  </Text>
                </View>
              </View>
            </View>

            <View className="pt-3 border-t border-gray-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <FontAwesome5 name="user" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">
                    {routine.user?.first_name} {routine.user?.last_name}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome5 name="robot" size={16} color="#4f46e5" />
                  <Text className="text-indigo-600 ml-2 font-medium">
                    Generada por IA
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Lista de ejercicios */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Ejercicios de la rutina
            </Text>

            {routine.routine_exercises?.map(
              (routineExercise: any, index: number) => (
                <View key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-base font-medium text-gray-800 flex-1">
                      {routineExercise.exercise?.name ||
                        `Ejercicio ID: ${routineExercise.exercise_id}`}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      #{routineExercise.order}
                    </Text>
                  </View>

                  <View className="flex-row items-center space-x-4">
                    <Text className="text-sm text-gray-600">
                      {routineExercise.sets} series
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {routineExercise.reps} repeticiones
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {routineExercise.rest_time}s descanso
                    </Text>
                  </View>

                  {routineExercise.exercise?.primary_muscles && (
                    <View className="mt-2">
                      <Text className="text-xs text-gray-500">
                        Músculos:{" "}
                        {routineExercise.exercise.primary_muscles.join(", ")}
                      </Text>
                    </View>
                  )}
                </View>
              )
            )}
          </View>

          {/* Información de validación */}
          {routine.validation_info && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Estado de validación
              </Text>
              <View className="flex-row items-center">
                <FontAwesome5
                  name="exclamation-triangle"
                  size={16}
                  color="#f59e0b"
                />
                <Text className="text-yellow-600 ml-2 font-medium">
                  Pendiente de validación
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {routine.validation_status === "pending" && !showNotesInput && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Acciones de Validación
              </Text>
              
              {/* Edit Button */}
              <TouchableOpacity
                onPress={handleEdit}
                disabled={validating || editing}
                className="bg-blue-500 py-3 px-4 rounded-lg mb-3"
              >
                <View className="flex-row items-center justify-center">
                  <FontAwesome5 name="edit" size={16} color="white" />
                  <Text className="text-white text-center font-semibold ml-2">
                    ✏️ Editar Rutina
                  </Text>
                </View>
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setActionType("approve");
                    setShowNotesInput(true);
                  }}
                  disabled={validating || editing}
                  className="flex-1 bg-green-500 py-3 px-4 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    ✓ Aprobar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setActionType("reject");
                    setShowNotesInput(true);
                  }}
                  disabled={validating || editing}
                  className="flex-1 bg-red-500 py-3 px-4 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    ✗ Rechazar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Input de notas */}
          {showNotesInput && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                {actionType === "approve"
                  ? "Notas de aprobación (opcional)"
                  : "Notas de rechazo (obligatorio)"}
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[100px]"
                placeholder={
                  actionType === "approve"
                    ? "Agrega comentarios sobre la rutina (opcional)..."
                    : "Explica por qué rechazas esta rutina..."
                }
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Confirmation Buttons */}
          {showNotesInput && (
            <View className="flex-row space-x-3 mb-8">
              <TouchableOpacity
                className="flex-1 bg-gray-500 py-4 rounded-lg"
                onPress={cancelAction}
                disabled={validating}
              >
                <Text className="text-white font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-4 rounded-lg ${
                  actionType === "approve" ? "bg-green-600" : "bg-red-600"
                }`}
                onPress={confirmAction}
                disabled={validating}
              >
                {validating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">
                    {actionType === "approve"
                      ? "Confirmar Aprobación"
                      : "Confirmar Rechazo"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <RoutineEditModal
        visible={showEditModal}
        routine={routine}
        onClose={handleEditCancel}
        onSave={handleEditSave}
        loading={editing}
      />
    </SafeAreaView>
  );
};

export default RoutineValidationDetailScreen;
