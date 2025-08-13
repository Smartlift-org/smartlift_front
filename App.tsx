import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StatusBar, Text, ActivityIndicator } from "react-native";
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
import WorkoutHistoryScreen from "./screens/WorkoutHistoryScreen";
import AIRoutineGeneratorScreen from "./screens/AIRoutineGeneratorScreen";
import ReviewRoutinesScreen from "./screens/ReviewRoutinesScreen";
import RoutineManagementScreen from "./screens/RoutineManagementScreen";
import RoutineEditScreen from "./screens/RoutineEditScreen";
import ActiveWorkoutsScreen from "./screens/ActiveWorkoutsScreen";
import TrainerRoutinesScreen from "./screens/TrainerRoutinesScreen";
import MemberSelectionScreen from "./screens/MemberSelectionScreen";
import RoutineSelectScreen from "./screens/RoutineSelectScreen";
import SelectedExercisesScreen from "./screens/SelectedExercisesScreen";
import MemberManagementScreen from "./screens/MemberManagementScreen";
import MemberProfileScreen from "./screens/MemberProfileScreen";
import MemberRoutineEditScreen from "./screens/MemberRoutineEditScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import AdminHomeScreen from "./screens/AdminHomeScreen";
import AdminCoachListScreen from "./screens/AdminCoachListScreen";
import AdminUserListScreen from "./screens/AdminUserListScreen";
import AdminRegisterCoachScreen from "./screens/AdminRegisterCoachScreen";
import AdminCoachDetailScreen from "./screens/AdminCoachDetailScreen";
import RoutineModificationScreen from "./screens/RoutineModificationScreen";
import ModifiedRoutineResultScreen from "./screens/ModifiedRoutineResultScreen";
import AdminUserDetailScreen from "./screens/AdminUserDetailScreen";
import AdminCoachEditScreen from "./screens/AdminCoachEditScreen";
import AdminAssignUsersScreen from "./screens/AdminAssignUsersScreen";
import RoutineValidationScreen from "./screens/RoutineValidationScreen";
import RoutineValidationDetailScreen from "./screens/RoutineValidationDetailScreen";
import PublicProfilesExploreScreen from "./screens/PublicProfilesExploreScreen";
import PublicProfileDetailScreen from "./screens/PublicProfileDetailScreen";
import PrivacySettingsScreen from "./screens/PrivacySettingsScreen";
import ConversationListScreen from "./screens/ConversationListScreen";
import ChatScreen from "./screens/ChatScreen";
import { ChatProvider } from "./contexts/ChatContext";
import authService from "./services/authService";

import type { RootStackParamList, User } from "./types/index";

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
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
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
    <ChatProvider>
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={
              user
                ? user.role === "admin"
                  ? "AdminHome"
                  : user.role === "coach"
                  ? "CoachHome"
                  : "UserHome"
                : "Login"
            }
            screenOptions={navigationConfig.screenOptions}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="CoachHome" component={CoachHomeScreen} />
            <Stack.Screen name="BasicProfile" component={BasicProfileScreen} />
            <Stack.Screen name="StatsProfile" component={StatsProfileScreen} />
            <Stack.Screen name="RoutineList" component={RoutineListScreen} />
            <Stack.Screen
              name="RoutineCreate"
              component={RoutineCreateScreen}
            />
            <Stack.Screen
              name="ExerciseSelect"
              component={ExerciseSelectScreen}
            />
            <Stack.Screen
              name="WorkoutTracker"
              component={WorkoutTrackerScreen}
            />
            <Stack.Screen name="WorkoutStats" component={WorkoutStatsScreen} />
            <Stack.Screen
              name="WorkoutHistory"
              component={WorkoutHistoryScreen}
            />
            <Stack.Screen
              name="AIRoutineGenerator"
              component={AIRoutineGeneratorScreen}
            />
            <Stack.Screen
              name="ReviewRoutines"
              component={ReviewRoutinesScreen}
            />
            <Stack.Screen
              name="RoutineManagement"
              component={RoutineManagementScreen}
            />
            <Stack.Screen name="RoutineEdit" component={RoutineEditScreen} />
            <Stack.Screen
              name="ActiveWorkouts"
              component={ActiveWorkoutsScreen}
            />
            <Stack.Screen
              name="RoutineSelect"
              component={RoutineSelectScreen}
            />

            <Stack.Screen
              name="SelectedExercises"
              component={SelectedExercisesScreen}
            />
            <Stack.Screen
              name="MemberManagement"
              component={MemberManagementScreen}
            />
            <Stack.Screen
              name="MemberProfile"
              component={MemberProfileScreen}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen
              name="TrainerRoutines"
              component={TrainerRoutinesScreen}
            />
            <Stack.Screen
              name="MemberSelection"
              component={MemberSelectionScreen}
            />
            <Stack.Screen
              name="MemberRoutineEdit"
              component={MemberRoutineEditScreen}
            />
            <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
            <Stack.Screen
              name="AdminCoachList"
              component={AdminCoachListScreen}
            />
            <Stack.Screen
              name="AdminUserList"
              component={AdminUserListScreen}
            />
            <Stack.Screen
              name="AdminRegisterCoach"
              component={AdminRegisterCoachScreen}
            />
            <Stack.Screen
              name="AdminCoachDetail"
              component={AdminCoachDetailScreen}
            />
            <Stack.Screen
              name="AdminUserDetail"
              component={AdminUserDetailScreen}
            />
            <Stack.Screen
              name="AdminCoachEdit"
              component={AdminCoachEditScreen}
            />
            <Stack.Screen
              name="AdminAssignUsers"
              component={AdminAssignUsersScreen}
            />
            <Stack.Screen
              name="RoutineValidation"
              component={RoutineValidationScreen}
            />
            <Stack.Screen
              name="RoutineValidationDetail"
              component={RoutineValidationDetailScreen}
            />
            <Stack.Screen
              name="RoutineModification"
              component={RoutineModificationScreen}
            />
            <Stack.Screen
              name="ModifiedRoutineResult"
              component={ModifiedRoutineResultScreen}
            />
            <Stack.Screen
              name="PublicProfilesExplore"
              component={PublicProfilesExploreScreen}
            />
            <Stack.Screen
              name="PublicProfileDetail"
              component={PublicProfileDetailScreen}
            />
            <Stack.Screen
              name="PrivacySettings"
              component={PrivacySettingsScreen}
            />
            <Stack.Screen
              name="ConversationList"
              component={ConversationListScreen}
              options={{
                title: "Conversaciones",
                headerShown: true,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                headerBackTitleVisible: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </ChatProvider>
  );
}
