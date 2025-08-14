import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Member } from "../types/declarations/trainer";
import trainerService from "../services/trainerService";
import chatService from "../services/chatService";
import AppAlert from "../components/AppAlert";
import authService from "../services/authService";
import ScreenHeader from "../components/ScreenHeader";

interface ChatUserSelectionScreenProps {
  navigation: any;
}

const ChatUserSelectionScreen: React.FC<ChatUserSelectionScreenProps> = ({
  navigation,
}) => {
  const [assignedUsers, setAssignedUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingConversationUserIds, setExistingConversationUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAssignedUsers();
  }, []);

  const loadAssignedUsers = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("No se pudo obtener el usuario actual");
      }

      // Load conversations once to know which users already have a chat
      let ids: Set<number> = new Set();
      try {
        const conversationsResp = await chatService.getConversations();
        const conversationsList = Array.isArray(conversationsResp)
          ? conversationsResp
          : conversationsResp.conversations || [];
        conversationsList.forEach((conv: any) => {
          const otherId = conv?.other_participant?.id;
          if (typeof otherId === "number") ids.add(otherId);
          // Some APIs may return string ids
          if (typeof otherId === "string" && otherId.trim() !== "") {
            const n = Number(otherId);
            if (!Number.isNaN(n)) ids.add(n);
          }
        });
        setExistingConversationUserIds(ids);
      } catch (e) {
        // If conversations load fails, proceed without filtering to avoid blocking UX
        ids = new Set();
        setExistingConversationUserIds(ids);
      }

      const response = await trainerService.getMembers(
        currentUser.id.toString()
      );
      const allAssigned: Member[] = response.members || [];
      // Filter out users with existing conversation
      const filtered = allAssigned.filter((u) => {
        const uidNum = typeof u.id === "string" ? Number(u.id) : (u.id as unknown as number);
        return !ids.has(uidNum);
      });
      setAssignedUsers(filtered);
    } catch (error) {
      console.error("Error loading assigned users:", error);
      AppAlert.error("Error", "No se pudieron cargar los usuarios asignados");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: Member) => {
    try {
      setLoading(true);

      // Check if conversation already exists
      const conversations = await chatService.getConversations();
      const conversationsList = Array.isArray(conversations)
        ? conversations
        : conversations.conversations || [];
      const existingConversation = conversationsList.find(
        (conv: any) => conv.other_participant?.id === user.id
      );

      if (existingConversation) {
        // Navigate to existing conversation
        navigation.replace("Chat", {
          conversationId: existingConversation.id,
          participantName: user.name,
        });
      } else {
        // Create new conversation
        const newConversation = await chatService.createConversation({
          user_id: parseInt(user.id),
        });

        if (newConversation && newConversation.id) {
          navigation.replace("Chat", {
            conversationId: newConversation.id,
            participantName: user.name,
          });
        } else {
          throw new Error(
            "No se pudo crear la conversación - respuesta inválida del servidor"
          );
        }
      }
    } catch (error) {
      console.error("Error creating/accessing conversation:", error);
      AppAlert.error(
        "Error",
        "No se pudo iniciar la conversación con este usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: Member }) => (
    <TouchableOpacity
      className="bg-white p-4 mx-4 mb-3 rounded-lg shadow-sm border border-gray-100"
      onPress={() => handleUserSelect(item)}
      disabled={loading}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4">
          <Text className="text-indigo-600 font-semibold text-lg">
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-lg">
            {item.name}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">{item.email}</Text>
        </View>

        <View className="w-6 h-6 items-center justify-center">
          <Text className="text-indigo-500 text-xl">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && assignedUsers.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-600 mt-4">Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Seleccionar Usuario"
        onBack={() => navigation.goBack()}
      />
      <View className="flex-1">

        {/* User List */}
        {assignedUsers.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-gray-500 text-lg text-center">
              No tienes usuarios asignados
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Contacta al administrador para que te asigne usuarios
            </Text>
          </View>
        ) : (
          <FlatList
            data={assignedUsers}
            renderItem={renderUserItem}
            keyExtractor={(item: Member) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Loading Overlay */}
        {loading && assignedUsers.length > 0 && (
          <View className="absolute inset-0 bg-black/20 justify-center items-center">
            <View className="bg-white p-6 rounded-lg shadow-lg">
              <ActivityIndicator size="large" color="#6366f1" />
              <Text className="text-gray-600 mt-4 text-center">
                Iniciando conversación...
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatUserSelectionScreen;
