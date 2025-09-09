import React, { useState } from "react";
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
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import Avatar from "../../components/Avatar";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, User } from "../../types";
import adminService from "../../services/adminService";

type AdminUserEditScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AdminUserEdit">;
  route: RouteProp<RootStackParamList, "AdminUserEdit">;
};

const AdminUserEditScreen: React.FC<AdminUserEditScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId, userData } = route.params;
  const [firstName, setFirstName] = useState(userData.first_name);
  const [lastName, setLastName] = useState(userData.last_name);
  const [email, setEmail] = useState(userData.email);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
    };

    // Validar nombre
    if (!firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar apellido
    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "El formato del email no es válido";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleSave = async () => {
    if (!validateForm()) {
      AppAlert.error("Error de validación", "Por favor corrige los errores marcados");
      return;
    }

    // Verificar si hay cambios
    const hasChanges = 
      firstName.trim() !== userData.first_name ||
      lastName.trim() !== userData.last_name ||
      email.trim() !== userData.email;

    if (!hasChanges) {
      AppAlert.info("Sin cambios", "No se han realizado cambios en la información del usuario");
      return;
    }

    Alert.alert(
      "Confirmar cambios",
      `¿Estás seguro de que quieres actualizar la información de ${userData.first_name} ${userData.last_name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Guardar", style: "default", onPress: confirmSave },
      ]
    );
  };

  const confirmSave = async () => {
    try {
      setIsLoading(true);
      
      const updateData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      };

      await adminService.updateUser(userId, updateData);

      AppAlert.success(
        "Éxito",
        "La información del usuario ha sido actualizada correctamente"
      );

      navigation.goBack();
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo actualizar la información del usuario"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = 
      firstName.trim() !== userData.first_name ||
      lastName.trim() !== userData.last_name ||
      email.trim() !== userData.email;

    if (hasChanges) {
      Alert.alert(
        "Descartar cambios",
        "¿Estás seguro de que quieres descartar los cambios realizados?",
        [
          { text: "Continuar editando", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error: string,
    placeholder: string,
    keyboardType: "default" | "email-address" = "default"
  ) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>
      <TextInput
        className={`bg-white border rounded-lg p-3 text-gray-800 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        editable={!isLoading}
      />
      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Editar Usuario"
        onBack={handleCancel}
      />

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <View className="items-center mb-6">
            <Avatar
              profilePictureUrl={userData.profile_picture_url}
              firstName={userData.first_name}
              lastName={userData.last_name}
              size="large"
            />
            <Text className="text-xl font-bold text-gray-800 mt-3">
              Editar información del usuario
            </Text>
            <Text className="text-gray-600 mt-1">ID: {userId}</Text>
          </View>

          <View className="border-t border-gray-200 pt-6">
            {renderInputField(
              "Nombre",
              firstName,
              setFirstName,
              errors.firstName,
              "Ingrese el nombre"
            )}

            {renderInputField(
              "Apellido",
              lastName,
              setLastName,
              errors.lastName,
              "Ingrese el apellido"
            )}

            {renderInputField(
              "Email",
              email,
              setEmail,
              errors.email,
              "usuario@ejemplo.com",
              "email-address"
            )}
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            ℹ️ Información adicional
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Rol:</Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-medium">USUARIO</Text>
              </View>
            </View>
            
            {userData.created_at && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Registrado:</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(userData.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm p-4">
          <TouchableOpacity
            className={`py-3 px-4 rounded-lg mb-3 ${
              isLoading ? "bg-gray-400" : "bg-blue-600"
            }`}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">
                  Guardando cambios...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-center">
                ✅ Guardar Cambios
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-600 py-3 px-4 rounded-lg"
            onPress={handleCancel}
            disabled={isLoading}
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

export default AdminUserEditScreen;
