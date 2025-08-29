import React, { useState, useEffect, useRef } from "react";
import "./services/ws-polyfill";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StatusBar, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./global.css";
import { setupNativeWind } from "./nativewind-setup";

setupNativeWind();

import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import UserHomeScreen from "./screens/user/UserHomeScreen";
import CoachHomeScreen from "./screens/coach/CoachHomeScreen";
import BasicProfileScreen from "./screens/user/BasicProfileScreen";
import StatsProfileScreen from "./screens/user/StatsProfileScreen";
import RoutineListScreen from "./screens/routines/RoutineListScreen";
import RoutineCreateScreen from "./screens/routines/RoutineCreateScreen";
import ExerciseSelectScreen from "./screens/routines/ExerciseSelectScreen";
import WorkoutTrackerScreen from "./screens/workouts/WorkoutTrackerScreen";
import WorkoutDetailScreen from "./screens/workouts/WorkoutDetailScreen";
import WorkoutStatsScreen from "./screens/workouts/WorkoutStatsScreen";
import WorkoutHistoryScreen from "./screens/workouts/WorkoutHistoryScreen";
import AIRoutineGeneratorScreen from "./screens/routines/AIRoutineGeneratorScreen";
import ReviewRoutinesScreen from "./screens/coach/ReviewRoutinesScreen";
import RoutineManagementScreen from "./screens/routines/RoutineManagementScreen";
import RoutineEditScreen from "./screens/routines/RoutineEditScreen";
import ActiveWorkoutsScreen from "./screens/workouts/ActiveWorkoutsScreen";
import TrainerRoutinesScreen from "./screens/coach/TrainerRoutinesScreen";
import MemberSelectionScreen from "./screens/coach/MemberSelectionScreen";
import RoutineSelectScreen from "./screens/routines/RoutineSelectScreen";
import SelectedExercisesScreen from "./screens/routines/SelectedExercisesScreen";
import MemberManagementScreen from "./screens/coach/MemberManagementScreen";
import MemberProfileScreen from "./screens/coach/MemberProfileScreen";
import MemberRoutineEditScreen from "./screens/coach/MemberRoutineEditScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import AdminHomeScreen from "./screens/admin/AdminHomeScreen";
import AdminCoachListScreen from "./screens/admin/AdminCoachListScreen";
import AdminUserListScreen from "./screens/admin/AdminUserListScreen";
import AdminRegisterCoachScreen from "./screens/admin/AdminRegisterCoachScreen";
import AdminCoachDetailScreen from "./screens/admin/AdminCoachDetailScreen";
import RoutineModificationScreen from "./screens/routines/RoutineModificationScreen";
import ModifiedRoutineResultScreen from "./screens/routines/ModifiedRoutineResultScreen";
import AdminUserDetailScreen from "./screens/admin/AdminUserDetailScreen";
import AdminCoachEditScreen from "./screens/admin/AdminCoachEditScreen";
import AdminAssignUsersScreen from "./screens/admin/AdminAssignUsersScreen";
import RoutineValidationScreen from "./screens/coach/RoutineValidationScreen";
import RoutineValidationDetailScreen from "./screens/coach/RoutineValidationDetailScreen";
import PublicProfilesExploreScreen from "./screens/user/PublicProfilesExploreScreen";
import PublicProfileDetailScreen from "./screens/user/PublicProfileDetailScreen";
import PrivacySettingsScreen from "./screens/user/PrivacySettingsScreen";
import ConversationListScreen from "./screens/chat/ConversationListScreen";
import ChatScreen from "./screens/chat/ChatScreen";
import ChatUserSelectionScreen from "./screens/chat/ChatUserSelectionScreen";
import ExerciseManagementScreen from "./screens/coach/ExerciseManagementScreen";
import ChallengeListScreen from "./screens/ChallengeListScreen";
import ChallengeDetailScreen from "./screens/ChallengeDetailScreen";
import ChallengeExecutionScreen from "./screens/ChallengeExecutionScreen";
import ChallengeLeaderboardScreen from "./screens/ChallengeLeaderboardScreen";
import MyAttemptsScreen from "./screens/MyAttemptsScreen";
import CoachChallengeListScreen from "./screens/CoachChallengeListScreen";
import CreateChallengeScreen from "./screens/CreateChallengeScreen";
import ChallengeManagementScreen from "./screens/ChallengeManagementScreen";
import { ChatProvider } from "./contexts/ChatContext";
import authService from "./services/authService";
import notificationService from "./services/notificationService";

import type { RootStackParamList, User } from "./types/index";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationConfig = {
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "white" },
    animation: "slide_from_right",
  },
};

const chatHeaderOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerStyle: { backgroundColor: "#ffffff" },
  headerTitleStyle: { color: "#111827", fontWeight: "600" as const },
  headerTintColor: "#111827",
  headerShadowVisible: true,
};

export default function App(): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const userData = await authService.getCurrentUser();
          setUser(userData);

          try {
            await notificationService.initialize();
          } catch (notificationError) {
            console.warn(
              "Failed to initialize notifications:",
              notificationError
            );
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const handlePendingNavigation = async () => {
      if (!user || !navigationRef.current) return;

      try {
        const pendingNavigation = await AsyncStorage.getItem(
          "pending_navigation"
        );
        if (pendingNavigation) {
          const navigationData = JSON.parse(pendingNavigation);

          await AsyncStorage.removeItem("pending_navigation");

          if (navigationData.screen === "Chat" && navigationData.params) {
            navigationRef.current.navigate("Chat", navigationData.params);
          }
        }
      } catch (error) {
        console.error("Error handling pending navigation:", error);
      }
    };

    handlePendingNavigation();
  }, [user]);

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
        <NavigationContainer ref={navigationRef}>
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
            <Stack.Screen
              name="WorkoutDetail"
              component={WorkoutDetailScreen}
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
                ...chatHeaderOptions,
                title: "Conversaciones",
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                ...chatHeaderOptions,
              }}
            />
            <Stack.Screen
              name="ChatUserSelection"
              component={ChatUserSelectionScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ExerciseManagement"
              component={ExerciseManagementScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="ChallengeList" component={ChallengeListScreen} />
            <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
            <Stack.Screen 
              name="ChallengeExecution" 
              component={ChallengeExecutionScreen}
              options={{ 
                title: "Desafío en Curso",
                headerShown: false 
              }}
            />
            <Stack.Screen name="ChallengeLeaderboard" component={ChallengeLeaderboardScreen} />
            <Stack.Screen name="MyAttempts" component={MyAttemptsScreen} />
            <Stack.Screen name="CoachChallengeList" component={CoachChallengeListScreen} />
            <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
            <Stack.Screen name="ChallengeManagement" component={ChallengeManagementScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </ChatProvider>
  );
}
