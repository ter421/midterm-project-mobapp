import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched,
  iconName,
  ...inputProps
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const hasError = !!error && touched;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrap,
        hasError && styles.inputWrapError,
      ]}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={hasError ? theme.danger : theme.text.tertiary}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            inputProps.multiline && styles.multiline,
          ]}
          placeholderTextColor={theme.text.placeholder}
          {...inputProps}
        />
      </View>
      {hasError ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={theme.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.secondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    inputWrapError: {
      borderColor: theme.danger,
      backgroundColor: theme.dangerLight,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.text.primary,
      paddingVertical: 14,
    },
    multiline: {
      minHeight: 130,
      textAlignVertical: 'top',
      paddingTop: 14,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      gap: 5,
    },
    errorText: {
      fontSize: 12,
      color: theme.danger,
      flex: 1,
    },
  });

export default FormInput;