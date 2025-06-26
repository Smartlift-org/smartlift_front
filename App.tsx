import React from "react";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StatusBar, View, Text, ActivityIndicator } from "react-native";
import "./global.css";
import { setupNativeWind } from "./nativewind-setup";

setupNativeWind();

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import UserHomeScreen from "./screens/UserHomeScreen";
import CoachHomeScreen from "./screens/CoachHomeScreen";
import BasicProfileScreen from "./screens/BasicProfileScreen";
import StatsProfileScreen from "./screens/StatsProfileScreen";
import RoutineListScreen from "./screens/RoutineListScreen";
import RoutineCreateScreen from "./screens/RoutineCreateScreen";
import ExerciseSelectScreen from "./screens/ExerciseSelectScreen";
import WorkoutTrackerScreen from "./screens/WorkoutTrackerScreen";
import WorkoutStatsScreen from "./screens/WorkoutStatsScreen";
import AIRoutineGeneratorScreen from "./screens/AIRoutineGeneratorScreen";
import ReviewRoutinesScreen from "./screens/ReviewRoutinesScreen";
import RoutineManagementScreen from "./screens/RoutineManagementScreen";
import RoutineEditScreen from "./screens/RoutineEditScreen";
import authService from "./services/authService";

import type { RootStackParamList, User } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationConfig = {
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "white" },
    animation: "slide_from_right",
  },
};

export default function App(): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600 font-medium">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={user ? (user.role === 'coach' ? "CoachHome" : "UserHome") : "Login"}
          screenOptions={navigationConfig.screenOptions}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="UserHome" component={UserHomeScreen} />
          <Stack.Screen name="CoachHome" component={CoachHomeScreen} />
          <Stack.Screen name="BasicProfile" component={BasicProfileScreen} />
          <Stack.Screen name="StatsProfile" component={StatsProfileScreen} />
          <Stack.Screen name="RoutineList" component={RoutineListScreen} />
          <Stack.Screen name="RoutineCreate" component={RoutineCreateScreen} />
          <Stack.Screen name="ExerciseSelect" component={ExerciseSelectScreen} />
          <Stack.Screen name="WorkoutTracker" component={WorkoutTrackerScreen} />
          <Stack.Screen name="WorkoutStats" component={WorkoutStatsScreen} />
          <Stack.Screen name="AIRoutineGenerator" component={AIRoutineGeneratorScreen} />
          <Stack.Screen name="ReviewRoutines" component={ReviewRoutinesScreen} />
          <Stack.Screen name="RoutineManagement" component={RoutineManagementScreen} />
          <Stack.Screen name="RoutineEdit" component={RoutineEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
