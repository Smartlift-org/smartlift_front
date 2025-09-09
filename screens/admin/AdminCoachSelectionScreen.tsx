import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import Avatar from "../../components/Avatar";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, User } from "../../types";
import adminService from "../../services/adminService";

type AdminCoachSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminCoachSelection">;
  route: RouteProp<RootStackParamList, "AdminCoachSelection">;
};

const AdminCoachSelectionScreen: React.FC<AdminCoachSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId, userName, currentCoachId } = route.params;
  const [coaches, setCoaches] = useState<User[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(currentCoachId || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const loadCoaches = async () => {
    try {
      setIsLoading(true);
      const coachList = await adminService.getCoaches();
      setCoaches(coachList);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo cargar la lista de entrenadores"
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const handleCoachSelection = (coachId: string) => {
    setSelectedCoachId(coachId);
  };

  const handleAssignCoach = async () => {
    if (!selectedCoachId) {
      AppAlert.error("Error", "Debe seleccionar un entrenador");
      return;
    }

    const selectedCoach = coaches.find(c => c.id === selectedCoachId);
    if (!selectedCoach) return;

    Alert.alert(
      "Confirmar asignación",
      `¿Estás seguro de que quieres asignar a ${selectedCoach.first_name} ${selectedCoach.last_name} como entrenador de ${userName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Asignar", style: "default", onPress: confirmAssignment },
      ]
    );
  };


  const confirmAssignment = async () => {
    if (!selectedCoachId) return;

    try {
      setIsAssigning(true);
      
      // Si ya tenía un entrenador, primero lo removemos
      if (currentCoachId && currentCoachId !== selectedCoachId) {
        await adminService.removeCoachFromUser(userId, currentCoachId);
      }
      
      // Asignamos el nuevo entrenador
      await adminService.assignCoachToUser(userId, selectedCoachId);

      const selectedCoach = coaches.find(c => c.id === selectedCoachId);
      AppAlert.success(
        "Éxito",
        `${selectedCoach?.first_name} ${selectedCoach?.last_name} ha sido asignado como entrenador de ${userName}`
      );

      navigation.goBack();
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo completar la asignación"
      );
    } finally {
      setIsAssigning(false);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCoachItem = (coach: User) => {
    const isSelected = selectedCoachId === coach.id;
    const isCurrentCoach = currentCoachId === coach.id;

    return (
      <TouchableOpacity
        key={coach.id}
        className={`rounded-lg shadow-sm p-4 mb-3 ${
          isSelected
            ? "bg-green-50 border-2 border-green-500"
            : "bg-white border border-gray-200"
        }`}
        onPress={() => handleCoachSelection(coach.id)}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-row flex-1">
            <Avatar
              profilePictureUrl={coach.profile_picture_url}
              firstName={coach.first_name}
              lastName={coach.last_name}
              size="medium"
            />
            <View className="flex-1 ml-3">
              <Text
                className={`text-lg font-semibold ${
                  isSelected ? "text-green-800" : "text-gray-800"
                }`}
              >
                {coach.first_name} {coach.last_name}
              </Text>
              <Text
                className={`mt-1 ${
                  isSelected ? "text-green-600" : "text-gray-600"
                }`}
              >
                {coach.email}
              </Text>
              <View className="flex-row items-center mt-2">
                <View
                  className={`px-2 py-1 rounded-full ${
                    isSelected ? "bg-green-200" : "bg-green-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected ? "text-green-800" : "text-green-700"
                    }`}
                  >
                    🏋️ ENTRENADOR
                  </Text>
                </View>
                {isCurrentCoach && (
                  <View className="bg-blue-100 px-2 py-1 rounded-full ml-2">
                    <Text className="text-blue-800 text-xs font-medium">
                      ACTUAL
                    </Text>
                  </View>
                )}
              </View>
              {coach.created_at && (
                <Text
                  className={`text-xs mt-1 ${
                    isSelected ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  Registrado: {formatDate(coach.created_at)}
                </Text>
              )}
            </View>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              isSelected ? "bg-green-500 border-green-500" : "border-gray-300"
            }`}
          >
            {isSelected && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Seleccionar Entrenador"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-gray-600 mt-2">Cargando entrenadores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Seleccionar Entrenador"
        onBack={() => navigation.goBack()}
      />

      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <View className="flex-row items-center">
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-800 text-lg">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                Asignar entrenador a: {userName}
              </Text>
              <Text className="text-gray-600 text-sm">
                Selecciona un entrenador de la lista
              </Text>
            </View>
          </View>
        </View>

        {selectedCoachId && (
          <View className="bg-green-50 rounded-lg p-4 mb-4">
            <Text className="text-green-800 font-semibold text-center">
              🏋️ {coaches.find(c => c.id === selectedCoachId)?.first_name} {coaches.find(c => c.id === selectedCoachId)?.last_name} seleccionado
            </Text>
          </View>
        )}

        <ScrollView className="flex-1 mb-4">
          {coaches.length === 0 ? (
            <View className="bg-white rounded-lg shadow-sm p-8 items-center">
              <Text className="text-gray-500 text-lg mb-2">
                🏋️ No hay entrenadores disponibles
              </Text>
              <Text className="text-gray-400 text-center">
                No se encontraron entrenadores en el sistema
              </Text>
            </View>
          ) : (
            coaches.map(renderCoachItem)
          )}
        </ScrollView>

        {coaches.length > 0 && (
          <View className="bg-white rounded-lg shadow-sm p-4">
            <TouchableOpacity
              className={`py-3 px-4 rounded-lg mb-3 ${
                !selectedCoachId || isAssigning
                  ? "bg-gray-400"
                  : "bg-green-600"
              }`}
              onPress={handleAssignCoach}
              disabled={!selectedCoachId || isAssigning}
            >
              {isAssigning ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Asignando...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-center">
                  ✅ Asignar Entrenador
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-600 py-3 px-4 rounded-lg"
              onPress={() => navigation.goBack()}
              disabled={isAssigning}
            >
              <Text className="text-white font-semibold text-center">
                ❌ Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AdminCoachSelectionScreen;
