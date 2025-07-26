import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRoute } from "@react-navigation/native";
import authService from "../services/authService";
import trainerService from "../services/trainerService";
import type { RootStackParamList, User } from "../types/index";
import type { Member, TrainerDashboard } from "../types/declarations/trainer";
import AppAlert from "../components/AppAlert";
import ScreenHeader from "../components/ScreenHeader";
import Avatar from "../components/Avatar";

type CoachHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CoachHome">;
};

const CoachHomeScreen: React.FC<CoachHomeScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dashboard, setDashboard] = useState<TrainerDashboard | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const route = useRoute();

  const loadData = async (showFullLoading = true) => {
    if (showFullLoading) setIsLoading(true);
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (user && user.id) {
        const dashboardData = await trainerService.getDashboard(user.id);
        setDashboard(dashboardData);

        const membersResponse = await trainerService.getMembers(user.id, 1, 5);
        setRecentMembers(membersResponse.members || []);
      }
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron cargar los datos del entrenador."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  useEffect(() => {
    loadData();
  }, [route.params?.refresh]);

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

  const renderMemberItem = ({ item }: { item: Member }): React.ReactElement => {
    // Parse name to get first and last name for Avatar
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
              profilePictureUrl={undefined} // Member type doesn't have profile_picture_url
              firstName={firstName}
              lastName={lastName}
              size="medium"
            />
            <View className="flex-1 ml-3">
              <Text className="text-lg font-medium text-gray-800">
                {item.name || "-"}
              </Text>
              <Text className="text-gray-600 text-sm">
                {item.email}
              </Text>
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
        <View className="flex-1 p-4">
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

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-indigo-900">
              Miembros Recientes
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 py-2 px-4 rounded-lg"
              onPress={() => navigation.navigate("MemberManagement")}
            >
              <Text className="text-white font-semibold">
                Gestionar Miembros
              </Text>
            </TouchableOpacity>
          </View>

          {recentMembers.length > 0 ? (
            <FlatList
              data={recentMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item: Member) => item.id.toString()}
              className="mb-4"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#4f46e5"]}
                />
              }
            />
          ) : (
            <View className="bg-white rounded-lg p-6 items-center justify-center mb-4">
              <Text className="text-gray-600 text-center">
                No tienes miembros asignados aún
              </Text>
            </View>
          )}

          <View className="flex-row justify-around mb-4">
            <TouchableOpacity
              className="bg-white p-4 rounded-lg shadow-sm items-center flex-1 mr-2"
              onPress={() => navigation.navigate("TrainerRoutines")}
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
