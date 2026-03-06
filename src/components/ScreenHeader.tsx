import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, showBack = true }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
              size={24}
              color={theme.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>
        <ThemeToggle />
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 54,
      paddingBottom: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    left: {
      width: 44,
      alignItems: 'flex-start',
    },
    right: {
      width: 44,
      alignItems: 'flex-end',
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholder: {
      width: 36,
      height: 36,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
  });

export default ScreenHeader;