import React from 'react';
import { View, Text } from 'react-native';
import { formatTimeRemaining } from '../../utils/challengeUtils';

interface TimeRemainingProps {
  endDate: string;
  showIcon?: boolean;
  className?: string;
}

export const TimeRemaining: React.FC<TimeRemainingProps> = ({ 
  endDate, 
  showIcon = true, 
  className = "text-gray-600 text-sm" 
}) => {
  const timeRemaining = formatTimeRemaining(endDate);
  const isExpired = timeRemaining === "Expirado";

  return (
    <Text className={`${className} ${isExpired ? 'text-red-500' : ''}`}>
      {showIcon && (isExpired ? '❌' : '⏰')} {timeRemaining}
    </Text>
  );
};
