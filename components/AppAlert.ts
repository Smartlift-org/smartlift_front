import { Alert, AlertButton } from "react-native";

/**
 * Servicio de alertas estandarizado con opciones de botones personalizados
 */
export default {
  /**
   * Muestra una alerta de error con botones personalizados
   * @param title Título de la alerta
   * @param message Mensaje de la alerta
   * @param buttons Botones personalizados (opcional)
   */
  error: (
    title: string, 
    message: string, 
    buttons?: AlertButton[]
  ): void => {
    Alert.alert(
      title, 
      message, 
      buttons || [{ text: "Aceptar", style: "default" }]
    );
  },

  /**
   * Muestra una alerta de información con botones personalizados
   * @param title Título de la alerta
   * @param message Mensaje de la alerta
   * @param buttons Botones personalizados (opcional)
   */
  info: (
    title: string, 
    message: string, 
    buttons?: AlertButton[]
  ): void => {
    Alert.alert(
      title, 
      message, 
      buttons || [{ text: "Aceptar", style: "default" }]
    );
  },

  /**
   * Muestra una alerta de confirmación con botones Sí/No
   * @param title Título de la alerta
   * @param message Mensaje de la alerta
   * @param onConfirm Función a ejecutar cuando se confirma
   * @param onCancel Función a ejecutar cuando se cancela (opcional)
   */
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: onCancel
        },
        {
          text: "Aceptar",
          style: "default",
          onPress: onConfirm
        }
      ]
    );
  },

  /**
   * Muestra una alerta de éxito con botones personalizados
   * @param title Título de la alerta
   * @param message Mensaje de la alerta
   * @param buttons Botones personalizados (opcional)
   */
  success: (
    title: string, 
    message: string, 
    buttons?: AlertButton[]
  ): void => {
    Alert.alert(
      title, 
      message, 
      buttons || [{ text: "Aceptar", style: "default" }]
    );
  }
};
