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
} from "react-native";
import AppAlert from "../components/AppAlert";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import userStatsService from "../services/userStatsService";
import { RootStackParamList } from "../types/index";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      AppAlert.error("Error", "Por favor complete todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const response = await authService.login(sanitizedEmail, password);

      if (response && response.token && response.user) {
        const userRole = response.user.role;

        if (userRole === "coach") {
          setIsLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "CoachHome" }],
          });
        } else if (userRole === "admin") {
          setIsLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminHome" }],
          });
        } else {
          try {
            const hasCompletedProfile =
              await userStatsService.hasCompletedProfile();
            setIsLoading(false);

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
            setIsLoading(false);

            navigation.reset({
              index: 0,
              routes: [{ name: "UserHome" }],
            });
          }
        }
      } else {
        setIsLoading(false);
        AppAlert.error(
          "Error",
          "No se pudo obtener la información del usuario"
        );
      }
    } catch (error: unknown) {
      setIsLoading(false);

      if (error instanceof Error) {
        const errorMessage = error.message || "Error al iniciar sesión";
        AppAlert.error("Error de Inicio de Sesión", errorMessage);
      } else {
        AppAlert.error("Error de Inicio de Sesión", "Error desconocido");
      }
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
          <Text className="text-3xl font-bold text-text">Bienvenido</Text>
          <Text className="text-base text-textLight mt-1 mb-8">
            Inicia sesión para continuar
          </Text>

          <View className="mb-5">
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

          <View className="mb-5">
            <Text className="text-sm text-[#495057] mb-2">Contraseña</Text>
            <TextInput
              className="bg-white border border-border rounded-lg p-4 text-base"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="self-end mb-8"
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text className="text-primary text-sm">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-primary rounded-lg p-4 items-center mb-5 ${
              isLoading ? "bg-opacity-50" : ""
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-bold">
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mb-8">
          <Text className="text-textLight text-sm">
            ¿No tienes una cuenta?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-primary text-sm font-bold">Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
