import React from 'react';
import { View, Text, Image } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Message } from '../types/chat';

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  isCurrentUser, 
  showAvatar = true,
  showTimestamp = true 
}) => {
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: es });
    } else if (isYesterday(date)) {
      return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    }
  };

  const getMessageStatus = (): string => {
    if (message.read_at) {
      return 'Leído';
    }
    return 'Enviado';
  };

  return (
    <View className={`flex-row mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for other user */}
      {!isCurrentUser && showAvatar && (
        <View className="mr-2">
          {message.sender.profile_picture_url ? (
            <Image
              source={{ uri: message.sender.profile_picture_url }}
              className="w-8 h-8 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {message.sender.first_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Message bubble */}
      <View className="flex-1 max-w-[80%]">
        <View
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-blue-500 rounded-br-md'
              : 'bg-gray-200 rounded-bl-md'
          }`}
        >
          {/* Sender name for group chats or coach messages */}
          {!isCurrentUser && (
            <Text className="text-xs text-gray-600 mb-1 font-medium">
              {message.sender.first_name} {message.sender.last_name}
            </Text>
          )}

          {/* Message content */}
          <Text
            className={`text-base ${
              isCurrentUser ? 'text-white' : 'text-gray-800'
            }`}
          >
            {message.content}
          </Text>

          {/* Message metadata */}
          {message.message_type !== 'text' && (
            <Text
              className={`text-xs mt-1 ${
                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {message.message_type === 'image' && '📷 Imagen'}
              {message.message_type === 'file' && '📎 Archivo'}
            </Text>
          )}
        </View>

        {/* Timestamp and status */}
        {showTimestamp && (
          <View className={`mt-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <Text className="text-xs text-gray-500">
              {formatMessageTime(message.created_at)}
              {isCurrentUser && (
                <Text className="text-xs text-gray-400 ml-2">
                  • {getMessageStatus()}
                </Text>
              )}
            </Text>
          </View>
        )}
      </View>

      {/* Spacer for current user messages */}
      {isCurrentUser && showAvatar && <View className="w-8 ml-2" />}
    </View>
  );
};

export default ChatBubble;
