import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import { Message } from "../types/chat";

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
  showTimestamp = true,
  isFirstInGroup = true,
  isLastInGroup = true,
}: ChatBubbleProps) => {
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Ayer ${format(date, "HH:mm")}`;
    } else {
      return format(date, "dd/MM/yyyy HH:mm");
    }
  };

  const getMessageStatus = (): string => {
    if (message.read_at) {
      return "Leído";
    }
    return "Enviado";
  };

  return (
    <View
      style={[
        styles.rowContainer,
        isCurrentUser ? styles.alignEnd : styles.alignStart,
        isCurrentUser ? styles.nudgeRight : styles.nudgeLeft,
        isLastInGroup ? styles.rowMarginLarge : styles.rowMarginTight,
      ]}
    >
      <View style={[styles.innerRow, isCurrentUser ? styles.rowReverse : null]}>
        {!isCurrentUser && showAvatar && isFirstInGroup && (
          <View style={styles.avatarWrapper}>
            {message.sender?.profile_picture_url ? (
              <Image
                source={{ uri: message.sender.profile_picture_url }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.fallbackAvatar}>
                <Text style={styles.fallbackAvatarText}>
                  {message.sender.first_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.flex1}>
          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
              isCurrentUser
                ? styles.shadowNone
                : isFirstInGroup || isLastInGroup
                ? styles.shadowLight
                : styles.shadowNone,
              isCurrentUser
                ? isFirstInGroup
                  ? styles.tailCurrentUser
                  : styles.tailCurrentUserGroup
                : isFirstInGroup
                ? styles.tailOtherUser
                : styles.tailOtherUserGroup,
            ]}
          >
            {!isCurrentUser && isFirstInGroup && (
              <Text style={styles.senderName}>
                {message.sender.first_name} {message.sender.last_name}
              </Text>
            )}

            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText,
              ]}
            >
              {message.content}
            </Text>

            {message.message_type !== "text" && (
              <Text
                style={[
                  styles.metaText,
                  isCurrentUser ? styles.metaTextCurrent : styles.metaTextOther,
                ]}
              >
                {message.message_type === "image" && "📷 Imagen"}
                {message.message_type === "file" && "📎 Archivo"}
              </Text>
            )}
          </View>

          {showTimestamp && isLastInGroup && (
            <View
              style={[
                styles.timestampRow,
                isCurrentUser ? styles.alignEnd : styles.alignStart,
              ]}
            >
              <Text style={styles.timestampText}>
                {formatMessageTime(message.created_at)}
                {isCurrentUser && (
                  <Text style={styles.statusText}> • {getMessageStatus()}</Text>
                )}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    paddingHorizontal: 16,
  },
  nudgeLeft: { paddingLeft: 8, paddingRight: 16 },
  nudgeRight: { paddingRight: 8, paddingLeft: 16 },
  rowMarginLarge: { marginBottom: 12 },
  rowMarginTight: { marginBottom: 4 },
  alignEnd: { alignItems: "flex-end" },
  alignStart: { alignItems: "flex-start" },
  innerRow: {
    flexDirection: "row",
    maxWidth: "85%",
  },
  rowReverse: { flexDirection: "row-reverse" },
  flex1: { flex: 1 },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  shadowNone: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  shadowLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  currentUserBubble: {
    backgroundColor: "#3B82F6",
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tailCurrentUser: {
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tailCurrentUserGroup: { borderBottomRightRadius: 16 },
  tailOtherUser: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tailOtherUserGroup: { borderBottomLeftRadius: 16 },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#FFFFFF",
  },
  otherUserText: {
    color: "#1F2937",
  },
  metaText: { fontSize: 12, marginTop: 4 },
  metaTextCurrent: { color: "#DBEAFE" },
  metaTextOther: { color: "#6B7280" },
  senderName: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  avatarWrapper: { marginRight: 12, marginTop: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  fallbackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackAvatarText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  timestampRow: { marginTop: 4, width: "100%" },
  timestampText: { fontSize: 12, color: "#6B7280" },
  statusText: { fontSize: 12, color: "#9CA3AF" },
});

export default ChatBubble;
