import React, { useState } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface PauseReasonModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  pauseReasonOptions: string[];
}

const PauseReasonModal: React.FC<PauseReasonModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  pauseReasonOptions,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [showCustomReasonInput, setShowCustomReasonInput] =
    useState<boolean>(false);
  const [customReason, setCustomReason] = useState<string>("");

  const handleReasonSelect = (reason: string) => {
    if (reason === "Otro") {
      setSelectedReason("");
      setShowCustomReasonInput(true);
    } else {
      setSelectedReason(reason);
      setShowCustomReasonInput(false);
    }
  };

  const handleConfirm = () => {
    const finalReason = showCustomReasonInput ? customReason : selectedReason;
    onConfirm(finalReason);
    setSelectedReason("");
    setCustomReason("");
    setShowCustomReasonInput(false);
  };

  const handleCancel = () => {
    setSelectedReason("");
    setCustomReason("");
    setShowCustomReasonInput(false);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/40 justify-center items-center p-4">
        <View className="bg-white w-full max-w-md rounded-xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Pausar entrenamiento
            </Text>
            <TouchableOpacity onPress={handleCancel}>
              <AntDesign name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-700 mb-4">
            Selecciona una razón para pausar tu entrenamiento:
          </Text>

          <View className="flex-row flex-wrap justify-between mb-4">
            {pauseReasonOptions.map((reason) => (
              <TouchableOpacity
                key={reason}
                className={`w-[48%] p-3 rounded-lg mb-3 ${
                  selectedReason === reason ? "bg-indigo-600" : "bg-gray-100"
                }`}
                onPress={() => handleReasonSelect(reason)}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedReason === reason ? "text-white" : "text-gray-800"
                  }`}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showCustomReasonInput && (
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Especifica la razón:</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3"
                placeholder="Escribe aquí la razón..."
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <View className="flex-row mt-2">
            <TouchableOpacity
              className="flex-1 mr-2 border border-gray-300 rounded-lg py-3"
              onPress={handleCancel}
            >
              <Text className="text-gray-800 text-center font-medium">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 ${
                (showCustomReasonInput && customReason.trim().length === 0) ||
                (!showCustomReasonInput && selectedReason.trim().length === 0)
                  ? "bg-gray-400"
                  : "bg-indigo-600"
              }`}
              onPress={handleConfirm}
              disabled={
                (showCustomReasonInput && customReason.trim().length === 0) ||
                (!showCustomReasonInput && selectedReason.trim().length === 0)
              }
            >
              <Text className="text-white text-center font-medium">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PauseReasonModal;
