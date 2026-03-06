import 'react-native-get-random-values';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { JobsProvider } from './src/context/JobsContext';
import { FeedbackModalProvider } from './src/context/FeedbackModalContext';
import AppNavigator from './src/navigation/AppNavigator';

// FeedbackModalProvider must sit inside ThemeProvider (needs useTheme)
// and inside JobsProvider is fine — order only matters for theme access.
const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <FeedbackModalProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </View>
    </FeedbackModalProvider>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <JobsProvider>
          <AppContent />
        </JobsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;