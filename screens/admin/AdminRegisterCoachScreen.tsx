import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar,
} from "react-native";
import AppAlert from "../../components/AppAlert";
import ScreenHeader from "../../components/ScreenHeader";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types";
import adminService from "../../services/adminService";

type AdminRegisterCoachScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "AdminRegisterCoach"
  >;
};

const AdminRegisterCoachScreen: React.FC<AdminRegisterCoachScreenProps> = ({
  navigation,
}) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
    return emailRegex.test(email);
  };

  const isOnlyWhitespace = (str: string): boolean => {
    return str.trim().length === 0;
  };

  const handleRegisterCoach = async (): Promise<void> => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      AppAlert.error("Error", "Por favor complete todos los campos");
      return;
    }

    if (isOnlyWhitespace(firstName) || isOnlyWhitespace(lastName)) {
      AppAlert.error("Error", "El nombre y apellido no pueden estar vacíos");
      return;
    }

    if (!isValidEmail(email)) {
      AppAlert.error(
        "Error",
        "Por favor ingrese una dirección de correo válida"
      );
      return;
    }

    if (password.length < 6) {
      AppAlert.error("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      AppAlert.error("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const coachData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        password_confirmation: confirmPassword,
        role: "coach" as const,
      };

      await adminService.registerUser(coachData);

      AppAlert.success("Éxito", "Entrenador registrado exitosamente", [
        {
          text: "Aceptar",
          style: "default",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      AppAlert.error(
        "Error",
        error.message || "No se pudo registrar el entrenador"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <SafeAreaView className="flex-1" edges={["top"]}>
          <ScreenHeader
            title="Registrar Entrenador"
            onBack={() => navigation.goBack()}
          />

          <ScrollView className="flex-1 px-5 py-4">
            <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
              <Text className="text-lg font-semibold text-red-800 mb-4 text-center">
                Crear Nueva Cuenta de Entrenador
              </Text>

              <View className="mb-4">
                <Text className="text-sm text-[#495057] mb-2">Nombre</Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="Ingresa el nombre"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-[#495057] mb-2">Apellido</Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="Ingresa el apellido"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-[#495057] mb-2">
                  Correo Electrónico
                </Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-[#495057] mb-2">Contraseña</Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="Crea una contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm text-[#495057] mb-2">
                  Confirmar Contraseña
                </Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="Confirma la contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className={`bg-red-600 rounded-lg p-4 items-center mb-4 ${
                  isLoading ? "bg-opacity-50" : ""
                }`}
                onPress={handleRegisterCoach}
                disabled={isLoading}
              >
                <Text className="text-white text-base font-bold">
                  {isLoading ? "Registrando..." : "Registrar Entrenador"}
                </Text>
              </TouchableOpacity>

              <View className="bg-red-50 p-4 rounded-lg">
                <Text className="text-red-700 text-sm text-center">
                  ⚠️ Este entrenador podrá acceder al sistema con las
                  credenciales proporcionadas
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default AdminRegisterCoachScreen;
