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
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import Avatar from "../components/Avatar";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, User } from "../types/index";
import adminService from "../services/adminService";

type AdminAssignUsersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminAssignUsers">;
  route: RouteProp<RootStackParamList, "AdminAssignUsers">;
};

const AdminAssignUsersScreen: React.FC<AdminAssignUsersScreenProps> = ({
  navigation,
  route,
}) => {
  const { coachId, coachName } = route.params;
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const loadAvailableUsers = async () => {
    try {
      setIsLoading(true);
      const users = await adminService.getAvailableUsers();
      setAvailableUsers(users);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo cargar la lista de usuarios disponibles"
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleAssignUsers = async () => {
    if (selectedUsers.size === 0) {
      AppAlert.error("Error", "Debe seleccionar al menos un usuario");
      return;
    }

    Alert.alert(
      "Confirmar asignación",
      `¿Estás seguro de que quieres asignar ${selectedUsers.size} usuario(s) a ${coachName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Asignar", style: "default", onPress: confirmAssignment },
      ]
    );
  };

  const confirmAssignment = async () => {
    try {
      setIsAssigning(true);
      const userIds = Array.from(selectedUsers);
      await adminService.assignUsersToCoach(coachId, userIds);

      AppAlert.success(
        "Éxito",
        `Se han asignado ${selectedUsers.size} usuario(s) a ${coachName} correctamente`
      );

      navigation.goBack();
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo completar la asignación de usuarios"
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancel = () => {
    if (selectedUsers.size > 0) {
      Alert.alert(
        "Cancelar selección",
        "¿Estás seguro de que quieres cancelar? Se perderá la selección actual.",
        [
          { text: "Continuar seleccionando", style: "cancel" },
          {
            text: "Cancelar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
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

  const renderUserItem = (user: User) => {
    const isSelected = selectedUsers.has(user.id);

    return (
      <TouchableOpacity
        key={user.id}
        className={`rounded-lg shadow-sm p-4 mb-3 ${
          isSelected
            ? "bg-blue-50 border-2 border-blue-500"
            : "bg-white border border-gray-200"
        }`}
        onPress={() => toggleUserSelection(user.id)}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-row flex-1">
            <Avatar
              profilePictureUrl={user.profile_picture_url}
              firstName={user.first_name}
              lastName={user.last_name}
              size="medium"
            />
            <View className="flex-1 ml-3">
              <Text
                className={`text-lg font-semibold ${
                  isSelected ? "text-blue-800" : "text-gray-800"
                }`}
              >
                {user.first_name} {user.last_name}
              </Text>
              <Text
                className={`mt-1 ${
                  isSelected ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {user.email}
              </Text>
              <View className="flex-row items-center mt-2">
                <View
                  className={`px-2 py-1 rounded-full ${
                    isSelected ? "bg-blue-200" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected ? "text-blue-800" : "text-gray-600"
                    }`}
                  >
                    👤 USUARIO
                  </Text>
                </View>
                <Text
                  className={`text-xs ml-2 ${
                    isSelected ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  ID: {user.id}
                </Text>
              </View>
              {user.created_at && (
                <Text
                  className={`text-xs mt-1 ${
                    isSelected ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  Registrado: {formatDate(user.created_at)}
                </Text>
              )}
            </View>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
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
          title="Asignar Usuarios"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-gray-600 mt-2">Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader title="Asignar Usuarios" onBack={handleCancel} />

      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <View className="flex-row items-center">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mr-3">
              <Text className="text-green-800 text-lg">🏋️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                Asignar usuarios a: {coachName}
              </Text>
              <Text className="text-gray-600 text-sm">
                Selecciona los usuarios que quieres asignar
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-blue-50 rounded-lg p-4 mb-4">
          <Text className="text-blue-800 font-semibold text-center">
            📊 {selectedUsers.size} usuario(s) seleccionado(s)
          </Text>
        </View>

        <ScrollView className="flex-1 mb-4">
          {availableUsers.length === 0 ? (
            <View className="bg-white rounded-lg shadow-sm p-8 items-center">
              <Text className="text-gray-500 text-lg mb-2">
                👥 No hay usuarios disponibles
              </Text>
              <Text className="text-gray-400 text-center">
                Todos los usuarios ya tienen un entrenador asignado
              </Text>
            </View>
          ) : (
            availableUsers.map(renderUserItem)
          )}
        </ScrollView>

        {availableUsers.length > 0 && (
          <View className="bg-white rounded-lg shadow-sm p-4">
            <TouchableOpacity
              className={`py-3 px-4 rounded-lg mb-3 ${
                selectedUsers.size === 0 || isAssigning
                  ? "bg-gray-400"
                  : "bg-blue-600"
              }`}
              onPress={handleAssignUsers}
              disabled={selectedUsers.size === 0 || isAssigning}
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
                  ✅ Asignar{" "}
                  {selectedUsers.size > 0 ? `${selectedUsers.size} ` : ""}
                  Usuario(s)
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-600 py-3 px-4 rounded-lg"
              onPress={handleCancel}
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

export default AdminAssignUsersScreen;
