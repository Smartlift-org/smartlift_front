import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PROJECT_ID } from "./apiClient";
import pushTokenService from "./pushTokenService";
import {
  NotificationPermission,
  PushNotificationData,
  NotificationChannel,
} from "../types/notifications";
import logger from "../utils/logger";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Platform.OS === "android") {
        await this.setupNotificationChannels();
      }
      this.setupNotificationListeners();

      this.isInitialized = true;
      logger.info("NotificationService initialized successfully");
    } catch (error) {
      logger.error("Error initializing NotificationService:", error);
      throw error;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (__DEV__ && !Device.isDevice) {
        logger.debug("Push notifications disabled in Expo Go development mode");
        return null;
      }

      if (!Device.isDevice) {
        logger.warn("Push notifications only work on physical devices");
        return null;
      }

      const permission = await this.requestPermissions();
      if (!permission.granted) {
        console.warn("Push notification permissions not granted");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID,
      });

      const token = tokenData.data;
      logger.debug("Expo push token obtained");

      await this.sendTokenToBackend(token);

      await AsyncStorage.setItem("expo_push_token", token);

      return token;
    } catch (error) {
      logger.error("Error registering for push notifications:", error);
      throw new Error("No se pudo registrar para notificaciones push");
    }
  }

  async requestPermissions(): Promise<NotificationPermission> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return {
        status: finalStatus as any,
        granted: finalStatus === "granted",
        canAskAgain: finalStatus !== "denied",
      };
    } catch (error) {
      logger.error("Error requesting notification permissions:", error);
      throw new Error("Error al solicitar permisos de notificaciones");
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await pushTokenService.updatePushToken({
        expo_push_token: token,
        push_notifications_enabled: true,
      });
      logger.info("Push token sent to backend successfully");
    } catch (error) {
      logger.error("Error sending token to backend:", error);
      throw error;
    }
  }

  private setupNotificationListeners(): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        logger.debug("Notification received:", notification);
        this.handleNotificationReceived(notification);
      }
    );

    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.debug("Notification response received:", response);
        this.handleNotificationResponse(response);
      });
  }

  private handleNotificationReceived(notification: any): void {
    const data = notification.request.content
      .data as unknown as PushNotificationData;

    if (data?.type === "chat_message") {
      logger.debug("Chat message notification received:", data);
    }
  }

  private handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): void {
    const data = response.notification.request.content
      .data as unknown as PushNotificationData;

    if (data?.type === "chat_message") {
      this.navigateToChat(data);
    }
  }

  private navigateToChat(data: PushNotificationData): void {
    logger.debug("Should navigate to chat:", data);

    AsyncStorage.setItem(
      "pending_navigation",
      JSON.stringify({
        screen: "Chat",
        params: {
          conversationId: data.conversation_id,
          messageId: data.message_id,
        },
      })
    );
  }

  private async setupNotificationChannels(): Promise<void> {
    const channels: NotificationChannel[] = [
      {
        id: "chat",
        name: "Mensajes de Chat",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      },
      {
        id: "general",
        name: "Notificaciones Generales",
        importance: Notifications.AndroidImportance.DEFAULT,
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        sound: channel.sound,
        vibrationPattern: channel.vibrationPattern,
      });
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      logger.error("Error clearing notification badge:", error);
    }
  }

  async unregister(): Promise<void> {
    try {
      await pushTokenService.deletePushToken();

      await AsyncStorage.removeItem("expo_push_token");

      logger.info("Push notifications unregistered successfully");
    } catch (error) {
      logger.error("Error unregistering push notifications:", error);
      throw new Error("Error al desregistrar notificaciones push");
    }
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    this.isInitialized = false;
  }

  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      logger.error("Error checking notification status:", error);
      return false;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("expo_push_token");
    } catch (error) {
      logger.error("Error getting stored token:", error);
      return null;
    }
  }
}

export default new NotificationService();
