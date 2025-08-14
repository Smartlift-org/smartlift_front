import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  placeholder = "Escribe un mensaje...",
  disabled = false,
  maxLength = 1000,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      Alert.alert("Error", "El mensaje no puede estar vacío");
      return;
    }

    if (trimmedMessage.length > maxLength) {
      Alert.alert(
        "Error",
        `El mensaje no puede exceder ${maxLength} caracteres`
      );
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage("");
    handleStopTyping();

    // Focus back to input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleTextChange = (text: string) => {
    setMessage(text);

    // Handle typing indicators
    if (text.trim() && !isTyping) {
      handleStartTyping();
    } else if (!text.trim() && isTyping) {
      handleStopTyping();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    if (text.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 3000);
    }
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.();
    }
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle focus events
  const handleFocus = () => {
    if (message.trim()) {
      handleStartTyping();
    }
  };

  const handleBlur = () => {
    handleStopTyping();
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-end space-x-3">
          {/* Text Input */}
          <View className="flex-1">
            <TextInput
              ref={inputRef}
              value={message}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={maxLength}
              editable={!disabled}
              className={`border border-gray-300 rounded-2xl px-4 py-3 text-base max-h-24 ${
                disabled
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-800"
              }`}
              style={{
                textAlignVertical: "top",
                minHeight: 44,
              }}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />

            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <Text
                className={`text-xs mt-1 text-right ${
                  message.length > maxLength ? "text-red-500" : "text-gray-500"
                }`}
              >
                {message.length}/{maxLength}
              </Text>
            )}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!canSend}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              canSend ? "bg-blue-500" : "bg-gray-300"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={canSend ? "white" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        {/* Status indicators */}
        {disabled && (
          <Text className="text-xs text-gray-500 mt-2 text-center">
            Chat deshabilitado
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatInput;
