import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  RefreshControl,
  Alert 
} from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (conversation: Conversation) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  currentUserId?: number;
  emptyMessage?: string;
  showCreateButton?: boolean;
  onCreateConversation?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationPress,
  onRefresh,
  isRefreshing = false,
  currentUserId,
  emptyMessage = "No tienes conversaciones aún",
  showCreateButton = false,
  onCreateConversation
}) => {
  const formatLastMessageTime = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: es });
    } else if (isYesterday(date)) {
      return 'Ayer';
    } else {
      return format(date, 'dd/MM', { locale: es });
    }
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.last_message) {
      return 'Sin mensajes';
    }

    const message = conversation.last_message;
    const isCurrentUser = message.sender_id === currentUserId;
    const prefix = isCurrentUser ? 'Tú: ' : '';

    switch (message.message_type) {
      case 'image':
        return `${prefix}📷 Imagen`;
      case 'file':
        return `${prefix}📎 Archivo`;
      default:
        const content = message.content;
        return `${prefix}${content.length > 50 ? content.substring(0, 50) + '...' : content}`;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const participant = item.other_participant;
    const hasUnreadMessages = item.unread_count > 0;
    const lastMessageTime = formatLastMessageTime(item.last_message_at);
    const lastMessagePreview = getLastMessagePreview(item);

    return (
      <TouchableOpacity
        onPress={() => onConversationPress(item)}
        className={`bg-white px-4 py-4 border-b border-gray-100 ${
          hasUnreadMessages ? 'bg-blue-50' : ''
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="mr-3">
            {participant.profile_picture_url ? (
              <Image
                source={{ uri: participant.profile_picture_url }}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  {participant.first_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            {/* Online indicator (placeholder for future implementation) */}
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </View>

          {/* Conversation info */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className={`text-base ${hasUnreadMessages ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                {participant.first_name} {participant.last_name}
              </Text>
              
              <View className="flex-row items-center">
                {lastMessageTime && (
                  <Text className={`text-xs ${hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {lastMessageTime}
                  </Text>
                )}
                
                {hasUnreadMessages && (
                  <View className="ml-2 bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                    <Text className="text-white text-xs font-bold">
                      {item.unread_count > 99 ? '99+' : item.unread_count}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Role indicator */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-sm ${hasUnreadMessages ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                  {lastMessagePreview}
                </Text>
                
                <Text className="text-xs text-gray-500 mt-1">
                  {participant.role === 'coach' ? '👨‍💼 Entrenador' : '👤 Usuario'}
                </Text>
              </View>

              {/* Chevron */}
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#9CA3AF"
                className="ml-2"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
      <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
        {emptyMessage}
      </Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        {showCreateButton 
          ? "Inicia una conversación con tus usuarios asignados"
          : "Tu entrenador puede iniciar una conversación contigo"
        }
      </Text>
      
      {showCreateButton && onCreateConversation && (
        <TouchableOpacity
          onPress={onCreateConversation}
          className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
          activeOpacity={0.7}
        >
          <Text className="text-white font-medium">
            Nueva Conversación
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View className="bg-gray-50 px-4 py-2">
      <Text className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        Conversaciones ({conversations.length})
      </Text>
    </View>
  );

  if (conversations.length === 0) {
    return renderEmptyState();
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversationItem}
        ListHeaderComponent={renderHeader}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-100 ml-16" />}
      />
    </View>
  );
};

export default ConversationList;
