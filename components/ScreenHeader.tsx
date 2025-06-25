import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactElement | null;
}

/**
 * Componente estandarizado para la cabecera de las pantallas
 * con título y botón de volver opcional
 */
const ScreenHeader = ({ title, onBack, rightComponent }: ScreenHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      {onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel="Volver"
        >
          <AntDesign name="arrowleft" size={24} color="#007AFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderButton} />
      )}
      
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      
      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.placeholderButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  }
});

export default ScreenHeader;
