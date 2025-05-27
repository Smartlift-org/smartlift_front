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
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, RegisterData } from "../types";
import authService from "../services/authService";

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

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
    return emailRegex.test(email);
  };

  const isOnlyWhitespace = (str: string): boolean => {
    return str.trim().length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isOnlyWhitespace(firstName) || isOnlyWhitespace(lastName)) {
      Alert.alert("Error", "First name and last name cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
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
      };

      await authService.register(userData);

      setIsLoading(false);
      Alert.alert("Success", "Registration successful! Please log in.");
      navigation.navigate("Login");
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed. Please try again.";

      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="items-center mt-10">
            <Image
              source={require("../assets/logo.png")}
              className="w-36 h-36"
              resizeMode="contain"
            />
          </View>

          <View className="px-6 mt-5">
            <Text className="text-3xl font-bold text-text">Create Account</Text>
            <Text className="text-base text-textLight mt-1 mb-6">
              Sign up to get started
            </Text>

            <View className="mb-4">
              <Text className="text-sm text-[#495057] mb-2">First Name</Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-[#495057] mb-2">Last Name</Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
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

            <View className="mb-4">
              <Text className="text-sm text-[#495057] mb-2">Password</Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm text-[#495057] mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-white border border-border rounded-lg p-4 text-base"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-lg p-4 items-center mb-5 ${
                isLoading ? "bg-opacity-50" : ""
              }`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <View className="mb-5">
              <Text className="text-xs text-textLight text-center leading-5">
                By signing up, you agree to our{" "}
                <Text className="text-primary font-bold">Terms of Service</Text>{" "}
                and{" "}
                <Text className="text-primary font-bold">Privacy Policy</Text>
              </Text>
            </View>
          </View>

          <View className="flex-row justify-center mb-8 mt-3">
            <Text className="text-textLight text-sm">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-primary text-sm font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
