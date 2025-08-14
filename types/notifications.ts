// Push Notifications types for Expo integration

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PushNotificationData {
  type: 'chat_message';
  conversation_id: number;
  message_id: number;
  sender_id: number;
  sender_name: string;
}

export interface NotificationContent {
  title: string;
  body: string;
  data?: PushNotificationData;
}

export interface NotificationResponse {
  notification: {
    request: {
      content: NotificationContent;
    };
  };
  actionIdentifier: string;
}

export interface PushTokenRegistration {
  expo_push_token: string;
  push_notifications_enabled: boolean;
}

export interface NotificationPermission {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
  granted: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  importance: number;
  sound?: string;
  vibrationPattern?: number[];
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  badge: boolean;
  alert: boolean;
}

export interface PushTokenResponse {
  message: string;
  push_notifications_enabled?: boolean;
}
