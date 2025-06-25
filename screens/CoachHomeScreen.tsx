import React from "react";
import { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import type { RootStackParamList, User } from "../types";
import AppAlert from "../components/AppAlert";

type CoachHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CoachHome">;
};

// Interface for the mock user items
interface MockUser {
  id: string;
  name: string;
  progress: string;
}

// Mock data for users list (this would come from an API in a real implementation)
const mockUsers: MockUser[] = [
  { id: "1", name: "Carlos Rodríguez", progress: "70%" },
  { id: "2", name: "María López", progress: "45%" },
  { id: "3", name: "Juan Pérez", progress: "85%" },
  { id: "4", name: "Laura García", progress: "30%" },
];

const CoachHomeScreen: React.FC<CoachHomeScreenProps> = ({ navigation }) => {
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

  // Type-safe render function for FlatList
  const renderUserItem = ({ item }: { item: MockUser }): React.ReactElement => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-lg mb-3 shadow-sm"
      onPress={() => {
        AppAlert.info(
          "Detalles del Usuario",
          `Ver detalles completos de ${item.name}`
        );
      }}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-medium text-gray-800">{item.name}</Text>
        <View className="bg-indigo-100 px-3 py-1 rounded-full">
          <Text className="text-indigo-800 font-medium">Progreso: {item.progress}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1 p-4">
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-indigo-900">
              Panel de Entrenador
            </Text>
            <View className="flex-row">
              <TouchableOpacity 
                className="bg-white p-2 rounded-lg shadow-sm mr-4"
                onPress={() => navigation.navigate("BasicProfile")}
              >
                <Text className="text-indigo-600 font-medium">Mi Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-indigo-600 py-2 px-4 rounded-lg"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold">Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text className="text-lg text-gray-600">
            ¡Hola, {currentUser?.first_name || "Entrenador"}!
          </Text>
        </View>

        <View className="flex-row mb-6">
          <View className="flex-1 bg-white rounded-xl shadow-sm p-5 mr-2">
            <Text className="text-lg font-semibold text-indigo-800 mb-1">
              Usuarios Activos
            </Text>
            <Text className="text-3xl font-bold text-indigo-600">
              {mockUsers.length}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl shadow-sm p-5 ml-2">
            <Text className="text-lg font-semibold text-indigo-800 mb-1">
              Rutinas Creadas
            </Text>
            <Text className="text-3xl font-bold text-indigo-600">
              12
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <Text className="text-lg font-semibold text-indigo-800 mb-2">
            Mi Información Profesional
          </Text>
          <Text className="text-gray-600 mb-4">
            Mantén actualizado tu perfil para que tus clientes conozcan tu experiencia y especialidades.
          </Text>
          <TouchableOpacity 
            className="bg-indigo-100 p-3 rounded-lg"
            onPress={() => navigation.navigate("BasicProfile")}
          >
            <Text className="text-indigo-800 font-medium text-center">
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-indigo-900">
            Mis Usuarios
          </Text>
          <TouchableOpacity 
            className="bg-indigo-600 py-2 px-4 rounded-lg"
            onPress={() => {
              AppAlert.info(
                "Añadir Usuario",
                "Aquí podrás añadir un nuevo usuario a tu lista"
              );
            }}
          >
            <Text className="text-white font-semibold">+ Añadir Usuario</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={mockUsers}
          renderItem={renderUserItem}
          keyExtractor={(item: MockUser) => item.id}
          className="mb-4"
        />

        <View className="flex-row justify-around mb-4">
          <TouchableOpacity 
            className="bg-white p-4 rounded-lg shadow-sm items-center flex-1 mr-2"
            onPress={() => {
              AppAlert.info(
                "Gestionar Rutinas",
                "Aquí podrás crear y editar rutinas para tus usuarios"
              );
            }}
          >
            <Text className="text-indigo-800 font-medium text-center">
              Gestionar Rutinas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white p-4 rounded-lg shadow-sm items-center flex-1 ml-2"
            onPress={() => {
              AppAlert.info(
                "Estadísticas",
                "Aquí podrás ver estadísticas detalladas de tus usuarios"
              );
            }}
          >
            <Text className="text-indigo-800 font-medium text-center">
              Ver Estadísticas
            </Text>
          </TouchableOpacity>
        </View>
        </View>
  
      </SafeAreaView>
    </>
  );
};

export default CoachHomeScreen;
