import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import authService from "../services/authService";
import type { RootStackParamList } from "../types";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const inspirationalQuotes: string[] = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The hard days are what make you stronger.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "The difference between try and triumph is a little umph.",
  "Don't wish for it, work for it.",
  "Strength does not come from the physical capacity. It comes from an indomitable will.",
  "The only place where success comes before work is in the dictionary.",
  "Your health is an investment, not an expense.",
  "Take care of your body. It's the only place you have to live.",
];

const getRandomQuote = (): string => {
  const randomIndex: number = Math.floor(
    Math.random() * inspirationalQuotes.length
  );
  return inspirationalQuotes[randomIndex];
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-grow">
        <View className="flex-1 p-6">
          <View className="h-8"></View>

          <View className="flex-row items-center justify-end mb-8 mt-4">
            <TouchableOpacity
              onPress={handleLogout}
              className="px-4 py-2 rounded-lg bg-[#f1f3f5] border border-border"
            >
              <Text className="text-[#495057] font-medium">Logout</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-8">
            <Text className="text-3xl font-bold text-text mb-2">
              Welcome to SmartFit
            </Text>
            <Text className="text-base text-textLight">
              Your journey to a healthier lifestyle starts here
            </Text>
          </View>

          <View className="bg-primary rounded-xl p-6 mb-8 shadow-sm">
            <Text className="text-white text-lg font-medium italic mb-4">
              "{getRandomQuote()}"
            </Text>
            <Text className="text-white text-right font-medium">
              - SmartFit
            </Text>
          </View>

          <Text className="text-xl font-bold text-text mb-4">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Workout tracking will be available soon!"
                )
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">💪</Text>
                </View>
                <Text className="text-text font-medium">Workouts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Nutrition tracking will be available soon!"
                )
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">🥗</Text>
                </View>
                <Text className="text-text font-medium">Nutrition</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Progress tracking will be available soon!"
                )
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">📊</Text>
                </View>
                <Text className="text-text font-medium">Progress</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 w-[48%] shadow-sm border border-[#e9ecef]"
              onPress={() =>
                Alert.alert("Coming Soon", "Settings will be available soon!")
              }
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#e7f5ff] items-center justify-center mb-2">
                  <Text className="text-primary text-xl font-bold">⚙️</Text>
                </View>
                <Text className="text-text font-medium">Settings</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
