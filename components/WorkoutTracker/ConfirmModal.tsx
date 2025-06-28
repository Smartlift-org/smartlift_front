import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmType: "success" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  confirmType,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/40 justify-center items-center p-4">
        <View className="bg-white w-full max-w-md rounded-xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onCancel}>
              <AntDesign name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-700 mb-6">{message}</Text>

          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 mr-2 border border-gray-300 rounded-lg py-3"
              onPress={onCancel}
            >
              <Text className="text-gray-800 text-center font-medium">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 ${
                confirmType === "danger" ? "bg-red-500" : "bg-green-600"
              }`}
              onPress={onConfirm}
            >
              <Text className="text-white text-center font-medium">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
