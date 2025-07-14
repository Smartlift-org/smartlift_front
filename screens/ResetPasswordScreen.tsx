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
  StatusBar,
  ActivityIndicator,
} from "react-native";
import AppAlert from "../components/AppAlert";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import authService from "../services/authService";
import { Ionicons } from "@expo/vector-icons";

// Asegurarse que coincide con la definición en RootStackParamList
type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ResetPassword">;
  route: RouteProp<RootStackParamList, "ResetPassword">;
};

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { token } = route.params;
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleResetPassword = async (): Promise<void> => {
    // Validación de campos vacíos
    if (!password || !confirmPassword) {
      AppAlert.error("Error", "Por favor completa todos los campos");
      return;
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      AppAlert.error("Error", "Las contraseñas no coinciden");
      return;
    }

    // Validación de longitud mínima
    if (password.length < 6) {
      AppAlert.error("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, password, confirmPassword);
      
      setIsLoading(false);
      setResetSuccess(true);
      
      AppAlert.success(
        "¡Contraseña actualizada!",
        "Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
      );
    } catch (error: any) {
      setIsLoading(false);
      
      const errorMessage = error.response?.data?.error || 
        "No se pudo restablecer tu contraseña. El enlace podría haber expirado. Intenta solicitar un nuevo enlace de restablecimiento.";
      
      AppAlert.error("Error", errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 px-6 mt-20">
          {/* Header con título */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-text">
              Crear nueva contraseña
            </Text>
          </View>

          {!resetSuccess ? (
            <>
              <Text className="text-base text-textLight mb-8">
                Tu contraseña debe tener al menos 6 caracteres
              </Text>

              <View className="mb-5">
                <Text className="text-sm text-[#495057] mb-2">
                  Nueva contraseña
                </Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm text-[#495057] mb-2">
                  Confirmar contraseña
                </Text>
                <TextInput
                  className="bg-white border border-border rounded-lg p-4 text-base"
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className={`bg-primary rounded-lg p-4 items-center mb-5 ${
                  isLoading ? "bg-opacity-50" : ""
                }`}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Cambiar contraseña
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center my-8">
              <Ionicons name="checkmark-circle-outline" size={64} color="#4f46e5" />
              <Text className="text-xl font-bold text-center mt-4">
                ¡Contraseña actualizada!
              </Text>
              <Text className="text-base text-textLight text-center mt-2 mb-6">
                Tu contraseña ha sido restablecida exitosamente
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-lg p-4 w-full items-center"
                onPress={() => navigation.navigate("Login")}
              >
                <Text className="text-white text-base font-bold">
                  Ir a Inicio de Sesión
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default ResetPasswordScreen;
