import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Exercise } from "../types/exercise";
import exerciseService from "../services/exerciseService";

interface VideoUrlEditorProps {
  exercise: Exercise;
  onUpdate: (updatedExercise: Exercise) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const VideoUrlEditor: React.FC<VideoUrlEditorProps> = ({
  exercise,
  onUpdate,
  onCancel,
  isVisible,
}) => {
  const [videoUrl, setVideoUrl] = useState(exercise.video_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState("");

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is valid (removes video)
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleUrlChange = (text: string) => {
    setVideoUrl(text);
    setUrlError("");
    
    if (text.trim() && !validateUrl(text)) {
      setUrlError("Ingresa una URL válida (http:// o https://)");
    }
  };

  const handleSave = async () => {
    if (urlError) return;
    
    if (videoUrl.trim() && !validateUrl(videoUrl)) {
      setUrlError("URL inválida");
      return;
    }

    setIsLoading(true);
    try {
      const updatedExercise = await exerciseService.updateVideoUrl(
        exercise.id,
        videoUrl.trim()
      );
      onUpdate(updatedExercise);
      Alert.alert("Éxito", "URL del video actualizada correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al actualizar URL del video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUrl = async () => {
    if (!videoUrl.trim() || !validateUrl(videoUrl)) {
      Alert.alert("Error", "Ingresa una URL válida para probar");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(videoUrl);
      if (supported) {
        await Linking.openURL(videoUrl);
      } else {
        Alert.alert("Error", "No se puede abrir esta URL");
      }
    } catch (error) {
      Alert.alert("Error", "No se puede abrir esta URL");
    }
  };

  const handleRemoveVideo = () => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres eliminar el video de este ejercicio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setVideoUrl("");
            setUrlError("");
          },
        },
      ]
    );
  };

  if (!isVisible) return null;

  return (
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="bg-white rounded-lg p-6 w-full max-w-md">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Editar Video del Ejercicio
        </Text>
        
        <Text className="text-gray-600 mb-2 font-medium">
          {exercise.name}
        </Text>

        <Text className="text-gray-700 mb-2">URL del Video:</Text>
        
        <TextInput
          className={`border rounded-lg p-3 mb-2 ${
            urlError ? "border-red-500" : "border-gray-300"
          }`}
          value={videoUrl}
          onChangeText={handleUrlChange}
          placeholder="https://ejemplo.com/video.mp4"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          multiline={false}
        />

        {urlError ? (
          <Text className="text-red-500 text-sm mb-3">{urlError}</Text>
        ) : null}

        <Text className="text-gray-500 text-xs mb-4">
          Deja vacío para eliminar el video del ejercicio
        </Text>

        {/* Botones de acción */}
        <View className="flex-row justify-between mb-4">
          {videoUrl.trim() && validateUrl(videoUrl) ? (
            <TouchableOpacity
              onPress={handleTestUrl}
              className="bg-blue-100 px-4 py-2 rounded-lg flex-1 mr-2"
            >
              <Text className="text-blue-600 text-center font-medium">
                Probar URL
              </Text>
            </TouchableOpacity>
          ) : null}

          {exercise.video_url ? (
            <TouchableOpacity
              onPress={handleRemoveVideo}
              className="bg-red-100 px-4 py-2 rounded-lg flex-1 ml-2"
            >
              <Text className="text-red-600 text-center font-medium">
                Eliminar Video
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Botones principales */}
        <View className="flex-row justify-end space-x-3">
          <TouchableOpacity
            onPress={onCancel}
            disabled={isLoading}
            className="bg-gray-100 px-6 py-3 rounded-lg mr-3"
          >
            <Text className="text-gray-600 font-medium">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading || !!urlError}
            className={`px-6 py-3 rounded-lg ${
              isLoading || urlError
                ? "bg-gray-300"
                : "bg-blue-500"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VideoUrlEditor;
