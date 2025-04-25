import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox, AppState, AppStateStatus } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { ConnectionProvider } from './src/contexts/ConnectionContext';
import { TripProvider } from './src/contexts/TripContext';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Import services for ensuring synchronization
import { syncMessageQueue } from './src/services/ChatService'; 

// Main App Component
export default function App() {
  // Handle app state changes to sync data when app goes to background
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App going to background, syncing pending data...');
        
        // Force sync messages
        await syncMessageQueue(true);
        
        // Record last active time
        await AsyncStorage.setItem('last_active', new Date().toISOString());
      } else if (nextAppState === 'active') {
        // App came to foreground
        const lastActiveStr = await AsyncStorage.getItem('last_active');
        if (lastActiveStr) {
          const lastActive = new Date(lastActiveStr);
          const now = new Date();
          const timeDiff = now.getTime() - lastActive.getTime();
          
          console.log(`App was inactive for ${timeDiff / 1000} seconds`);
          
          // If app was inactive for more than 5 minutes, refresh data
          if (timeDiff > 5 * 60 * 1000) {
            console.log('App was inactive for more than 5 minutes, refreshing data...');
            // We'll let the individual components handle their own refreshing
          }
        }
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthProvider>
          <ConnectionProvider>
            <TripProvider>
              <AppNavigator />
            </TripProvider>
          </ConnectionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}