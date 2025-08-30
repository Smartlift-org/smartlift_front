import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import userStatsService from "../services/userStatsService";
import AppAlert from "../components/AppAlert";

export const navigateAfterAuth = async (
  navigation: NativeStackNavigationProp<RootStackParamList, any>,
  userRole: string
): Promise<void> => {
  try {
    if (userRole === "coach") {
      navigation.reset({
        index: 0,
        routes: [{ name: "CoachHome" }],
      });
    } else if (userRole === "admin") {
      navigation.reset({
        index: 0,
        routes: [{ name: "AdminHome" }],
      });
    } else {
      const hasCompletedProfile = await userStatsService.hasCompletedProfile();

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
    }
  } catch (error) {
    console.error("Error checking profile completion:", error);
    navigation.reset({
      index: 0,
      routes: [{ name: "UserHome" }],
    });
  }
};
