import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const ProfileScreen: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'passenger');
  const [saving, setSaving] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        role,
      });
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile');
      } else {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const toggleLocationSharing = () => {
    setLocationSharing(!locationSharing);
    // Implement actual location sharing toggle logic here
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={60} color="#ccc" />
            </View>
          )}
          
          {/* Image upload button, not implemented fully */}
          {isEditing && (
            <TouchableOpacity style={styles.editImageButton}>
              <FontAwesome name="camera" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.userInfoContainer}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your Name"
            />
          ) : (
            <Text style={styles.userName}>{user?.full_name || 'No Name'}</Text>
          )}
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Select Role:</Text>
            <View style={styles.roleToggle}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'passenger' && styles.activeRoleButton,
                ]}
                onPress={() => setRole('passenger')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'passenger' && styles.activeRoleButtonText,
                  ]}
                >
                  Passenger
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'driver' && styles.activeRoleButton,
                ]}
                onPress={() => setRole('driver')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'driver' && styles.activeRoleButtonText,
                  ]}
                >
                  Driver
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setFullName(user?.full_name || '');
                  setRole(user?.role || 'passenger');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>
                  {user?.role ? (user.role === 'driver' ? 'Driver' : 'Passenger') : 'Not set'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Join Date</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Location Sharing</Text>
                <Switch
                  value={locationSharing}
                  onValueChange={toggleLocationSharing}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={locationSharing ? '#4285F4' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <FontAwesome name="edit" size={16} color="white" style={styles.editIcon} />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <FontAwesome name="sign-out" size={16} color="white" style={styles.logoutIcon} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4285F4',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  nameInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    fontSize: 18,
    width: 200,
    textAlign: 'center',
  },
  editSection: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  roleButtonText: {
    color: '#333',
  },
  activeRoleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  infoLabel: {
    color: '#666',
    fontSize: 16,
  },
  infoValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  settingLabel: {
    color: '#666',
    fontSize: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  editIcon: {
    marginRight: 10,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
