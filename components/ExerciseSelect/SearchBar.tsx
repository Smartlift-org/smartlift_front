import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showLevelMatching: boolean;
  onToggleLevelMatching: () => void;
  difficultyLabel: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  showLevelMatching,
  onToggleLevelMatching,
  difficultyLabel,
}) => {
  return (
    <View className="p-4">
      <TextInput
        className="bg-white border border-gray-300 rounded-lg p-3 mb-3"
        placeholder="Buscar ejercicios por nombre o músculos"
        value={searchQuery}
        onChangeText={onSearchChange}
      />

      <TouchableOpacity
        className={`flex-row items-center mb-3 p-3 rounded-lg border ${
          showLevelMatching
            ? "bg-indigo-100 border-indigo-300"
            : "bg-white border-gray-300"
        }`}
        onPress={onToggleLevelMatching}
      >
        <View
          className={`w-5 h-5 rounded mr-2 ${
            showLevelMatching ? "bg-indigo-600" : "border border-gray-400"
          }`}
        >
          {showLevelMatching && (
            <AntDesign name="check" size={16} color="#ffffff" />
          )}
        </View>
        <Text
          className={`${
            showLevelMatching
              ? "font-semibold text-indigo-800"
              : "text-gray-700"
          }`}
        >
          Solo ejercicios para nivel {difficultyLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
