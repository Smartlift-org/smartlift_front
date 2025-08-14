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
import AppAlert from "../../components/AppAlert";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import authService from "../../services/authService";
import { Ionicons } from "@expo/vector-icons";

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string>("");

  const handleForgotPassword = async (): Promise<void> => {
    if (!email) {
      AppAlert.error("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      AppAlert.error("Error", "Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      await authService.forgotPassword(sanitizedEmail);

      setIsLoading(false);
      setRequestSent(true);

      AppAlert.success(
        "Email enviado",
        "Si el correo electrónico está registrado, recibirás instrucciones para restablecer tu contraseña"
      );
    } catch (error: any) {
      setIsLoading(false);

      AppAlert.info(
        "Solicitud procesada",
        "Si el correo electrónico está registrado, recibirás instrucciones para restablecer tu contraseña"
      );
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
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-text">
              Recuperar Contraseña
            </Text>
          </View>

          {!requestSent ? (
            <>
              <Text className="text-base text-textLight mb-8">
                Ingresa tu correo electrónico y te enviaremos instrucciones para
                restablecer tu contraseña
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

              <TouchableOpacity
                className={`bg-primary rounded-lg p-4 items-center mb-5 ${
                  isLoading ? "bg-opacity-50" : ""
                }`}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Enviar Instrucciones
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center my-8">
              <Ionicons name="mail-outline" size={64} color="#4f46e5" />
              <Text className="text-xl font-bold text-center mt-4">
                Revisa tu correo
              </Text>
              <Text className="text-base text-textLight text-center mt-2 mb-6">
                Te hemos enviado instrucciones para restablecer tu contraseña a{" "}
                {email}
              </Text>

              <Text className="text-base text-black font-semibold text-center mt-4">
                ¿Ya recibiste el token?
              </Text>

              <View className="mb-5 w-full mt-2">
                <Text className="text-sm text-[#495057] mb-2">
                  Ingresa el token recibido
                </Text>
                <TextInput
                  className={`bg-white border ${
                    tokenError ? "border-red-500" : "border-border"
                  } rounded-lg p-4 text-base w-full`}
                  placeholder="Pega aquí el token recibido en tu correo"
                  autoCapitalize="none"
                  onChangeText={(text: string) => {
                    setToken(text);
                    if (tokenError) setTokenError("");
                  }}
                  value={token}
                />
                {tokenError ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {tokenError}
                  </Text>
                ) : null}
              </View>

              <View className="flex-row w-full justify-between">
                <TouchableOpacity
                  className={`bg-primary rounded-lg p-4 flex-1 mr-2 items-center ${
                    isValidatingToken ? "bg-opacity-50" : ""
                  }`}
                  disabled={isValidatingToken}
                  onPress={async () => {
                    const trimmedToken = token.trim();
                    if (!trimmedToken) {
                      setTokenError(
                        "Por favor ingresa el token recibido en tu correo"
                      );
                      AppAlert.error(
                        "Error",
                        "Por favor ingresa el token recibido en tu correo"
                      );
                      return;
                    }

                    if (trimmedToken.length < 40) {
                      setTokenError(
                        "El token parece ser demasiado corto. Verifica que lo hayas copiado completamente"
                      );
                      AppAlert.error(
                        "Error",
                        "El token parece ser demasiado corto. Verifica que lo hayas copiado completamente"
                      );
                      return;
                    }

                    const validTokenRegex = /^[A-Za-z0-9\-_]+$/;
                    if (!validTokenRegex.test(trimmedToken)) {
                      setTokenError(
                        "El token contiene caracteres no válidos. Por favor cópialo exactamente como aparece en el correo"
                      );
                      AppAlert.error(
                        "Error",
                        "El token contiene caracteres no válidos. Por favor cópialo exactamente como aparece en el correo"
                      );
                      return;
                    }

                    setTokenError("");
                    setIsValidatingToken(true);

                    try {
                      const validationResult = await authService.validateToken(
                        trimmedToken
                      );
                      setIsValidatingToken(false);

                      if (validationResult.valid) {
                        navigation.navigate("ResetPassword", {
                          token: trimmedToken,
                        });
                      } else {
                        setTokenError(
                          validationResult.error ||
                            "El token es inválido o ha expirado"
                        );
                        AppAlert.error(
                          "Error",
                          validationResult.error ||
                            "El token es inválido o ha expirado"
                        );
                      }
                    } catch (error) {
                      setIsValidatingToken(false);
                      setTokenError(
                        "Error de conexión. Por favor intenta nuevamente."
                      );
                      AppAlert.error(
                        "Error",
                        "No se pudo validar el token. Verifica tu conexión a internet."
                      );
                    }
                  }}
                >
                  {isValidatingToken ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white text-base font-bold">
                      Continuar
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-200 rounded-lg p-4 flex-1 ml-2 items-center"
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text className="text-gray-700 text-base font-bold">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPasswordScreen;
