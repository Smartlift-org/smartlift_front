import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import useCustomAlert from "../components/useCustomAlert";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import type { RootStackParamList } from "../types";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
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

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { showAlert, AlertComponent } = useCustomAlert();
  
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
      console.error("Logout error:", error);
      showAlert({
        title: "Error",
        message: "Error al cerrar sesión. Por favor intente nuevamente."
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AlertComponent />
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-grow">
        <View className="flex-1 p-6">
          <View className="h-8"></View>

          <View className="flex-row items-center justify-end mb-8 mt-4">
            <TouchableOpacity
              onPress={handleLogout}
              className="px-4 py-2 rounded-lg bg-[#f1f3f5] border border-border"
            >
              <Text className="text-[#495057] font-medium">Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-8">
            <Text className="text-3xl font-bold text-text mb-2">
              Bienvenido a SmartLift
            </Text>
            <Text className="text-base text-textLight">
              Tu camino hacia un estilo de vida más saludable comienza aquí
            </Text>
          </View>

          <View className="bg-primary rounded-xl p-6 mb-8 shadow-sm">
            <Text className="text-white text-lg font-medium italic mb-4">
              "{getRandomQuote()}"
            </Text>
            <Text className="text-white text-right font-medium">
              - SmartLift
            </Text>
          </View>

          <Text className="text-xl font-bold text-text mb-4">
            Acciones Rápidas
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                showAlert({
                  title: "Próximamente",
                  message: "¡El seguimiento de entrenamientos estará disponible pronto!"
                })
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">💪</Text>
                </View>
                <Text className="text-text font-medium">Entrenamientos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                showAlert({
                  title: "Próximamente",
                  message: "¡El seguimiento nutricional estará disponible pronto!"
                })
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">🥗</Text>
                </View>
                <Text className="text-text font-medium">Nutrición</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                showAlert({
                  title: "Próximamente",
                  message: "¡El seguimiento de progreso estará disponible pronto!"
                })
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">📊</Text>
                </View>
                <Text className="text-text font-medium">Progreso</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                showAlert({
                  title: "Próximamente",
                  message: "¡La configuración estará disponible pronto!"
                })
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">⚙️</Text>
                </View>
                <Text className="text-text font-medium">Configuración</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
