import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";

interface CompleteWorkoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (data: {
    perceivedIntensity: number;
    energyLevel: number;
    mood: string;
    notes: string;
  }) => void;
}

const CompleteWorkoutModal: React.FC<CompleteWorkoutModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const [perceivedIntensity, setPerceivedIntensity] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [mood, setMood] = useState<string>("neutral");
  const [notes, setNotes] = useState<string>("");

  const handleConfirm = () => {
    onConfirm({
      perceivedIntensity,
      energyLevel,
      mood,
      notes,
    });
    resetState();
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const resetState = () => {
    setPerceivedIntensity(5);
    setEnergyLevel(5);
    setMood("neutral");
    setNotes("");
  };

  const moodOptions = [
    { value: "great", label: "Excelente", icon: "grin-beam" },
    { value: "good", label: "Bien", icon: "smile" },
    { value: "neutral", label: "Normal", icon: "meh" },
    { value: "bad", label: "Mal", icon: "frown" },
    { value: "terrible", label: "Terrible", icon: "dizzy" },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Completar entrenamiento
            </Text>
            <TouchableOpacity onPress={handleCancel}>
              <AntDesign name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[80vh]">
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                ¿Qué tan intensa te pareció esta sesión?
              </Text>
              <View className="flex-row justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <TouchableOpacity
                    key={val}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      perceivedIntensity === val
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                    onPress={() => setPerceivedIntensity(val)}
                  >
                    <Text
                      className={`font-semibold ${
                        perceivedIntensity === val
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-500">Baja</Text>
                <Text className="text-xs text-gray-500">Alta</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                ¿Cómo estuvo tu nivel de energía?
              </Text>
              <View className="flex-row justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <TouchableOpacity
                    key={val}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      energyLevel === val ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                    onPress={() => setEnergyLevel(val)}
                  >
                    <Text
                      className={`font-semibold ${
                        energyLevel === val ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-500">Baja</Text>
                <Text className="text-xs text-gray-500">Alta</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                ¿Cómo te sentiste durante el entrenamiento?
              </Text>
              <View className="flex-row justify-between">
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-1 items-center justify-center py-3 mx-1 rounded-lg ${
                      mood === option.value ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                    onPress={() => setMood(option.value)}
                  >
                    <FontAwesome5
                      name={option.icon}
                      size={20}
                      color={mood === option.value ? "#ffffff" : "#4b5563"}
                    />
                    <Text
                      className={`text-xs mt-1 ${
                        mood === option.value ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Notas adicionales (opcional)
              </Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-base min-h-24"
                placeholder="Añade aquí cualquier comentario sobre tu entrenamiento..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View className="flex-row mt-4">
            <TouchableOpacity
              className="flex-1 mr-2 border border-gray-300 rounded-lg py-3"
              onPress={handleCancel}
            >
              <Text className="text-gray-800 text-center font-medium">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-indigo-600 rounded-lg py-3"
              onPress={handleConfirm}
            >
              <Text className="text-white text-center font-medium">
                Completar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CompleteWorkoutModal;
