import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import trainerService from "../../services/trainerService";
import authService from "../../services/authService";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import Avatar from "../../components/Avatar";
import type { RootStackParamList } from "../../types";
import type { Member } from "../../types/declarations/trainer";

type MemberSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MemberSelection">;
  route: RouteProp<RootStackParamList, "MemberSelection">;
};

const MemberSelectionScreen: React.FC<MemberSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [trainerId, setTrainerId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});

  const { routineId, customName } = route.params;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.id) {
          if (user.role !== "coach") {
            AppAlert.error(
              "Acceso denegado",
              "Solo los entrenadores pueden acceder a esta sección"
            );
            navigation.navigate("CoachHome");
            return;
          }

          setTrainerId(user.id);
          await loadMembers(user.id);
        }
      } catch (error) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar los datos del entrenador"
        );
      }
    };

    loadUser();
  }, []);

  const loadMembers = async (
    id: string,
    page: number = 1,
    search: string = searchQuery
  ) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await trainerService.getMembers(id, page, 10, {
        search,
      });

      if (page === 1) {
        setMembers(response.members || []);
      } else {
        setMembers([...members, ...(response.members || [])]);
      }

      setCurrentPage(response.meta?.current_page || 1);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      AppAlert.error("Error", "Error al cargar miembros");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMembers(trainerId, 1);
  };

  const handleLoadMore = async () => {
    if (currentPage < totalPages && !loading) {
      const nextPage = currentPage + 1;
      await loadMembers(trainerId, nextPage);
    }
  };

  const handleSearch = () => {
    loadMembers(trainerId, 1, searchQuery);
  };

  const handleAssignRoutine = async (memberId: string) => {
    try {
      const newAssigning = { ...assigning, [memberId]: true };
      setAssigning(newAssigning);

      await trainerService.assignRoutine(
        trainerId,
        memberId,
        routineId,
        customName
      );

      AppAlert.success(
        "Rutina asignada",
        "La rutina ha sido asignada correctamente al miembro"
      );

      navigation.navigate("MemberProfile", { memberId, refresh: true });

      navigation.navigate("CoachHome", { refresh: Date.now() });
    } catch (error) {
      AppAlert.error("Error", "No se pudo asignar la rutina al miembro");
    } finally {
      const finalAssigning = { ...assigning, [memberId]: false };
      setAssigning(finalAssigning);
    }
  };

  const renderMemberItem = ({ item }: { item: Member }) => {
    const nameParts = (item.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
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
              <Text className="text-gray-600">{item.email}</Text>
              {item.activity && (
                <Text className="text-gray-600 mt-1">
                  Consistencia: {item.activity.consistency_score || 0}%
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            className="bg-indigo-600 py-2 px-4 rounded-lg"
            onPress={() => handleAssignRoutine(item.id)}
            disabled={assigning[item.id]}
          >
            {assigning[item.id] ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Asignar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]" edges={["top"]}>
      <ScreenHeader
        title="Seleccionar Miembro"
        onBack={() => navigation.goBack()}
      />

      <View className="flex-1 px-4 pb-4">
        <Text className="mb-2 text-gray-700">
          Selecciona un miembro para asignarle la rutina:
        </Text>

        <View className="mb-4 flex-row">
          <TextInput
            className="flex-1 border border-gray-300 rounded-l-lg p-2 bg-white"
            placeholder="Buscar por nombre o email"
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

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0066CC" />
            <Text className="mt-2.5 text-base text-gray-700">
              Cargando miembros...
            </Text>
          </View>
        ) : (
          <>
            {members.length === 0 ? (
              <View className="flex-1 justify-center items-center pb-24">
                <MaterialCommunityIcons
                  name="account-group"
                  size={64}
                  color="#ccc"
                />
                <Text className="text-xl text-gray-600 mt-4 font-semibold">
                  No tienes miembros
                </Text>
                <Text className="text-base text-gray-500 mt-2 mb-6 text-center px-6">
                  Primero debes agregar miembros para poder asignarles rutinas
                </Text>

                <TouchableOpacity
                  className="flex-row items-center bg-[#0066CC] px-6 py-3 rounded-full mt-4"
                  onPress={() => navigation.navigate("MemberManagement")}
                >
                  <Text className="text-white font-semibold text-base">
                    Gestionar Miembros
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item: Member) => item.id.toString()}
                contentContainerClassName="py-2"
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={["#0066CC"]}
                  />
                }
                ListFooterComponent={
                  currentPage < totalPages && loading ? (
                    <View className="py-4 flex items-center">
                      <ActivityIndicator size="small" color="#0066CC" />
                    </View>
                  ) : null
                }
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MemberSelectionScreen;
