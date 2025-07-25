import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import AppAlert from "../components/AppAlert";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, User } from "../types/index";
import adminService from "../services/adminService";

type AdminCoachEditScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminCoachEdit">;
  route: RouteProp<RootStackParamList, "AdminCoachEdit">;
};

const AdminCoachEditScreen: React.FC<AdminCoachEditScreenProps> = ({
  navigation,
  route,
}) => {
  const { coachId } = route.params;
  const [coach, setCoach] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const loadCoachDetails = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getCoachDetails(coachId);
      const coachData = data.coach;
      setCoach(coachData);
      setFirstName(coachData.first_name);
      setLastName(coachData.last_name);
      setEmail(coachData.email);
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

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      AppAlert.error("Error", "El nombre es requerido");
      return false;
    }
    if (!lastName.trim()) {
      AppAlert.error("Error", "El apellido es requerido");
      return false;
    }
    if (!email.trim()) {
      AppAlert.error("Error", "El email es requerido");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      AppAlert.error("Error", "El formato del email no es válido");
      return false;
    }

    if (password && password !== confirmPassword) {
      AppAlert.error("Error", "Las contraseñas no coinciden");
      return false;
    }

    if (password && password.length < 6) {
      AppAlert.error("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const updateData: Partial<User> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
      };

      if (password) {
        updateData.password = password;
        updateData.password_confirmation = confirmPassword;
      }

      await adminService.updateCoach(coachId, updateData);

      AppAlert.success(
        "Éxito",
        "La información del entrenador ha sido actualizada correctamente"
      );

      navigation.goBack();
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo actualizar la información del entrenador"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancelar edición",
      "¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.",
      [
        { text: "Continuar editando", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Editar Entrenador"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#dc2626" />
          <Text className="text-gray-600 mt-2">Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!coach) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Editar Entrenador"
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
      <ScreenHeader title="Editar Entrenador" onBack={handleCancel} />

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <View className="flex-row items-center">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mr-3">
              <Text className="text-green-800 text-lg">🏋️</Text>
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                Editando: {coach.first_name} {coach.last_name}
              </Text>
              <Text className="text-gray-600 text-sm">ID: {coach.id}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            📝 Información Personal
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Nombre *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Ingresa el nombre"
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Apellido *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Ingresa el apellido"
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            🔒 Cambiar Contraseña
          </Text>
          <Text className="text-gray-600 text-sm mb-4">
            Deja estos campos vacíos si no quieres cambiar la contraseña
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Nueva Contraseña
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Confirmar Contraseña
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la contraseña"
              secureTextEntry
            />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <TouchableOpacity
            className={`py-3 px-4 rounded-lg mb-3 ${
              isSaving ? "bg-gray-400" : "bg-green-600"
            }`}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">
                  Guardando...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-center">
                💾 Guardar Cambios
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-600 py-3 px-4 rounded-lg"
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text className="text-white font-semibold text-center">
              ❌ Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCoachEditScreen;
