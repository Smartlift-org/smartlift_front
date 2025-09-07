import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, User } from "../../types";
import adminService from "../../services/adminService";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";
import Avatar from "../../components/Avatar";
import { useLoadingState } from "../../hooks/useLoadingState";

type AdminUserListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminUserList">;
};

const AdminUserListScreen: React.FC<AdminUserListScreenProps> = ({
  navigation,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const { isLoading, withLoading } = useLoadingState(true);
  const { isLoading: isRefreshing, withLoading: withRefresh } = useLoadingState();

  const fetchUsers = useCallback(async () => {
    const userList = await adminService.getUsers();
    setUsers(userList);
  }, []);

  const loadUsers = useCallback(async () => {
    await withLoading(async () => {
      try {
        await fetchUsers();
      } catch (error: any) {
        AppAlert.error(
          "Error",
          error.message || "No se pudo cargar la lista de usuarios"
        );
      }
    });
  }, [withLoading, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = useCallback(async () => {
    await withRefresh(async () => {
      try {
        await fetchUsers();
      } catch (error: any) {
        AppAlert.error(
          "Error",
          error.message || "No se pudo cargar la lista de usuarios"
        );
      }
    });
  }, [withRefresh, fetchUsers]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "coach":
        return "bg-green-100 text-green-800";
      case "user":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑 ADMIN";
      case "coach":
        return "🏋️ COACH";
      case "user":
      default:
        return "👤 USUARIO";
    }
  };

  const renderUserItem = (user: User) => (
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
              <View
                className={`px-2 py-1 rounded-full ${getRoleColor(user.role)}`}
              >
                <Text
                  className={`text-xs font-medium ${
                    getRoleColor(user.role).split(" ")[1]
                  }`}
                >
                  {getRoleIcon(user.role)}
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
          className="bg-red-100 p-2 rounded-lg"
          onPress={() =>
            navigation.navigate("AdminUserDetail", { userId: user.id })
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
          title="Lista de Usuarios"
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
      <ScreenHeader
        title="Lista de Usuarios"
        onBack={() => navigation.goBack()}
      />

      <View className="flex-1 p-4">
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
          {users.length === 0 ? (
            <View className="bg-white rounded-lg shadow-sm p-8 items-center">
              <Text className="text-gray-500 text-lg mb-2">
                👥 No hay usuarios registrados
              </Text>
              <Text className="text-gray-400 text-center">
                Los usuarios aparecerán aquí cuando se registren
              </Text>
            </View>
          ) : (
            users.map(renderUserItem)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AdminUserListScreen;
