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
import type { RootStackParamList, User } from "../types";
import adminService from "../services/adminService";

type AdminUserListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminUserList">;
};

const AdminUserListScreen: React.FC<AdminUserListScreenProps> = ({
  navigation,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadUsers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const userList = await adminService.getUsers();
      setUsers(userList);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo cargar la lista de usuarios"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    loadUsers(true);
  };

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
        <View className="flex-1">
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
        <TouchableOpacity className="bg-red-100 p-2 rounded-lg">
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

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    coaches: users.filter((u) => u.role === "coach").length,
    basicUsers: users.filter((u) => u.role === "user").length,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Lista de Usuarios"
        onBack={() => navigation.goBack()}
      />

      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-red-800 font-semibold text-center mb-2">
            📊 Estadísticas de Usuarios
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {userStats.total}
              </Text>
              <Text className="text-xs text-gray-600">Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600">
                {userStats.admins}
              </Text>
              <Text className="text-xs text-gray-600">Admins</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {userStats.coaches}
              </Text>
              <Text className="text-xs text-gray-600">Coaches</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {userStats.basicUsers}
              </Text>
              <Text className="text-xs text-gray-600">Usuarios</Text>
            </View>
          </View>
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
