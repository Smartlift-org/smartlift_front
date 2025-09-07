import React from 'react';
import { View, Text } from 'react-native';
import { 
  getAttemptStatusColor, 
  getAttemptStatusText, 
  getAttemptStatusEmoji 
} from '../../utils/challengeUtils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusColor = getAttemptStatusColor(status);
  const statusText = getAttemptStatusText(status);
  const statusEmoji = getAttemptStatusEmoji(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <View className={`${statusColor} rounded-full ${sizeClasses[size]}`}>
      <Text className="font-bold text-white text-center">
        {statusEmoji} {statusText}
      </Text>
    </View>
  );
};
