import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

// Existing debug function remains the same
const debugSignupProcess = async (email: string, password: string, fullName: string, selectedRole: UserRole) => {
  // ... keep existing implementation
};

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const { signUp } = useAuth();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [loading, setLoading] = useState(false);
  
  // Add these new state variables for rate limiting
  const [rateLimited, setRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add this effect to log role changes
  useEffect(() => {
    console.log('Current selected role:', role);
  }, [role]);
  
  // Add this effect to clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    // Check if rate limited
    if (rateLimited) {
      Alert.alert('Rate Limited', `Please try again in ${timeRemaining} seconds.`);
      return;
    }
    
    console.log('About to call signUp with role:', role);
    
    // Debug process - keep this
    await debugSignupProcess(email, password, fullName, role);

    setLoading(true);
    try {
      // Pass user data directly to the signUp method
      const userData = {
        full_name: fullName,
        role, // Make sure role is being passed correctly
      };
      
      console.log('Sending user data to signup:', userData);
      
      const { error } = await signUp(email, password, userData);
      
      if (error) {
        // Check for rate limiting error
        if (error.message && error.message.includes('For security purposes')) {
          const waitTimeMatch = error.message.match(/after (\d+) seconds/);
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 60;
          
          setRateLimited(true);
          setTimeRemaining(waitTime);
          
          // Start a countdown timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
              if (prev <= 1) {
                setRateLimited(false);
                if (timerRef.current) clearInterval(timerRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          Alert.alert('Rate Limited', `Please try again in ${waitTime} seconds.`);
        } else {
          Alert.alert('Signup Failed', error.message);
        }
      } else {
        Alert.alert(
          'Signup Successful', 
          'Your account has been created. Please check your email for verification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.roleLabel}>Select Role:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'passenger' && styles.selectedRoleButton,
              ]}
              onPress={() => {
                console.log('Setting role to passenger');
                setRole('passenger');
              }}
            >
              <Text
                style={[
                  styles.roleText,
                  role === 'passenger' && styles.selectedRoleText,
                ]}
              >
                Passenger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'driver' && styles.selectedRoleButton,
              ]}
              onPress={() => {
                console.log('Setting role to driver');
                setRole('driver');
              }}
            >
              <Text
                style={[
                  styles.roleText,
                  role === 'driver' && styles.selectedRoleText,
                ]}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.signupButton,
              (loading || rateLimited) && styles.disabledButton
            ]}
            onPress={handleSignup}
            disabled={loading || rateLimited}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : rateLimited ? (
              <Text style={styles.buttonText}>Try again in {timeRemaining}s</Text>
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  roleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  roleText: {
    color: '#333',
    fontSize: 16,
  },
  selectedRoleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A4C2F4', // Lighter shade for disabled state
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#333',
    fontSize: 14,
  },
  loginLink: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen;