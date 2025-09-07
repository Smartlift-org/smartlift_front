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

type AdminCoachDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminCoachDetail">;
  route: RouteProp<RootStackParamList, "AdminCoachDetail">;
};

const AdminCoachDetailScreen: React.FC<AdminCoachDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { coachId } = route.params;
  const [coach, setCoach] = useState<User | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  const loadCoachDetails = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getCoachDetails(coachId);
      setCoach(data.coach);
      setAssignedUsers(data.assignedUsers);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo cargar los detalles del entrenador"
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoachDetails();
  }, [coachId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCoachDetails();
    });

    return unsubscribe;
  }, [navigation]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeactivateCoach = () => {
    if (!coach) return;

    const hasAssignedUsers = assignedUsers.length > 0;
    const warningMessage = hasAssignedUsers
      ? `¿Estás seguro de que quieres desactivar a ${coach.first_name} ${coach.last_name}?\n\nEste entrenador tiene ${assignedUsers.length} usuario(s) asignado(s). Todos los usuarios serán desasignados automáticamente.\n\n⚠️ Esta acción NO se puede deshacer.`
      : `¿Estás seguro de que quieres desactivar a ${coach.first_name} ${coach.last_name}?\n\n⚠️ Esta acción NO se puede deshacer.`;

    Alert.alert("⚠️ Confirmar Desactivación", warningMessage, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Desactivar",
        style: "destructive",
        onPress: confirmDeactivation,
      },
    ]);
  };

  const confirmDeactivation = async () => {
    if (!coach) return;

    try {
      setIsDeactivating(true);
      const result = await adminService.deactivateCoach(coach.id);

      let successMessage = result.message;
      if (result.unassignedUsersCount > 0) {
        successMessage += `\n\n${result.unassignedUsersCount} usuario(s) fueron desasignados automáticamente.`;
      }

      Alert.alert("✅ Entrenador Desactivado", successMessage, [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("AdminCoachList");
          },
        },
      ]);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo desactivar el entrenador"
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  const renderAssignedUser = (user: User) => (
    <View key={user.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-row flex-1">
          <Avatar
            profilePictureUrl={user.profile_picture_url}
            firstName={user.first_name}
            lastName={user.last_name}
            size="medium"
          />
          <View className="flex-1 ml-3">
            <Text className="text-lg font-semibold text-gray-800">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-gray-600 mt-1">{user.email}</Text>
            <View className="flex-row items-center mt-2">
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-medium">
                  👤 USUARIO
                </Text>
              </View>
              <Text className="text-gray-500 text-xs ml-2">ID: {user.id}</Text>
            </View>
            {user.created_at && (
              <Text className="text-gray-500 text-xs mt-1">
                Registrado: {formatDate(user.created_at)}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-100 p-2 rounded-lg"
          onPress={() =>
            navigation.navigate("AdminUserDetail", { userId: user.id })
          }
        >
          <Text className="text-blue-800 text-xs font-medium">Ver Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Detalle del Entrenador"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-gray-600 mt-2">Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!coach) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Detalle del Entrenador"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">
            No se encontró el entrenador
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Detalle del Entrenador"
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <View className="items-center mb-4">
            <Avatar
              profilePictureUrl={coach.profile_picture_url}
              firstName={coach.first_name}
              lastName={coach.last_name}
              size="large"
            />
            <Text className="text-2xl font-bold text-gray-800 mt-3">
              {coach.first_name} {coach.last_name}
            </Text>
            <Text className="text-gray-600 mt-1">{coach.email}</Text>
            <View className="bg-green-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-green-800 text-sm font-medium">
                ENTRENADOR
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">ID:</Text>
              <Text className="text-gray-800 font-medium">{coach.id}</Text>
            </View>
            {coach.created_at && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Registrado:</Text>
                <Text className="text-gray-800 font-medium">
                  {formatDate(coach.created_at)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            ⚙️ Acciones
          </Text>

          <TouchableOpacity
            className="bg-blue-600 py-3 px-4 rounded-lg mb-3"
            onPress={() =>
              navigation.navigate("AdminAssignUsers", {
                coachId: coach.id,
                coachName: `${coach.first_name} ${coach.last_name}`,
              })
            }
          >
            <Text className="text-white font-semibold text-center">
              Asignar Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-600 py-3 px-4 rounded-lg mb-3"
            onPress={() =>
              navigation.navigate("AdminCoachEdit", { coachId: coach.id })
            }
          >
            <Text className="text-white font-semibold text-center">
              Editar Información
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-3 px-4 rounded-lg ${
              isDeactivating ? "bg-gray-400" : "bg-red-600"
            }`}
            onPress={handleDeactivateCoach}
            disabled={isDeactivating}
          >
            {isDeactivating ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">
                  Desactivando...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-center">
                Desactivar Entrenador
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            👥 Usuarios Asignados ({assignedUsers.length})
          </Text>

          {assignedUsers.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-lg mb-2">
                Sin usuarios asignados
              </Text>
              <Text className="text-gray-400 text-center">
                Este entrenador aún no tiene usuarios bajo su supervisión
              </Text>
            </View>
          ) : (
            <View>{assignedUsers.map(renderAssignedUser)}</View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCoachDetailScreen;
