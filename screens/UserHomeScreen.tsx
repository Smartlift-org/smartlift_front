import React from "react";
import { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import type { RootStackParamList, User } from "../types";

type UserHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserHome">;
};

const inspirationalQuotes: string[] = [
  "El único mal entrenamiento es el que no sucedió.",
  "Tu cuerpo puede soportar casi cualquier cosa. Es tu mente la que tienes que convencer.",
  "Los días difíciles son los que te hacen más fuerte.",
  "El fitness no se trata de ser mejor que alguien más. Se trata de ser mejor de lo que solías ser.",
  "La diferencia entre intentar y triunfar es un pequeño esfuerzo.",
  "No lo desees, trabaja por ello.",
  "La fuerza no viene de la capacidad física. Viene de una voluntad indomable.",
  "El único lugar donde el éxito viene antes que el trabajo es en el diccionario.",
  "Tu salud es una inversión, no un gasto.",
  "Cuida tu cuerpo. Es el único lugar donde tienes que vivir.",
];

const getRandomQuote = (): string => {
  const randomIndex: number = Math.floor(
    Math.random() * inspirationalQuotes.length
  );
  return inspirationalQuotes[randomIndex];
};

const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quote, setQuote] = useState<string>(getRandomQuote());

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
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100">
        <ScreenHeader
          title={`¡Hola, ${currentUser?.first_name || "Usuario"}!`}
          rightComponent={
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                className="bg-white p-2 rounded-lg shadow-sm mr-2"
                onPress={() => navigation.navigate("BasicProfile")}
              >
                <Text className="text-indigo-600 font-medium">Mi Cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-indigo-600 py-2 px-3 rounded-lg"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold">Salir</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <ScrollView className="flex-1 p-4">

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg text-gray-600 font-medium italic">
              "{quote}"
            </Text>
          </View>

          <Text className="text-xl font-bold text-indigo-900 mb-4">
            Panel de Usuario
          </Text>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              Mi Progreso
            </Text>
            <Text className="text-gray-600 mb-4">
              Aquí verás tu progreso y estadísticas de entrenamientos.
            </Text>
            <TouchableOpacity
              className="bg-indigo-100 p-3 rounded-lg mb-2"
              onPress={() => navigation.navigate("WorkoutStats")}
            >
              <Text className="text-indigo-800 font-medium text-center">
                Ver estadísticas
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              Mi Información Personal
            </Text>
            <Text className="text-gray-600 mb-4">
              Edita tu perfil y actualiza tus datos personales.
            </Text>
            <TouchableOpacity
              className="bg-indigo-100 p-3 rounded-lg"
              onPress={() =>
                navigation.navigate("StatsProfile", { fromRedirect: false })
              }
            >
              <Text className="text-indigo-800 font-medium text-center">
                Mi Perfil Fitness
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              Mis Rutinas y Entrenamientos
            </Text>
            <Text className="text-gray-600 mb-4">
              Accede a las rutinas personalizadas y registra tus entrenamientos.
            </Text>

            <TouchableOpacity
              className="bg-indigo-600 p-3 rounded-lg mb-3"
              onPress={() => {
                navigation.navigate("ActiveWorkouts");
              }}
            >
              <Text className="text-white font-medium text-center">
                ⚡ Iniciar Entrenamiento
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-indigo-100 p-3 rounded-lg flex-1 mr-2"
                onPress={() => navigation.navigate("RoutineList")}
              >
                <Text className="text-indigo-800 font-medium text-center">
                  Ver mis rutinas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-indigo-100 p-3 rounded-lg flex-1 ml-2"
                onPress={() => navigation.navigate("WorkoutHistory")}
              >
                <Text className="text-indigo-800 font-medium text-center">
                  Historial
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              Contactar a mi Entrenador
            </Text>
            <Text className="text-gray-600 mb-4">
              Comunícate con tu entrenador para resolver dudas o solicitar
              cambios.
            </Text>
            <TouchableOpacity className="bg-indigo-100 p-3 rounded-lg">
              <Text className="text-indigo-800 font-medium text-center">
                Enviar mensaje
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default UserHomeScreen;
