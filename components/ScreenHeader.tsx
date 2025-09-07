import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactElement | null;
}

const ScreenHeader = ({ title, onBack, rightComponent }: ScreenHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between h-14 px-4 border-b border-gray-100">
      {onBack ? (
        <TouchableOpacity
          className="p-2 w-10 items-center"
          onPress={onBack}
          accessibilityLabel="Volver"
        >
          <AntDesign name="arrowleft" size={24} color="#007AFF" />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}

      <Text className="text-lg font-bold flex-1 text-center" numberOfLines={1}>
        {title}
      </Text>

      {rightComponent ? rightComponent : <View className="w-10" />}
    </View>
  );
};

export default ScreenHeader;
