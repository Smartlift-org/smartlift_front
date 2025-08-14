import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import Avatar from "../../components/Avatar";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, User } from "../../types";
import adminService from "../../services/adminService";

type AdminUserDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminUserDetail">;
  route: RouteProp<RootStackParamList, "AdminUserDetail">;
};

interface UserDetails extends User {
  assigned_coach?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url?: string;
  };
}

const AdminUserDetailScreen: React.FC<AdminUserDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUserDetails(userId);
      setUser(data as UserDetails);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo cargar los detalles del usuario"
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Detalle del Usuario"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-gray-600 mt-2">Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Detalle del Usuario"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">
            No se encontró el usuario
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Detalle del Usuario"
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <View className="items-center mb-4">
            <Avatar
              profilePictureUrl={user.profile_picture_url}
              firstName={user.first_name}
              lastName={user.last_name}
              size="large"
            />
            <Text className="text-2xl font-bold text-gray-800 mt-3">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-gray-600 mt-1">{user.email}</Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-blue-800 text-sm font-medium">USUARIO</Text>
            </View>
          </View>

          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">ID:</Text>
              <Text className="text-gray-800 font-medium">{user.id}</Text>
            </View>
            {user.created_at && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Registrado:</Text>
                <Text className="text-gray-800 font-medium">
                  {formatDate(user.created_at)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            🏋️ Entrenador Asignado
          </Text>

          {!user.assigned_coach ? (
            <View className="items-center py-6">
              <Text className="text-gray-500 text-lg mb-2">
                Sin entrenador asignado
              </Text>
              <Text className="text-gray-400 text-center mb-4">
                Este usuario aún no tiene un entrenador asignado
              </Text>
              <TouchableOpacity className="bg-green-600 py-2 px-4 rounded-lg">
                <Text className="text-white font-semibold">
                  Asignar Entrenador
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-green-50 rounded-lg p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-row flex-1">
                  <Avatar
                    profilePictureUrl={user.assigned_coach.profile_picture_url}
                    firstName={user.assigned_coach.first_name}
                    lastName={user.assigned_coach.last_name}
                    size="medium"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-semibold text-gray-800">
                      {user.assigned_coach.first_name}{" "}
                      {user.assigned_coach.last_name}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {user.assigned_coach.email}
                    </Text>
                    <View className="bg-green-100 px-2 py-1 rounded-full mt-2 self-start">
                      <Text className="text-green-800 text-xs font-medium">
                        🏋️ ENTRENADOR
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-green-100 p-2 rounded-lg"
                  onPress={() =>
                    navigation.navigate("AdminCoachDetail", {
                      coachId: user.assigned_coach!.id,
                    })
                  }
                >
                  <Text className="text-green-800 text-xs font-medium">
                    Ver Perfil
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            📊 Estadísticas de Actividad
          </Text>

          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">0</Text>
              <Text className="text-xs text-gray-600">Rutinas</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">0</Text>
              <Text className="text-xs text-gray-600">Entrenamientos</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">0</Text>
              <Text className="text-xs text-gray-600">Días Activos</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            ⚙️ Acciones
          </Text>

          <TouchableOpacity className="bg-green-600 py-3 px-4 rounded-lg mb-3">
            <Text className="text-white font-semibold text-center">
              {user.assigned_coach
                ? "Cambiar Entrenador"
                : "Asignar Entrenador"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-lg mb-3">
            <Text className="text-white font-semibold text-center">
              Ver Rutinas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-600 py-3 px-4 rounded-lg mb-3">
            <Text className="text-white font-semibold text-center">
              Editar Información
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-red-600 py-3 px-4 rounded-lg">
            <Text className="text-white font-semibold text-center">
              Desactivar Usuario
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminUserDetailScreen;
