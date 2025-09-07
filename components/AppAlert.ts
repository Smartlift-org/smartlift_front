import { Alert, AlertButton } from "react-native";

export default {
  error: (title: string, message: string, buttons?: AlertButton[]): void => {
    Alert.alert(
      title,
      message,
      buttons || [{ text: "Aceptar", style: "default" }]
    );
  },
  info: (title: string, message: string, buttons?: AlertButton[]): void => {
    Alert.alert(
      title,
      message,
      buttons || [{ text: "Aceptar", style: "default" }]
    );
  },

  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void => {
    Alert.alert(title, message, [
      {
        text: "Cancelar",
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: "Aceptar",
        style: "default",
        onPress: onConfirm,
      },
    ]);
  },
  success: (title: string, message: string, buttons?: AlertButton[]): void => {
    Alert.alert(
      title,
      message,
      buttons || [{ text: "Aceptar", style: "default" }]
    );
  },
};
