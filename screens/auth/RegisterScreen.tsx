import React, { useState } from "react";
import { Checkbox } from "react-native-paper";
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
import PrivacyPolicyModal from "../../components/PrivacyPolicyModal";
import TermsOfServiceModal from "../../components/TermsOfServiceModal";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, RegisterData } from "../../types";
import authService from "../../services/authService";
import { useLoadingState } from "../../hooks/useLoadingState";
import { validateRegisterForm, sanitizeEmail } from "../../utils/authValidation";
import { navigateAfterAuth } from "../../utils/authNavigation";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}: RegisterScreenProps) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { isLoading, withLoading } = useLoadingState();
  const [privacyPolicyVisible, setPrivacyPolicyVisible] =
    useState<boolean>(false);
  const [termsOfServiceVisible, setTermsOfServiceVisible] =
    useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const handleRegister = async (): Promise<void> => {
    const validation = validateRegisterForm(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      acceptedTerms
    );

    if (!validation.isValid) {
      AppAlert.error("Error", validation.error!);
      return;
    }

    await withLoading(async () => {
      const userData: RegisterData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: sanitizeEmail(email),
        password: password,
        password_confirmation: confirmPassword,
        role: "user",
      };

      await authService.register(userData);
      const loginResponse = await authService.login(
        userData.email,
        userData.password
      );

      await navigateAfterAuth(navigation, loginResponse.user.role);
    }).catch((error: unknown) => {
      if (error instanceof Error) {
        const errorMessage = error.message || "Error en el registro";
        AppAlert.error("Error de Registro", errorMessage);
      } else {
        AppAlert.error("Error de Registro", "Error desconocido");
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <PrivacyPolicyModal
          visible={privacyPolicyVisible}
          onClose={() => setPrivacyPolicyVisible(false)}
        />
        <TermsOfServiceModal
          visible={termsOfServiceVisible}
          onClose={() => setTermsOfServiceVisible(false)}
        />
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 mt-20">
            <Text className="text-3xl font-bold text-text">Crear Cuenta</Text>
            <Text className="text-base text-textLight mt-1 mb-6">
              Regístrate para comenzar
            </Text>

            <View className="mb-4">
              <Text className="text-sm text-[#495057] mb-2">Nombre</Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Ingresa tu nombre"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-[#495057] mb-2">Apellido</Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Ingresa tu apellido"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-[#495057] mb-2">
                Correo Electrónico
              </Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Ingresa tu correo electrónico"
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
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View className="flex-row items-start mb-5 mt-2">
              <Checkbox
                status={acceptedTerms ? "checked" : "unchecked"}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                color="#3a86ff"
                uncheckedColor="#6c757d"
              />
              <Text className="text-sm text-textLight flex-1 mt-2">
                Acepto los{" "}
                <Text
                  className="text-primary font-bold"
                  onPress={() => setTermsOfServiceVisible(true)}
                >
                  Términos de Servicio
                </Text>{" "}
                y la{" "}
                <Text
                  className="text-primary font-bold"
                  onPress={() => setPrivacyPolicyVisible(true)}
                >
                  Política de Privacidad
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-lg p-4 items-center mb-5 ${
                isLoading ? "bg-opacity-50" : ""
              }`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Creando Cuenta..." : "Crear Cuenta"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mb-8 mt-3">
            <Text className="text-textLight text-sm">
              ¿Ya tienes una cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-primary text-sm font-bold">
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
