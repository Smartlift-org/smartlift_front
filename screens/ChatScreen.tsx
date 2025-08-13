import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../types";
import { useChatContext } from "../contexts/ChatContext";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import AppAlert from "../components/AppAlert";
import { Message } from "../types/chat";

type ChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Chat"
>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

interface Props {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { conversationId, participantName } = route.params;

  const {
    currentConversation,
    messages,
    isLoading,
    error,
    loadConversation,
    sendMessage,
    markAsRead,
    sendTyping,
    sendStopTyping,
  } = useChatContext();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList | null>(null);

  // Load current user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserInfo();
  }, []);

  // Load conversation when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadConversation(conversationId);

      // Mark conversation as read when entering
      markAsRead(conversationId);

      return () => {
        // Clean up typing indicators when leaving
        sendStopTyping(conversationId);
      };
    }, [conversationId, loadConversation, markAsRead, sendStopTyping])
  );

  // Handle errors from context
  useEffect(() => {
    if (error) {
      AppAlert.error("Error", error);
    }
  }, [error]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: participantName,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-row items-center ml-2"
        >
          <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          <Text className="text-blue-500 text-base ml-1">Atrás</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            // TODO: Add chat options menu (clear chat, block user, etc.)
            Alert.alert(
              "Opciones de Chat",
              "Funciones adicionales próximamente",
              [{ text: "OK", style: "default" }]
            );
          }}
          className="mr-4"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#3B82F6" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, participantName]);

  const handleSendMessage = async (messageText: string) => {
    try {
      await sendMessage(conversationId, messageText);
      // Auto-scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    sendTyping(conversationId);
  };

  const handleStopTyping = () => {
    sendStopTyping(conversationId);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.sender_id === currentUser?.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar =
      !previousMessage || previousMessage.sender_id !== item.sender_id;
    const showTimestamp = true; // Could be optimized to show only for certain intervals

    return (
      <ChatBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
      />
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
      <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
        Inicia la conversación
      </Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        Envía tu primer mensaje a {participantName}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 py-2">
      <Text className="text-xs text-gray-500 text-center">
        Chat con {participantName}
      </Text>
      {currentConversation && (
        <Text className="text-xs text-gray-400 text-center mt-1">
          {currentConversation.other_participant.role === "coach"
            ? "👨‍💼 Entrenador"
            : "👤 Usuario"}
        </Text>
      )}
    </View>
  );

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Cargando conversación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages List */}
        <View className="flex-1 bg-gray-50">
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item: Message) => item.id.toString()}
              renderItem={renderMessage}
              ListHeaderComponent={renderHeader}
              contentContainerStyle={{ paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                // Auto-scroll to bottom when content changes
                flatListRef.current?.scrollToEnd({ animated: false });
              }}
              onLayout={() => {
                // Auto-scroll to bottom on initial layout
                flatListRef.current?.scrollToEnd({ animated: false });
              }}
            />
          )}

          {/* TODO: Typing Indicator - needs typingIndicators from context */}
        </View>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          placeholder={`Mensaje para ${participantName}...`}
          disabled={!currentConversation}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
