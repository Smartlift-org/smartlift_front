import React, { useState } from "react";
import { Checkbox } from "react-native-paper";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar,
} from "react-native";
import AppAlert from "../components/AppAlert";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
import TermsOfServiceModal from "../components/TermsOfServiceModal";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, RegisterData } from "../types";
import authService from "../services/authService";
import userStatsService from "../services/userStatsService";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] =
    useState<boolean>(false);
  const [termsOfServiceVisible, setTermsOfServiceVisible] =
    useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "coach">("user");

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
    return emailRegex.test(email);
  };

  const isOnlyWhitespace = (str: string): boolean => {
    return str.trim().length === 0;
  };

  const handleRegister = async (): Promise<void> => {
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

    if (!acceptedTerms) {
      AppAlert.error(
        "Términos no aceptados",
        "Debes aceptar los Términos de Servicio y la Política de Privacidad para continuar"
      );
      return;
    }

    setIsLoading(true);

    try {
      const userData: RegisterData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        password_confirmation: confirmPassword,
        role: selectedRole,
      };

      await authService.register(userData);

      try {
        const loginResponse = await authService.login(
          userData.email,
          userData.password
        );

        setIsLoading(false);

        if (loginResponse.user.role === "coach") {
          navigation.reset({
            index: 0,
            routes: [{ name: "CoachHome" }],
          });
        } else {
          try {
            const hasCompletedProfile =
              await userStatsService.hasCompletedProfile();

            if (!hasCompletedProfile) {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "StatsProfile",
                    params: { fromRedirect: true },
                  },
                ],
              });

              AppAlert.info(
                "Perfil incompleto",
                "Por favor complete su perfil para continuar.",
                [{ text: "Entendido" }]
              );
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: "UserHome" }],
              });
            }
          } catch (error) {
            navigation.reset({
              index: 0,
              routes: [{ name: "UserHome" }],
            });
          }
        }
      } catch (loginError) {
        setIsLoading(false);
        AppAlert.info(
          "Registro Exitoso",
          "Tu cuenta ha sido creada correctamente, pero no pudimos iniciar sesión automáticamente. Por favor inicia sesión manualmente.",
          [{ text: "Ir a Login", onPress: () => navigation.navigate("Login") }]
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error en el registro. Por favor intente nuevamente.";

      AppAlert.error("Error de Registro", errorMessage);
    }
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
          <View className="items-center mt-10">
            <Image
              source={require("../assets/smartlift_logo.png")}
              className="w-36 h-36"
              resizeMode="contain"
            />
          </View>

          <View className="px-6 mt-5">
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
              <Text className="text-sm text-[#495057] mb-2">
                Tipo de Usuario
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 border ${
                    selectedRole === "user"
                      ? "bg-primary border-primary"
                      : "bg-white border-border"
                  } rounded-lg p-4 mr-2 items-center`}
                  onPress={() => setSelectedRole("user")}
                >
                  <Text
                    className={`text-base ${
                      selectedRole === "user" ? "text-white" : "text-textLight"
                    }`}
                  >
                    Usuario
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 border ${
                    selectedRole === "coach"
                      ? "bg-primary border-primary"
                      : "bg-white border-border"
                  } rounded-lg p-4 ml-2 items-center`}
                  onPress={() => setSelectedRole("coach")}
                >
                  <Text
                    className={`text-base ${
                      selectedRole === "coach" ? "text-white" : "text-textLight"
                    }`}
                  >
                    Entrenador
                  </Text>
                </TouchableOpacity>
              </View>
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
