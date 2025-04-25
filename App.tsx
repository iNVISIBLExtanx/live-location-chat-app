import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific warnings that might be caused by external libraries
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Setting a timer',
  'Non-serializable values were found in the navigation state',
]);

// Define a custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4285F4',
    accent: '#f1c40f',
    background: '#ffffff',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthProvider>
          <TripProvider>
            <AppNavigator />
          </TripProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
