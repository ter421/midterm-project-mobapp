import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useJobs } from '../context/JobsContext';
import { RootStackParamList, MainTabParamList } from '../types';
import ThemeToggle from '../components/ThemeToggle';

import JobFinderScreen from '../screens/JobFinderScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ApplicationFormScreen from '../screens/ApplicationFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const HeaderRight = () => <ThemeToggle />;

const MainTabs: React.FC = () => {
  const { theme } = useTheme();
  const { savedJobs, appliedJobs } = useJobs();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text.primary,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: -0.3 },
        headerRight: HeaderRight,
        headerRightContainerStyle: { paddingRight: 16 },
      }}>

      <Tab.Screen
        name="JobFinder"
        component={JobFinderScreen}
        options={{
          title: 'Job Finder',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SavedJobs"
        component={SavedJobsScreen}
        options={{
          title: 'Saved Jobs',
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
          tabBarBadge: savedJobs.length > 0 ? savedJobs.length : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.primary, fontSize: 10 },
        }}
      />

      <Tab.Screen
        name="AppliedJobs"
        component={AppliedJobsScreen}
        options={{
          title: 'My Applications',
          tabBarLabel: 'Applied',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send-outline" size={size} color={color} />
          ),
          tabBarBadge: appliedJobs.length > 0 ? appliedJobs.length : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.accent, fontSize: 10 },
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          // Hide the native header for stack screens that
          // have their own custom in-screen header
          headerShown: false,
          animation: 'slide_from_right',
        }}>

        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="JobDetail"
          component={JobDetailScreen}
        />

        <Stack.Screen
          name="ApplicationForm"
          component={ApplicationFormScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;