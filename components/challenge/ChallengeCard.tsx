import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatTimeRemaining, getDifficultyColor, getDifficultyText } from '../../utils/challengeUtils';

interface ChallengeCardProps {
  challenge: {
    id: number;
    name: string;
    description: string;
    difficulty_level: number;
    estimated_duration: number;
    end_date: string;
    participants_count?: number;
    completed_attempts?: number;
  };
  onPress: (challengeId: number) => void;
  showStats?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onPress, 
  showStats = false 
}) => {
  const timeRemaining = formatTimeRemaining(challenge.end_date);
  const difficultyColor = getDifficultyColor(challenge.difficulty_level);
  const difficultyText = getDifficultyText(challenge.difficulty_level);

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-4 shadow-sm"
      onPress={() => onPress(challenge.id)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {challenge.name}
          </Text>
          <Text className="text-gray-600 text-sm" numberOfLines={2}>
            {challenge.description}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${difficultyColor}`}>
          <Text className="text-xs font-bold text-white">
            {difficultyText}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-sm">
            ⏰ {timeRemaining}
          </Text>
        </View>
        
        {showStats && (
          <View className="flex-row items-center">
            <Text className="text-blue-600 text-sm font-bold mr-2">
              👥 {challenge.participants_count ?? 0}
            </Text>
            <Text className="text-green-600 text-sm font-bold">
              ✅ {challenge.completed_attempts ?? 0}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
