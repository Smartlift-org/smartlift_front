import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, User } from "../types/index";
import adminService from "../services/adminService";

type AdminCoachListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminCoachList">;
};

const AdminCoachListScreen: React.FC<AdminCoachListScreenProps> = ({
  navigation,
}) => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadCoaches = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const coachList = await adminService.getCoaches();
      setCoaches(coachList);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo cargar la lista de entrenadores"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const onRefresh = () => {
    loadCoaches(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCoachItem = (coach: User) => (
    <View key={coach.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {coach.first_name} {coach.last_name}
          </Text>
          <Text className="text-gray-600 mt-1">{coach.email}</Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-green-800 text-xs font-medium">
                🏋️ ENTRENADOR
              </Text>
            </View>
            <Text className="text-gray-500 text-xs ml-2">ID: {coach.id}</Text>
          </View>
          {coach.created_at && (
            <Text className="text-gray-500 text-xs mt-1">
              Registrado: {formatDate(coach.created_at)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          className="bg-red-100 p-2 rounded-lg"
          onPress={() =>
            navigation.navigate("AdminCoachDetail", { coachId: coach.id })
          }
        >
          <Text className="text-red-800 text-xs font-medium">Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Lista de Entrenadores"
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
        title="Lista de Entrenadores"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            className="bg-red-600 py-2 px-3 rounded-lg"
            onPress={() => navigation.navigate("AdminRegisterCoach")}
          >
            <Text className="text-white font-semibold text-xs">+ Nuevo</Text>
          </TouchableOpacity>
        }
      />

      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-red-800 font-semibold text-center">
            📊 Total de Entrenadores: {coaches.length}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#dc2626"]}
              tintColor="#dc2626"
            />
          }
        >
          {coaches.length === 0 ? (
            <View className="bg-white rounded-lg shadow-sm p-8 items-center">
              <Text className="text-gray-500 text-lg mb-2">
                🏋️ No hay entrenadores registrados
              </Text>
              <Text className="text-gray-400 text-center mb-4">
                Registra el primer entrenador para comenzar
              </Text>
              <TouchableOpacity
                className="bg-red-600 py-3 px-6 rounded-lg"
                onPress={() => navigation.navigate("AdminRegisterCoach")}
              >
                <Text className="text-white font-semibold">
                  Registrar Entrenador
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            coaches.map(renderCoachItem)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AdminCoachListScreen;
