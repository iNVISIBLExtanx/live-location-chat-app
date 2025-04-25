import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';

// Create a temporary profile screen until it's properly implemented
const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Profile
      </Text>
      {user && (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Name: {user.full_name || 'Not set'}
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Email: {user.email}
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            Role: {user.role || 'Not set'}
          </Text>
        </>
      )}
      <TouchableOpacity 
        style={{
          backgroundColor: '#4285F4',
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
        onPress={() => signOut()}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Create a temporary settings screen until it's properly implemented
const SettingsScreen = () => {
  const [locationPermission, setLocationPermission] = React.useState('checking...');
  
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status);
      } catch (error) {
        console.error('Error checking location permission:', error);
        setLocationPermission('error');
      }
    };
    
    checkPermission();
  }, []);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Settings
      </Text>
      <View style={{ marginBottom: 20, width: '100%' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>
          Location Permission: {locationPermission}
        </Text>
        <TouchableOpacity 
          style={{
            backgroundColor: '#4285F4',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
          }}
          onPress={async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              console.error('Error opening settings:', error);
              Alert.alert('Error', 'Could not open settings');
            }
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Open Location Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stack Navigator Param Lists
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Chat: {
    userId: string;
    userName: string;
    tripId?: string;
  };
};

export type TabParamList = {
  Map: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Auth navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'question-circle';
          
          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }
          
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Live Map' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

// Main navigator with tabs and chat
const MainNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }: any) => ({
          title: route.params.userName,
        })}
      />
    </MainStack.Navigator>
  );
};

// Root navigator
export const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {session ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
