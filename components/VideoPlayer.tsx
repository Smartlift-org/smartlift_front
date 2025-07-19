import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";

interface VideoPlayerProps {
  videoId: string;
  buttonText?: string;
  small?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  buttonText = "Ver video demostrativo",
  small = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getEmbedUrl = (videoId: string) => {
    if (!videoId.includes("/") && !videoId.includes(".")) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (videoId.includes("youtu.be/")) {
      const id = videoId.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    if (videoId.includes("youtube.com/watch?v=")) {
      const id = videoId.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    return videoId.includes("youtube.com/embed/")
      ? videoId
      : `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <>
      <TouchableOpacity
        className={`mb-3 bg-indigo-50 rounded-lg p-3 flex-row items-center justify-center`}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons
          name="play-circle-fill"
          size={small ? 18 : 24}
          color="#4f46e5"
        />
        <Text
          className={`text-indigo-700 ml-2 font-medium ${
            small ? "text-xs" : "text-sm"
          }`}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-80 justify-center items-center p-4">
          <View
            className="bg-white rounded-lg overflow-hidden w-full"
            style={{ maxWidth: 600 }}
          >
            <View className="w-full aspect-video">
              <WebView
                source={{ uri: getEmbedUrl(videoId) }}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
              />
            </View>

            <View className="p-2 border-t border-gray-200">
              <TouchableOpacity
                className="bg-gray-100 rounded-lg p-2 flex-row justify-center items-center"
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color="#6b7280" />
                <Text className="ml-1 font-medium text-gray-700">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default VideoPlayer;
