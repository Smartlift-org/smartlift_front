import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { PrivacySettings } from "../../types/publicProfile";
import publicProfileService from "../../services/publicProfileService";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";

type PrivacySettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PrivacySettings">;
};

const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({
  navigation,
}) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    show_name: true,
    show_profile_picture: true,
    show_workout_count: true,
    show_join_date: false,
    show_personal_records: false,
    show_favorite_exercises: false,
    is_profile_public: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const privacySettings = await publicProfileService.getPrivacySettings();
      setSettings(privacySettings);
    } catch (error) {
      AppAlert.error(
        "Error",
        error instanceof Error ? error.message : "Error al cargar configuración"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings: PrivacySettings = {
      ...settings,
      [key]: value,
    };

    setSettings(newSettings);
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await publicProfileService.updatePrivacySettings(
        settings
      );

      if (response.success) {
        setHasChanges(false);
        AppAlert.success("Exito", "Configuración actualizada exitosamente");
      }
    } catch (error) {
      AppAlert.error(
        "Error",
        error instanceof Error
          ? error.message
          : "Error al guardar configuración"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        "Cambios sin guardar",
        "¿Deseas guardar los cambios antes de salir?",
        [
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
          {
            text: "Guardar",
            onPress: async () => {
              await saveSettings();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderSettingRow = (
    key: keyof PrivacySettings,
    title: string,
    description: string,
    icon: string,
    disabled: boolean = false
  ) => (
    <View
      className={`bg-white px-4 py-4 border-b border-gray-100 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View className="w-8 items-center">
            <FontAwesome5 name={icon} size={16} color="#3B82F6" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="font-medium text-gray-800">{title}</Text>
            <Text className="text-sm text-gray-600 mt-1">{description}</Text>
          </View>
        </View>
        <Switch
          value={settings[key]}
          onValueChange={(value: boolean) => updateSetting(key, value)}
          disabled={disabled}
          trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
          thumbColor={settings[key] ? "#FFFFFF" : "#FFFFFF"}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ScreenHeader
          title="Configuración de Privacidad"
          onBack={handleBackPress}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title="Configuración de Privacidad"
        onBack={handleBackPress}
      />

      <ScrollView className="flex-1">
        <View className="mt-4">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">
              Visibilidad del Perfil
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Controla si otros usuarios pueden ver tu perfil
            </Text>
          </View>

          {renderSettingRow(
            "is_profile_public",
            "Perfil Público",
            "Permite que otros usuarios vean tu perfil",
            "globe"
          )}
        </View>

        <View className="mt-6">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">
              Información del Perfil
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Elige qué información mostrar en tu perfil público
            </Text>
          </View>

          {renderSettingRow(
            "show_name",
            "Mostrar Nombre",
            "Muestra tu nombre completo",
            "user",
            !settings.is_profile_public
          )}

          {renderSettingRow(
            "show_profile_picture",
            "Mostrar Foto de Perfil",
            "Muestra tu foto de perfil",
            "image",
            !settings.is_profile_public
          )}

          {renderSettingRow(
            "show_join_date",
            "Mostrar Fecha de Registro",
            "Muestra cuándo te uniste a la app",
            "calendar",
            !settings.is_profile_public
          )}
        </View>

        <View className="mt-6">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">
              Información de Actividad
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Comparte tu progreso y estadísticas de entrenamiento
            </Text>
          </View>

          {renderSettingRow(
            "show_workout_count",
            "Mostrar Workouts Completados",
            "Muestra cuántos entrenamientos has completado",
            "dumbbell",
            !settings.is_profile_public
          )}

          {renderSettingRow(
            "show_personal_records",
            "Mostrar Records Personales",
            "Muestra tus mejores marcas en ejercicios",
            "trophy",
            !settings.is_profile_public
          )}

          {renderSettingRow(
            "show_favorite_exercises",
            "Mostrar Ejercicios Favoritos",
            "Muestra los ejercicios que más realizas",
            "heart",
            !settings.is_profile_public
          )}
        </View>

        <View className="mx-4 mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <View className="flex-row">
            <FontAwesome5 name="info-circle" size={16} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-sm text-blue-800 font-medium">
                Información sobre privacidad
              </Text>
              <Text className="text-sm text-blue-700 mt-1">
                Solo los datos que elijas mostrar serán visibles para otros
                usuarios. Puedes cambiar estas configuraciones en cualquier
                momento.
              </Text>
            </View>
          </View>
        </View>

        {hasChanges && (
          <View className="mx-4 mt-6 mb-8">
            <TouchableOpacity
              className={`bg-blue-600 rounded-lg py-4 items-center ${
                saving ? "opacity-50" : ""
              }`}
              onPress={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">
                    Guardando...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Guardar Cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettingsScreen;
