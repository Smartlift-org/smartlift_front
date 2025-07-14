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
import { useRoute } from "@react-navigation/native";
import authService from "../services/authService";
import trainerService from "../services/trainerService";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import type { RootStackParamList, MemberProfile } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MemberProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MemberProfile">;
};

const MemberProfileScreen: React.FC<MemberProfileScreenProps> = ({
  navigation
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [trainerId, setTrainerId] = useState<string>("");
  const route = useRoute();
  const { memberId } = route.params as { memberId: string };

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
        }
      } catch (error) {
        AppAlert.error("Error", "No se pudieron cargar los datos del entrenador.");
      }
    };

    loadData();
  }, [memberId]);

  const loadMemberProfile = async (trainerId: string, memberId: string) => {
    setIsLoading(true);
    try {
      const profileData = await trainerService.getMemberProfile(trainerId, memberId);
      setMemberProfile(profileData);
    } catch (error) {
      AppAlert.error(
        "Error",
        "No se pudieron cargar los datos del perfil del miembro."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, icon: keyof typeof MaterialCommunityIcons.glyphMap, color: string) => (
    <View className={`bg-white rounded-xl p-4 shadow-sm flex-1 mx-1`}>
      <View className="flex-row items-center mb-2">
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text className="text-gray-600 font-medium ml-2">{title}</Text>
      </View>
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );

  const renderActivityItem = (activity: any) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
      key={activity.id}
      onPress={() => {
        AppAlert.info(
          "Detalles de Actividad",
          `Ver detalles completos de la actividad ${activity.id}`
        );
      }}
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
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-1">
            {Math.floor(activity.duration / 60)} min
          </Text>
          
          {activity.exercises_count && (
            <>
              <MaterialCommunityIcons name="dumbbell" size={16} color="#6b7280" style={{marginLeft: 12}} />
              <Text className="text-gray-600 ml-1">
                {activity.exercises_count} ejercicios
              </Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

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
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#9ca3af" />
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
              <Text className="text-2xl font-bold text-gray-800">
                {memberProfile.first_name} {memberProfile.last_name}
              </Text>
              <Text className="text-gray-600">{memberProfile.email}</Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-gray-800 mt-6 mb-3">
            Métricas
          </Text>
          
          <View className="flex-row mb-3">
            {renderMetricCard(
              "Consistencia",
              `${memberProfile.stats?.consistency_score || 0}%`,
              "calendar-check",
              "#4f46e5"
            )}
            {renderMetricCard(
              "Entrenamientos",
              memberProfile.stats?.total_workouts || 0,
              "dumbbell",
              "#4338ca"
            )}
          </View>

          <View className="flex-row mb-3">
            {renderMetricCard(
              "Duración prom.",
              `${Math.floor((memberProfile.stats?.avg_workout_duration || 0) / 60)} min`,
              "clock-outline",
              "#10b981"
            )}
            {renderMetricCard(
              "Records",
              memberProfile.stats?.personal_records || 0,
              "trophy-outline",
              "#f59e0b"
            )}
          </View>

          {memberProfile.stats?.favorite_exercises && 
          memberProfile.stats.favorite_exercises.length > 0 && (
            <View className="bg-white rounded-xl p-4 mt-3 shadow-sm">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                Ejercicios Favoritos
              </Text>
              <View className="flex-row flex-wrap">
                {memberProfile.stats.favorite_exercises.map((exercise, index) => (
                  <View key={index} className="bg-indigo-50 rounded-full px-3 py-1 m-1">
                    <Text className="text-indigo-800">{exercise}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text className="text-xl font-bold text-gray-800 mt-6 mb-3">
            Actividad Reciente
          </Text>

          {memberProfile.recent_activity && memberProfile.recent_activity.length > 0 ? (
            memberProfile.recent_activity.map((activity) => renderActivityItem(activity))
          ) : (
            <View className="bg-white rounded-xl p-8 shadow-sm items-center">
              <MaterialCommunityIcons name="calendar-blank" size={48} color="#9ca3af" />
              <Text className="text-gray-600 mt-3 text-center">
                No hay actividad reciente para mostrar
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-indigo-600 rounded-full w-16 h-16 justify-center items-center shadow-md"
        onPress={() => {
          AppAlert.info(
            "Programar Rutina",
            "Aquí podrás programar una nueva rutina para este miembro"
          );
        }}
      >
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MemberProfileScreen;
