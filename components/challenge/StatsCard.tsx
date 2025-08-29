import React from 'react';
import { View, Text } from 'react-native';

interface StatItem {
  value: string | number;
  label: string;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
}

interface StatsCardProps {
  title: string;
  stats: StatItem[];
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, stats, className = "" }) => {
  const getColorClasses = (color?: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      red: 'bg-red-50 text-red-600 border-red-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  return (
    <View className={`bg-white rounded-lg p-4 mb-4 shadow-sm ${className}`}>
      <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
        {title}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {stats.map((stat, index) => (
          <View 
            key={index} 
            className={`rounded-lg p-4 items-center flex-1 min-w-0 mx-1 mb-2 border ${getColorClasses(stat.color)}`}
          >
            <Text className="text-2xl font-bold">
              {stat.value}
            </Text>
            <Text className="text-xs text-center opacity-80 mt-1">
              {stat.icon} {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
