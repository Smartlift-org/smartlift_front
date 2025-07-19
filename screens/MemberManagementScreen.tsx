import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import trainerService from "../services/trainerService";
import authService from "../services/authService";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import type { RootStackParamList, Member, AvailableUser } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MemberManagementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MemberManagement">;
};

const MemberManagementScreen: React.FC<MemberManagementScreenProps> = ({
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [trainerId, setTrainerId] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableUsersLoading, setAvailableUsersLoading] =
    useState<boolean>(false);
  const [availableUsersPage, setAvailableUsersPage] = useState<number>(1);
  const [availableUsersTotalPages, setAvailableUsersTotalPages] =
    useState<number>(1);
  const [availableUsersSearch, setAvailableUsersSearch] = useState<string>("");
  const [assigningUser, setAssigningUser] = useState<boolean>(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.id) {
          setTrainerId(user.id);
          await loadMembers(user.id);
        }
      } catch (error) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar los datos del entrenador."
        );
      }
    };

    loadUserData();
  }, []);

  const loadMembers = async (
    id: string,
    page: number = 1,
    search: string = searchQuery,
    status: string = statusFilter
  ) => {
    setIsLoading(true);
    try {
      const response = await trainerService.getMembers(id, page, 10, {
        search,
        status,
      });

      setMembers(response.members || []);
      setCurrentPage(response.meta?.current_page || 1);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      AppAlert.error("Error", "No se pudieron cargar los miembros.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMembers(trainerId, 1);
  };

  const handleSearch = () => {
    loadMembers(trainerId, 1, searchQuery);
  };

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
    loadMembers(trainerId, 1, searchQuery, status);
  };

  const handleMemberPress = (memberId: string) => {
    navigation.navigate("MemberProfile", { memberId });
  };

  const renderMemberItem = ({ item }: { item: Member }) => {
    const isActive = item.activity?.activity_status !== "inactive";

    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-lg mb-3 shadow-sm"
        onPress={() => handleMemberPress(item.id)}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-medium text-gray-800">
              {item.name || "-"}
            </Text>
            <Text className="text-sm text-gray-500">{item.email}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              isActive ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text className={isActive ? "text-green-800" : "text-red-800"}>
              {isActive ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
        <View className="flex-row mt-2 justify-between">
          <View className="flex-row items-center">
            <Text className="text-gray-600">
              Entrenamientos: {item.activity?.total_workouts || 0}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-600">
              Consistencia: {item.activity?.consistency_score || 0}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      loadMembers(trainerId, currentPage + 1);
    }
  };

  const loadAvailableUsers = async (page: number = 1, search: string = "") => {
    if (!trainerId) return;

    setAvailableUsersLoading(true);
    try {
      const response = await trainerService.getAvailableUsers(
        trainerId,
        page,
        10,
        search
      );

      const responseMembers = response.members || [];
      if (page === 1) {
        setAvailableUsers(responseMembers);
      } else {
        setAvailableUsers([...availableUsers, ...responseMembers]);
      }

      setAvailableUsersPage(response.meta?.current_page || 1);
      setAvailableUsersTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron cargar los usuarios disponibles."
      );
    } finally {
      setAvailableUsersLoading(false);
    }
  };

  const handleAvailableUsersSearch = () => {
    loadAvailableUsers(1, availableUsersSearch);
  };

  const handleLoadMoreAvailableUsers = () => {
    if (
      availableUsersPage < availableUsersTotalPages &&
      !availableUsersLoading
    ) {
      loadAvailableUsers(availableUsersPage + 1, availableUsersSearch);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!trainerId) return;

    setAssigningUser(true);
    try {
      await trainerService.assignMember(trainerId, userId);

      const updatedUsers = availableUsers.filter((user) => user.id !== userId);
      setAvailableUsers(updatedUsers);

      await loadMembers(trainerId);

      AppAlert.success("Éxito", "Usuario asignado correctamente.");
      setModalVisible(false);

      navigation.navigate("CoachHome", { refresh: Date.now() });
    } catch (error) {
      AppAlert.error("Error", "No se pudo asignar el usuario.");
    } finally {
      setAssigningUser(false);
    }
  };

  const openAssignModal = () => {
    setModalVisible(true);
    setAvailableUsersSearch("");
    loadAvailableUsers(1, "");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        <ScreenHeader
          title="Gestión de Miembros"
          rightComponent={
            <TouchableOpacity
              className="bg-indigo-600 p-2 rounded-lg"
              onPress={() => navigation.navigate("CoachHome")}
            >
              <Text className="text-white font-medium">Volver</Text>
            </TouchableOpacity>
          }
        />

        <View className="flex-row bg-white rounded-lg shadow-sm mb-4 mt-2">
          <TextInput
            className="flex-1 px-4 py-2"
            placeholder="Buscar miembros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            className="bg-indigo-600 rounded-r-lg px-4 justify-center"
            onPress={handleSearch}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-4 justify-between">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg mr-2 ${
              statusFilter === "" ? "bg-indigo-600" : "bg-white"
            }`}
            onPress={() => handleFilterByStatus("")}
          >
            <Text
              className={`font-medium ${
                statusFilter === "" ? "text-white" : "text-gray-800"
              }`}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg mr-2 ${
              statusFilter === "active" ? "bg-indigo-600" : "bg-white"
            }`}
            onPress={() => handleFilterByStatus("active")}
          >
            <Text
              className={`font-medium ${
                statusFilter === "active" ? "text-white" : "text-gray-800"
              }`}
            >
              Activos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              statusFilter === "inactive" ? "bg-indigo-600" : "bg-white"
            }`}
            onPress={() => handleFilterByStatus("inactive")}
          >
            <Text
              className={`font-medium ${
                statusFilter === "inactive" ? "text-white" : "text-gray-800"
              }`}
            >
              Inactivos
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="mt-2 text-gray-600">Cargando miembros...</Text>
          </View>
        ) : members.length > 0 ? (
          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={(item: Member) => item.id.toString()}
            className="pt-2"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#4f46e5"]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              currentPage < totalPages && (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#4f46e5" />
                </View>
              )
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <MaterialCommunityIcons
              name="account-off-outline"
              size={64}
              color="#9ca3af"
            />
            <Text className="mt-4 text-lg text-gray-600">No hay miembros</Text>
            <Text className="text-gray-500 text-center mt-2">
              {searchQuery || statusFilter
                ? "Prueba con otros filtros de búsqueda"
                : "Aún no tienes miembros asignados"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-indigo-600 rounded-full w-16 h-16 justify-center items-center shadow-md"
          onPress={openAssignModal}
        >
          <Text className="text-white text-3xl">+</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-5 h-3/4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  Asignar nuevos miembros
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text className="text-2xl text-gray-600">×</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row bg-gray-100 rounded-lg mb-4">
                <TextInput
                  className="flex-1 py-2 px-4"
                  placeholder="Buscar usuarios..."
                  value={availableUsersSearch}
                  onChangeText={setAvailableUsersSearch}
                  onSubmitEditing={handleAvailableUsersSearch}
                />
                <TouchableOpacity
                  className="bg-indigo-600 rounded-r-lg px-4 justify-center"
                  onPress={handleAvailableUsersSearch}
                >
                  <MaterialCommunityIcons
                    name="magnify"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              {availableUsersLoading && availableUsers.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#4f46e5" />
                  <Text className="mt-2 text-gray-600">
                    Cargando usuarios disponibles...
                  </Text>
                </View>
              ) : availableUsers.length > 0 ? (
                <FlatList
                  data={availableUsers}
                  renderItem={({ item }: { item: AvailableUser }) => (
                    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-lg font-medium text-gray-800">
                            {item.first_name} {item.last_name}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {item.email}
                          </Text>
                        </View>
                        <TouchableOpacity
                          className="bg-indigo-600 py-2 px-4 rounded-lg"
                          onPress={() => handleAssignUser(item.id)}
                          disabled={assigningUser}
                        >
                          {assigningUser ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Text className="text-white font-medium">
                              Asignar
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item: AvailableUser) => item.id}
                  onEndReached={handleLoadMoreAvailableUsers}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={(): React.ReactElement | null =>
                    availableUsersPage < availableUsersTotalPages &&
                    availableUsersLoading ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#4f46e5" />
                      </View>
                    ) : null
                  }
                  ListEmptyComponent={(): React.ReactElement => (
                    <View className="flex-1 justify-center items-center py-12">
                      <MaterialCommunityIcons
                        name="help-circle"
                        size={48}
                        color="#9ca3af"
                      />
                      <Text className="mt-4 text-lg text-gray-600">
                        No hay usuarios disponibles
                      </Text>
                      <Text className="text-gray-500 text-center mt-2">
                        Todos los usuarios ya están asignados o no hay usuarios
                        registrados
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <MaterialCommunityIcons
                    name="help-circle"
                    size={48}
                    color="#9ca3af"
                  />
                  <Text className="mt-4 text-lg text-gray-600">
                    No hay usuarios disponibles
                  </Text>
                  <Text className="text-gray-500 text-center mt-2">
                    Todos los usuarios ya están asignados o no hay usuarios
                    registrados
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default MemberManagementScreen;
