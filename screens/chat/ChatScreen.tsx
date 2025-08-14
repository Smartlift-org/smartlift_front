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
import { RootStackParamList } from "../../types";
import { useChatContext } from "../../contexts/ChatContext";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import { Message } from "../../types/chat";

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
    connectWebSocket,
    sendMessage,
    markAsRead,
    sendTyping,
    sendStopTyping,
    typingIndicators,
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
      // Ensure WS is connected (idempotent)
      try {
        connectWebSocket && connectWebSocket();
      } catch {}

      loadConversation(conversationId);

      // Mark conversation as read when entering
      markAsRead(conversationId);

      return () => {
        // Clean up typing indicators when leaving
        sendStopTyping(conversationId);
      };
    }, [
      conversationId,
      loadConversation,
      markAsRead,
      sendStopTyping,
      connectWebSocket,
    ])
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

  // Hide default navigation header to use custom ScreenHeader
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
    // Normalize IDs to numbers to avoid string/number mismatches
    const currentUserIdNum =
      currentUser?.id != null ? Number(currentUser.id) : undefined;
    const senderIdRaw: any =
      (item as any).sender_id ?? (item as any).sender?.id;
    const senderIdNum = senderIdRaw != null ? Number(senderIdRaw) : undefined;
    const isCurrentUser =
      typeof currentUserIdNum === "number" &&
      !Number.isNaN(currentUserIdNum) &&
      typeof senderIdNum === "number" &&
      !Number.isNaN(senderIdNum) &&
      currentUserIdNum === senderIdNum;

    const thisDate = new Date(item.created_at);
    const prev = index > 0 ? messages[index - 1] : null;
    const next = index < messages.length - 1 ? messages[index + 1] : null;

    const sameSender = (a?: Message | null, b?: Message | null) => {
      if (!a || !b) return false;
      const aId = (a as any).sender_id ?? (a as any).sender?.id;
      const bId = (b as any).sender_id ?? (b as any).sender?.id;
      return Number(aId) === Number(bId);
    };

    const withinMinutes = (a: Date, b: Date, minutes: number) => {
      return Math.abs(a.getTime() - b.getTime()) <= minutes * 60 * 1000;
    };

    const isFirstInGroup =
      !prev ||
      !sameSender(prev, item) ||
      !withinMinutes(new Date(prev.created_at), thisDate, 5);
    const isLastInGroup =
      !next ||
      !sameSender(next, item) ||
      !withinMinutes(new Date(next.created_at), thisDate, 5);

    const isDifferentDayFromPrev =
      !prev ||
      new Date(prev.created_at).toDateString() !== thisDate.toDateString();

    const DateSeparator = ({ date }: { date: Date }) => (
      <View style={{ paddingVertical: 6 }}>
        <Text style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>
          {date.toDateString()}
        </Text>
      </View>
    );

    return (
      <View>
        {isDifferentDayFromPrev && <DateSeparator date={thisDate} />}
        <ChatBubble
          message={item}
          isCurrentUser={isCurrentUser}
          showAvatar={isFirstInGroup}
          showTimestamp={isLastInGroup}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
        />
      </View>
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
      {currentConversation && currentConversation.other_participant && (
        <Text className="text-xs text-gray-400 text-center mt-1">
          {currentConversation.other_participant.role === "coach"
            ? "👨‍💼 Entrenador"
            : "👤 Usuario"}
        </Text>
      )}
    </View>
  );

  const renderTypingIndicator = () => {
    if (!currentConversation) return null;
    const convId = currentConversation.id;
    const activeIndicators = typingIndicators.filter(
      (t) => t.conversationId === convId && t.userId !== currentUser?.id
    );
    if (activeIndicators.length === 0) return null;
    const names = activeIndicators.map((t) => t.userName).join(", ");
    return (
      <View className="px-4 py-1">
        <Text className="text-xs text-blue-500">{names} está escribiendo…</Text>
      </View>
    );
  };

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

      {/* Custom Header */}
      <ScreenHeader
        title={participantName}
        onBack={() => navigation.goBack()}
      />

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
          {renderTypingIndicator()}
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
