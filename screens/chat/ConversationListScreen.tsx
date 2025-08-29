import React, { useEffect, useState } from "react";
import { View, Text, Alert, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../types";
import { useChatContext } from "../../contexts/ChatContext";
import ConversationList from "../../components/ConversationList";
import ScreenHeader from "../../components/ScreenHeader";
import AppAlert from "../../components/AppAlert";
import { Conversation } from "../../types/chat";
import logger from "../../utils/logger";

type ConversationListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ConversationList"
>;

interface Props {
  navigation: ConversationListScreenNavigationProp;
}

const ConversationListScreen: React.FC<Props> = ({ navigation }) => {
  const { conversations, isLoading, error, loadConversations } =
    useChatContext();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setCurrentUser(userData);
        }
      } catch (error) {
        logger.error("Error loading user data:", error);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (error) {
      AppAlert.error("Error", error);
    }
  }, [error]);

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const handleConversationPress = (conversation: Conversation) => {
    const participant = conversation.other_participant;
    const participantName =
      participant?.first_name && participant?.last_name
        ? `${participant.first_name} ${participant.last_name}`
        : participant?.email || "Usuario";

    navigation.navigate("Chat", {
      conversationId: conversation.id,
      participantName: participantName,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadConversations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateConversation = () => {
    if (currentUser?.role === "coach") {
      navigation.navigate("ChatUserSelection");
    } else {
      Alert.alert(
        "Información",
        "Solo tu entrenador puede iniciar una conversación contigo.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  const getEmptyMessage = (): string => {
    if (currentUser?.role === "coach") {
      return "No tienes conversaciones con tus usuarios aún";
    } else {
      return "Tu entrenador aún no ha iniciado una conversación contigo";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScreenHeader title="Conversaciones" onBack={() => navigation.goBack()} />

      {isLoading && (!conversations || conversations.length === 0) && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Cargando conversaciones...</Text>
        </View>
      )}

      {!isLoading && (
        <ConversationList
          conversations={conversations}
          onConversationPress={handleConversationPress}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          currentUserId={currentUser?.id}
          emptyMessage={getEmptyMessage()}
          showCreateButton={currentUser?.role === "coach"}
          onCreateConversation={handleCreateConversation}
        />
      )}
    </SafeAreaView>
  );
};

export default ConversationListScreen;
