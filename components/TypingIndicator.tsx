import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

interface TypingIndicatorProps {
  userName: string;
  show: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  show,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const animateDots = () => {
        const createDotAnimation = (dot: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          createDotAnimation(dot1, 0),
          createDotAnimation(dot2, 200),
          createDotAnimation(dot3, 400),
        ]).start();
      };

      animateDots();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }
  }, [show, fadeAnim, dot1, dot2, dot3]);

  if (!show) {
    return null;
  }

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-row items-center mb-3 px-4"
    >
      <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-2">
        <Text className="text-white text-xs font-bold">
          {userName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-2">
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm mr-2">
            {userName} está escribiendo
          </Text>

          <View className="flex-row space-x-1">
            <Animated.View
              style={{
                opacity: dot1,
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
              className="w-2 h-2 bg-gray-500 rounded-full"
            />
            <Animated.View
              style={{
                opacity: dot2,
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
              className="w-2 h-2 bg-gray-500 rounded-full"
            />
            <Animated.View
              style={{
                opacity: dot3,
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
              className="w-2 h-2 bg-gray-500 rounded-full"
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default TypingIndicator;
