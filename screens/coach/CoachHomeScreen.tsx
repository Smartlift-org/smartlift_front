import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { User } from "../../types";
import { Member } from "../../types";
import { TrainerDashboard } from "../../types";
import authService from "../../services/authService";
import trainerService from "../../services/trainerService";
import AppAlert from "../../components/AppAlert";
import Avatar from "../../components/Avatar";
import { useLoadingState } from "../../hooks/useLoadingState";
import ScreenHeader from "../../components/ScreenHeader";

type CoachHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CoachHome">;
  route: RouteProp<RootStackParamList, "CoachHome">;
};

const CoachHomeScreen: React.FC<CoachHomeScreenProps> = ({
  navigation,
  route,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { isLoading, withLoading } = useLoadingState(true);
  const { isLoading: refreshing, withLoading: withRefresh } = useLoadingState();
  const [dashboard, setDashboard] = useState<TrainerDashboard | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);

  const fetchData = useCallback(async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);

    if (user?.id) {
      const [dashboardData, membersData] = await Promise.all([
        trainerService.getDashboard(user.id),
        trainerService.getMembers(user.id),
      ]);
      setDashboard(dashboardData);
      setRecentMembers(membersData.members);
    }
  }, []);

  const loadData = useCallback(async () => {
    await withLoading(async () => {
      try {
        await fetchData();
      } catch (error: any) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar los datos del entrenador."
        );
      }
    });
  }, [withLoading, fetchData]);

  const onRefresh = useCallback(async () => {
    await withRefresh(async () => {
      try {
        await fetchData();
      } catch (error: any) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar los datos del entrenador."
        );
      }
    });
  }, [withRefresh, fetchData]);

  useEffect(() => {
    loadData();
  }, [route.params?.refresh]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

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

  const renderMemberItem = ({ item }: { item: Member }): React.ReactElement => {
    const nameParts = (item.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-lg mb-3 shadow-sm"
        onPress={() =>
          navigation.navigate("MemberProfile", { memberId: item.id })
        }
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-row flex-1">
            <Avatar
              profilePictureUrl={undefined}
              firstName={firstName}
              lastName={lastName}
              size="medium"
            />
            <View className="flex-1 ml-3">
              <Text className="text-lg font-medium text-gray-800">
                {item.name || "-"}
              </Text>
              <Text className="text-gray-600 text-sm">{item.email}</Text>
              <View className="flex-row mt-2">
                <Text className="text-gray-600 text-sm">
                  Consistencia: {item.activity?.consistency_score || 0}%
                </Text>
              </View>
            </View>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              item.status === "active" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={
                item.status === "active" ? "text-green-800" : "text-red-800"
              }
            >
              {item.status === "active" ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">
          Cargando datos del entrenador...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100">
        <ScreenHeader
          title="Panel de Entrenador"
          rightComponent={
            <TouchableOpacity
              className="bg-indigo-600 py-2 px-4 rounded-lg"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold">Salir</Text>
            </TouchableOpacity>
          }
        />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4f46e5"]}
            />
          }
        >
          <View className="mb-6">
            <Text className="text-lg text-gray-600 mt-2">
              ¡Hola, {currentUser?.first_name || "Entrenador"}!
            </Text>
          </View>

          <View className="flex-row mb-6">
            <View className="flex-1 bg-white rounded-xl shadow-sm p-5 mr-2">
              <Text className="text-lg font-semibold text-indigo-800 mb-1">
                Miembros Activos
              </Text>
              <Text className="text-3xl font-bold text-indigo-600">
                {dashboard?.active_members_count || 0}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl shadow-sm p-5 ml-2">
              <Text className="text-lg font-semibold text-indigo-800 mb-1">
                Total Miembros
              </Text>
              <Text className="text-3xl font-bold text-indigo-600">
                {dashboard?.total_members_count || 0}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-6">
            <View className="flex-1 bg-white rounded-xl shadow-sm p-5 mr-2">
              <Text className="text-lg font-semibold text-indigo-800 mb-1">
                Entrenamientos
              </Text>
              <Text className="text-3xl font-bold text-indigo-600">
                {dashboard?.total_workouts_count || 0}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl shadow-sm p-5 ml-2">
              <Text className="text-lg font-semibold text-indigo-800 mb-1">
                Consistencia
              </Text>
              <Text className="text-3xl font-bold text-indigo-600">
                {dashboard?.avg_member_consistency || 0}%
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              Mi Información Profesional
            </Text>
            <Text className="text-gray-600 mb-4">
              Mantén actualizado tu perfil para que tus clientes conozcan tu
              experiencia y especialidades.
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

          <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              🏆 Gestión de Desafíos
            </Text>
            <Text className="text-gray-600 mb-4">
              Crea y gestiona desafíos semanales para tus miembros. Monitorea su
              progreso y rankings.
            </Text>
            <TouchableOpacity
              className="bg-orange-600 p-3 rounded-lg mb-2"
              onPress={() => navigation.navigate("CoachChallengeList")}
            >
              <Text className="text-white font-medium text-center">
                🏆 Mis Desafíos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-orange-100 p-3 rounded-lg"
              onPress={() => navigation.navigate("CreateChallenge")}
            >
              <Text className="text-orange-800 font-medium text-center">
                ➕ Crear Desafío
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              💬 Comunicación con Miembros
            </Text>
            <Text className="text-gray-600 mb-4">
              Mantente en contacto con tus miembros a través del chat integrado
              y gestiona tu lista de usuarios asignados.
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-green-100 p-3 rounded-lg flex-1 mr-2"
                onPress={() => navigation.navigate("ConversationList")}
              >
                <Text className="text-green-800 font-medium text-center">
                  💬 Ver Chats
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-indigo-100 p-3 rounded-lg flex-1 ml-2"
                onPress={() => navigation.navigate("MemberManagement")}
              >
                <Text className="text-indigo-800 font-medium text-center">
                  👥 Mis Miembros
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className="bg-white p-4 rounded-lg shadow-sm items-center flex-1 mr-2"
              onPress={() => navigation.navigate("TrainerRoutines")}
            >
              <Text className="text-indigo-800 font-medium text-center">
                Gestionar Rutinas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-yellow-50 p-4 rounded-lg shadow-sm items-center flex-1 ml-2 border border-yellow-200"
              onPress={() => navigation.navigate("RoutineValidation")}
            >
              <Text className="text-yellow-800 font-medium text-center">
                Validar Rutinas IA
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <Text className="text-lg font-semibold text-indigo-800 mb-2">
              🎥 Gestión de Ejercicios
            </Text>
            <Text className="text-gray-600 mb-4">
              Administra los videos de ejercicios para mejorar la experiencia de
              entrenamiento de tus miembros.
            </Text>
            <TouchableOpacity
              className="bg-blue-100 p-3 rounded-lg"
              onPress={() => navigation.navigate("ExerciseManagement")}
            >
              <Text className="text-blue-800 font-medium text-center">
                🎥 Gestionar Videos de Ejercicios
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default CoachHomeScreen;
