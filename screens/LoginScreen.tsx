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
  Alert,
  ActivityIndicator,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import { RootStackParamList } from "../types";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const response = await authService.login(sanitizedEmail, password);

      if (response && response.token) {
        setIsLoading(false);
        navigation.navigate("Home");
      }
    } catch (error: any) {
      setIsLoading(false);

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please try again.";

      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar barStyle="dark-content" />

        <View className="items-center mt-15 bg-background">
          <Image
            source={require("../assets/icon.png")}
            className="w-36 h-36"
            resizeMode="contain"
            onError={(error: any) =>
              console.error("Image loading error:", error.nativeEvent.error)
            }
          />
        </View>

        <View className="flex-1 px-6 mt-8">
          <Text className="text-3xl font-bold text-text">Welcome Back</Text>
          <Text className="text-base text-textLight mt-1 mb-8">
            Sign in to continue
          </Text>

          <View className="mb-5">
            <Text className="text-sm text-[#495057] mb-2">Email</Text>
            <TextInput
              className="bg-white border border-border rounded-lg p-4 text-base"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm text-[#495057] mb-2">Password</Text>
            <TextInput
              className="bg-white border border-border rounded-lg p-4 text-base"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity className="self-end mb-8">
            <Text className="text-primary text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-primary rounded-lg p-4 items-center mb-5 ${
              isLoading ? "bg-opacity-50" : ""
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-bold">
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mb-8">
          <Text className="text-textLight text-sm">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-primary text-sm font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
