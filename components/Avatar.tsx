import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface AvatarProps {
  profilePictureUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: "small" | "medium" | "large" | "xlarge";
  onPress?: () => void;
  showEditIcon?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  profilePictureUrl,
  firstName = "",
  lastName = "",
  size = "medium",
  onPress,
  showEditIcon = false,
}) => {
  const getInitials = (): string => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "?";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "w-8 h-8",
          text: "text-xs",
          editIcon: "w-3 h-3",
          editIconContainer: "w-5 h-5 -bottom-1 -right-1",
        };
      case "medium":
        return {
          container: "w-12 h-12",
          text: "text-sm",
          editIcon: "w-4 h-4",
          editIconContainer: "w-6 h-6 -bottom-1 -right-1",
        };
      case "large":
        return {
          container: "w-16 h-16",
          text: "text-lg",
          editIcon: "w-5 h-5",
          editIconContainer: "w-8 h-8 -bottom-2 -right-2",
        };
      case "xlarge":
        return {
          container: "w-24 h-24",
          text: "text-xl",
          editIcon: "w-6 h-6",
          editIconContainer: "w-10 h-10 -bottom-2 -right-2",
        };
      default:
        return {
          container: "w-12 h-12",
          text: "text-sm",
          editIcon: "w-4 h-4",
          editIconContainer: "w-6 h-6 -bottom-1 -right-1",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const AvatarContent = () => (
    <View className={`relative ${sizeClasses.container}`}>
      {profilePictureUrl ? (
        <Image
          source={{ uri: profilePictureUrl }}
          className={`${sizeClasses.container} rounded-full`}
          style={{ resizeMode: "cover" }}
        />
      ) : (
        <View
          className={`${sizeClasses.container} rounded-full bg-indigo-100 items-center justify-center`}
        >
          <Text className={`${sizeClasses.text} font-semibold text-indigo-800`}>
            {getInitials()}
          </Text>
        </View>
      )}
      
      {showEditIcon && (
        <View
          className={`absolute ${sizeClasses.editIconContainer} bg-indigo-600 rounded-full items-center justify-center`}
        >
          <Text className={`${sizeClasses.text} text-white font-bold`}>✏️</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};

export default Avatar;
