import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Avatar from "./Avatar";
import AppAlert from "./AppAlert";

interface ProfilePicturePickerProps {
  currentImageUrl?: string | null;
  firstName?: string;
  lastName?: string;
  onImageSelected: (imageUri: string) => Promise<void>;
  size?: "small" | "medium" | "large" | "xlarge";
  disabled?: boolean;
}

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  currentImageUrl,
  firstName,
  lastName,
  onImageSelected,
  size = "xlarge",
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      AppAlert.error(
        "Permisos requeridos",
        "Necesitamos permisos para acceder a tu galería de fotos."
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Seleccionar foto de perfil",
      "¿Cómo te gustaría seleccionar tu foto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Galería",
          onPress: pickImageFromGallery,
        },
        {
          text: "Cámara",
          onPress: pickImageFromCamera,
        },
      ]
    );
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      AppAlert.error("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      AppAlert.error(
        "Permisos requeridos",
        "Necesitamos permisos para acceder a tu cámara."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      AppAlert.error("Error", "No se pudo tomar la foto.");
    }
  };

  const handleImageSelected = async (imageUri: string) => {
    setIsUploading(true);
    try {
      await onImageSelected(imageUri);
    } catch (error) {
      AppAlert.error("Error", "No se pudo actualizar la foto de perfil.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="items-center">
      <TouchableOpacity
        onPress={showImagePickerOptions}
        disabled={disabled || isUploading}
        activeOpacity={0.7}
      >
        <Avatar
          profilePictureUrl={currentImageUrl}
          firstName={firstName}
          lastName={lastName}
          size={size}
          showEditIcon={!disabled}
        />
        {isUploading && (
          <View className="absolute inset-0 bg-black bg-opacity-50 rounded-full items-center justify-center">
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
      
      {!disabled && (
        <TouchableOpacity
          onPress={showImagePickerOptions}
          disabled={isUploading}
          className="mt-2 bg-indigo-100 px-3 py-1 rounded-full"
        >
          <Text className="text-indigo-800 text-xs font-medium">
            {isUploading ? "Subiendo..." : "Cambiar foto"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProfilePicturePicker;
