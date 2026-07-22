import { View, Text, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    bg: "#004a31",
    text: "#27c38a",
  },
  error: {
    bg: "#93000a",
    text: "#ffdad6",
  },
  info: {
    bg: "#1e3a8a",
    text: "#90a8ff",
  },
};

/**
 * Toast notification component for displaying feedback messages.
 *
 * Design system: Pro-Locate Unified System
 */
export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setVisible(false);
      onClose();
    });
  };

  if (!visible) {
    return null;
  }

  const config = typeConfig[type];

  return (
    <Animated.View
      style={{
        opacity,
        backgroundColor: config.bg,
        padding: 16,
        borderRadius: 4,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          color: config.text,
          textAlign: "center",
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
