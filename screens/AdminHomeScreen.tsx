import React, { useLayoutEffect, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import Avatar from "../components/Avatar";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import type { RootStackParamList, User } from "../types/index";

type AdminHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminHome">;
};

const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUserData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudo cerrar la sesión. Inténtalo de nuevo."
      );
    }
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title={`Panel de Administrador`}
          rightComponent={
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                className="bg-white p-2 rounded-lg shadow-sm mr-2"
                onPress={() => navigation.navigate("BasicProfile")}
              >
                <Text className="text-red-600 font-medium">Mi Cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-600 py-2 px-3 rounded-lg"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold">Salir</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <ScrollView className="flex-1 p-4">
          <Text className="text-xl font-bold text-red-900 mb-4">
            ¡Hola, {currentUser?.first_name || "Administrador"}!
          </Text>

          {/* Admin Profile Section */}
          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <View className="flex-row items-center">
              <Avatar
                profilePictureUrl={currentUser?.profile_picture_url}
                firstName={currentUser?.first_name || ""}
                lastName={currentUser?.last_name || ""}
                size="large"
              />
              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-gray-800">
                  {currentUser?.first_name} {currentUser?.last_name}
                </Text>
                <Text className="text-gray-600 mt-1">
                  {currentUser?.email}
                </Text>
                <View className="bg-red-100 px-3 py-1 rounded-full mt-2 self-start">
                  <Text className="text-red-800 text-sm font-medium">
                    👑 ADMINISTRADOR
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-red-800 mb-2">
              🏋️ Gestión de Entrenadores
            </Text>
            <Text className="text-gray-600 mb-4">
              Registra nuevos entrenadores y gestiona la lista de coaches.
            </Text>

            <TouchableOpacity
              className="bg-red-600 p-3 rounded-lg mb-3"
              onPress={() => navigation.navigate("AdminRegisterCoach")}
            >
              <Text className="text-white font-medium text-center">
                ➕ Registrar Nuevo Entrenador
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-100 p-3 rounded-lg"
              onPress={() => navigation.navigate("AdminCoachList")}
            >
              <Text className="text-red-800 font-medium text-center">
                📋 Ver Lista de Entrenadores
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-red-800 mb-2">
              👥 Gestión de Usuarios
            </Text>
            <Text className="text-gray-600 mb-4">
              Visualiza y administra todos los usuarios registrados.
            </Text>

            <TouchableOpacity
              className="bg-red-100 p-3 rounded-lg"
              onPress={() => navigation.navigate("AdminUserList")}
            >
              <Text className="text-red-800 font-medium text-center">
                📋 Ver Lista de Usuarios
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-red-800 mb-2">
              📊 Estadísticas del Sistema
            </Text>
            <Text className="text-gray-600 mb-4">
              Visualiza estadísticas generales de la plataforma.
            </Text>

            <TouchableOpacity className="bg-red-100 p-3 rounded-lg">
              <Text className="text-red-800 font-medium text-center">
                📈 Ver Estadísticas
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-red-800 mb-2">
              ⚙️ Configuración del Sistema
            </Text>
            <Text className="text-gray-600 mb-4">
              Configuraciones avanzadas y mantenimiento.
            </Text>

            <TouchableOpacity className="bg-red-100 p-3 rounded-lg">
              <Text className="text-red-800 font-medium text-center">
                🔧 Configuraciones
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default AdminHomeScreen;
