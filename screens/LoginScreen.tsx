import React, { useState } from "react";
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
  StatusBar,
  ActivityIndicator,
} from "react-native";
import useCustomAlert from "../components/useCustomAlert";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import userStatsService from "../services/userStatsService";
import { RootStackParamList } from "../types";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      showAlert({
        title: "Error",
        message: "Por favor complete todos los campos"
      });
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const response = await authService.login(sanitizedEmail, password);

      if (response && response.token && response.user) {
        // Check if user has completed their profile (for regular users, not coaches)
        const userRole = response.user.role;
        
        if (userRole === 'coach') {
          setIsLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "CoachHome" }],
          });
        } else {
          // For regular users, check if they've completed their profile
          try {
            const hasCompletedProfile = await userStatsService.hasCompletedProfile();
            setIsLoading(false);
            
            if (!hasCompletedProfile) {
              // User hasn't completed their profile, redirect to stats profile screen
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: "StatsProfile",
                  params: { fromRedirect: true }
                }],
              });
              
              showAlert({
                title: "Perfil incompleto",
                message: "Por favor complete su perfil para continuar.",
                primaryButtonText: "Entendido"
              });
            } else {
              // User has completed their profile, proceed to home screen
              navigation.reset({
                index: 0,
                routes: [{ name: "UserHome" }],
              });
            }
          } catch (error) {
            console.error("Error checking profile completion:", error);
            setIsLoading(false);
            
            // Default to user home if there's an error checking profile
            navigation.reset({
              index: 0,
              routes: [{ name: "UserHome" }],
            });
          }
        }
      } else {
        setIsLoading(false);
        showAlert({
          title: "Error",
          message: "No se pudo obtener la información del usuario",
          primaryButtonText: "Aceptar"
        });
      }
    } catch (error: any) {
      setIsLoading(false);

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Error al iniciar sesión. Por favor intente nuevamente.";

      showAlert({
        title: "Error de Inicio de Sesión",
        message: errorMessage
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <AlertComponent />
        <StatusBar barStyle="dark-content" />

        <View className="items-center mt-15 bg-background">
          <Image
            source={require("../assets/smartlift_logo.png")}
            className="w-36 h-36"
            resizeMode="contain"
            onError={(error: any) =>
              console.error("Image loading error:", error.nativeEvent.error)
            }
          />
        </View>

        <View className="flex-1 px-6 mt-8">
          <Text className="text-3xl font-bold text-text">Bienvenido</Text>
          <Text className="text-base text-textLight mt-1 mb-8">
            Inicia sesión para continuar
          </Text>

          <View className="mb-5">
            <Text className="text-sm text-[#495057] mb-2">Correo Electrónico</Text>
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

          <TouchableOpacity className="self-end mb-8">
            <Text className="text-primary text-sm">¿Olvidaste tu contraseña?</Text>
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
