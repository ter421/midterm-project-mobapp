import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.btn}
      activeOpacity={0.65}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={22}
        color={theme.text.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
  },
});

export default ThemeToggle;