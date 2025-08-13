import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import authService from "../services/authService";
import trainerService from "../services/trainerService";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import Avatar from "../components/Avatar";
import type { RootStackParamList } from "../types/index";
import type { MemberProfile } from "../types/declarations/trainer";
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";

type MemberProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MemberProfile">;
  route: RouteProp<RootStackParamList, "MemberProfile">;
};

const MemberProfileScreen: React.FC<MemberProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(
    null
  );
  const [trainerId, setTrainerId] = useState<string>("");
  const [routines, setRoutines] = useState<any[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState<boolean>(false);
  const { memberId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.id) {
          setTrainerId(user.id);
          await loadMemberProfile(user.id, memberId);
          await loadMemberRoutines(user.id, memberId);
        }
      } catch (error) {
        AppAlert.error(
          "Error",
          "No se pudieron cargar los datos del entrenador."
        );
      }
    };

    loadData();
  }, [memberId, route.params?.refresh]);

  const loadMemberProfile = async (trainerId: string, memberId: string) => {
    setIsLoading(true);
    try {
      const profileData = await trainerService.getMemberProfile(
        trainerId,
        memberId
      );
      setMemberProfile(profileData as MemberProfile);
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron cargar los datos del perfil del miembro."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadMemberRoutines = async (trainerId: string, memberId: string) => {
    setLoadingRoutines(true);
    try {
      const response = await trainerService.getMemberRoutines(
        trainerId,
        memberId
      );
      setRoutines(response.routines || []);
    } catch (error) {
      AppAlert.error("Error", "No se pudieron cargar las rutinas del miembro.");
    } finally {
      setLoadingRoutines(false);
    }
  };

  const handleDeleteRoutine = (routineId: string) => {
    AppAlert.confirm(
      "Eliminar rutina",
      "¿Estás seguro de que deseas eliminar esta rutina del miembro?",
      async () => {
        try {
          await trainerService.deleteMemberRoutine(
            trainerId,
            memberId,
            routineId
          );
          setRoutines(routines.filter((r) => r.id !== routineId));
          AppAlert.success("Éxito", "Rutina eliminada correctamente");
        } catch (error) {
          AppAlert.error("Error", "No se pudo eliminar la rutina");
        }
      }
    );
  };

  const renderMetricCard = (
    title: string,
    value: number,
    iconName: any,
    iconColor: string
  ) => {
    return (
      <View className="items-center p-3">
        <MaterialCommunityIcons name={iconName} size={28} color={iconColor} />
        <Text className="text-gray-900 font-bold mt-1 text-lg">{value}</Text>
        <Text className="text-gray-600 text-xs">{title}</Text>
      </View>
    );
  };

  const renderActivityItem = (activity: any) => {
    return (
      <TouchableOpacity
        key={activity.id}
        className="bg-white p-4 mb-3 rounded-lg shadow-sm"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-medium text-gray-800">
              {activity.type || "Entrenamiento"}
            </Text>
            <Text className="text-sm text-gray-500">
              {new Date(activity.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              activity.status === "completed"
                ? "bg-green-100"
                : activity.status === "in_progress"
                ? "bg-yellow-100"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={
                activity.status === "completed"
                  ? "text-green-800"
                  : activity.status === "in_progress"
                  ? "text-yellow-800"
                  : "text-gray-800"
              }
            >
              {activity.status === "completed"
                ? "Completado"
                : activity.status === "in_progress"
                ? "En progreso"
                : "Pendiente"}
            </Text>
          </View>
        </View>

        {activity.duration && (
          <View className="flex-row mt-2">
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#6b7280"
            />
            <Text className="text-gray-600 ml-1">
              {Math.floor(activity.duration / 60)} min
            </Text>

            {activity.exercises_count && (
              <>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={16}
                  color="#6b7280"
                  style={{ marginLeft: 12 }}
                />
                <Text className="text-gray-600 ml-1">
                  {activity.exercises_count} ejercicios
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!memberProfile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center p-4">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#9ca3af"
          />
          <Text className="text-xl font-bold text-gray-700 mt-4">
            Perfil no encontrado
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            No se pudo cargar la información del miembro.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-indigo-600 py-3 px-6 rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-medium">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        <View className="p-4">
          <ScreenHeader
            title="Perfil de Miembro"
            rightComponent={
              <TouchableOpacity
                className="bg-indigo-600 p-2 rounded-lg"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-white font-medium">Volver</Text>
              </TouchableOpacity>
            }
          />

          <View className="bg-white rounded-xl p-5 mt-3 shadow-sm">
            <View className="items-center mb-4">
              {memberProfile && (
                <>
                  <Avatar
                    profilePictureUrl={memberProfile.profile_picture_url}
                    firstName={memberProfile.first_name}
                    lastName={memberProfile.last_name}
                    size="large"
                  />
                  <Text className="text-2xl font-bold text-gray-800 mt-3">
                    {memberProfile.first_name} {memberProfile.last_name}
                  </Text>
                  <Text className="text-gray-600">{memberProfile.email}</Text>
                </>
              )}
            </View>
          </View>

          <Text className="text-xl font-bold text-gray-800 mt-6 mb-3">
            Métricas
          </Text>

          <View className="flex flex-row justify-around mt-6 bg-white rounded-xl py-2 mx-4 shadow-sm">
            {memberProfile &&
              renderMetricCard(
                "Consistencia",
                Number(memberProfile.stats?.consistency_score || 0),
                "calendar-check",
                "#FF9500"
              )}
            {memberProfile &&
              renderMetricCard(
                "Entrenamientos",
                Number(memberProfile.stats?.total_workouts || 0),
                "dumbbell",
                "#4338ca"
              )}
          </View>

          <View className="flex-row mb-3">
            {memberProfile &&
              renderMetricCard(
                "Duración prom.",
                Math.floor(
                  (memberProfile.stats?.avg_workout_duration || 0) / 60
                ),
                "clock-outline",
                "#10b981"
              )}
            {memberProfile &&
              renderMetricCard(
                "Records",
                Number(memberProfile.stats?.personal_records || 0),
                "trophy-outline",
                "#f59e0b"
              )}
          </View>

          {memberProfile &&
            memberProfile.stats?.favorite_exercises &&
            memberProfile.stats.favorite_exercises.length > 0 && (
              <View className="bg-white rounded-xl p-4 mt-3 shadow-sm">
                <Text className="text-lg font-bold text-gray-800 mb-2">
                  Ejercicios Favoritos
                </Text>
                <View className="flex-row flex-wrap">
                  {memberProfile.stats.favorite_exercises.map(
                    (exercise, index) => (
                      <View
                        key={index}
                        className="bg-indigo-50 rounded-full px-3 py-1 m-1"
                      >
                        <Text className="text-indigo-800">{exercise}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}

          <View className="flex-row justify-between items-center mt-6 mb-3">
            <Text className="text-xl font-bold text-gray-800">
              Rutinas Asignadas
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-3 py-1 rounded-lg flex-row items-center"
              onPress={() => navigation.navigate("TrainerRoutines")}
            >
              <Text className="text-white font-medium mr-1">Asignar</Text>
              <AntDesign name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {loadingRoutines ? (
            <View className="bg-white rounded-xl p-6 shadow-sm items-center justify-center">
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text className="text-gray-600 mt-3">Cargando rutinas...</Text>
            </View>
          ) : routines.length === 0 ? (
            <View className="bg-white rounded-xl p-8 shadow-sm items-center">
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={48}
                color="#9ca3af"
              />
              <Text className="text-gray-600 mt-3 text-center">
                No hay rutinas asignadas a este miembro
              </Text>
              <TouchableOpacity
                className="mt-4 bg-indigo-100 py-2 px-4 rounded-lg"
                onPress={() => navigation.navigate("TrainerRoutines")}
              >
                <Text className="text-indigo-800 font-medium">
                  Asignar rutina
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            routines.map((routine) => (
              <View
                key={routine.id}
                className="bg-white rounded-lg p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-medium text-gray-800">
                    {routine.name}
                  </Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      className="p-2"
                      onPress={() =>
                        navigation.navigate("MemberRoutineEdit", {
                          routineId: routine.id,
                          memberId: memberId,
                          refresh: true,
                        })
                      }
                    >
                      <Feather name="edit" size={18} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => handleDeleteRoutine(routine.id)}
                    >
                      <Feather name="trash-2" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {routine.description && (
                  <Text className="text-gray-600 mt-1">
                    {routine.description}
                  </Text>
                )}

                <View className="flex-row mt-2 justify-between">
                  <Text className="text-gray-700">
                    {routine.routine_exercises?.length || 0} ejercicios
                  </Text>
                  <Text className="text-gray-700">
                    Dificultad: {routine.difficulty || "No especificada"}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text className="text-xl font-bold text-gray-800 mt-6 mb-3">
            Actividad Reciente
          </Text>

          {memberProfile &&
          memberProfile.recent_activity &&
          memberProfile.recent_activity.length > 0 ? (
            memberProfile.recent_activity.map((activity) =>
              renderActivityItem(activity)
            )
          ) : (
            <View className="bg-white rounded-xl p-8 shadow-sm items-center">
              <MaterialCommunityIcons
                name="calendar-blank"
                size={48}
                color="#9ca3af"
              />
              <Text className="text-gray-600 mt-3 text-center">
                No hay actividad reciente para mostrar
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-indigo-600 rounded-full w-16 h-16 justify-center items-center shadow-md"
        onPress={() => navigation.navigate("TrainerRoutines")}
      >
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MemberProfileScreen;
