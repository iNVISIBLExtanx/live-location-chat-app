import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import { User } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type UserListNavigationProp = StackNavigationProp<MainStackParamList>;

const RoleBasedUserListScreen: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { 
    isConnectedWithUser, 
    requestConnectionWithUser, 
    connections, 
    pendingConnections,
    acceptConnectionRequest,
  } = useConnection();
  const navigation = useNavigation<UserListNavigationProp>();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<User[]>([]);

  // Get opposite role from current user
  const targetRole = currentUser?.role === 'driver' ? 'passenger' : 'driver';

  useEffect(() => {
    fetchUsers();
    fetchConnectionRequests();
  }, [currentUser?.id, connections, pendingConnections]);

  const fetchUsers = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch users with opposite role
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUser.id)
        .eq('role', targetRole);
      
      if (error) {
        console.error('Error fetching users:', error);
      } else if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConnectionRequests = async () => {
    // Convert pending connections to an array of users
    const requests: User[] = [];
    pendingConnections.forEach(conn => {
      if (conn.receiver_id === currentUser?.id) {
        requests.push(conn.initiator);
      }
    });
    setConnectionRequests(requests);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
    fetchConnectionRequests();
  };

  const handleUserPress = async (selectedUser: User) => {
    if (!currentUser?.id) return;
    
    // Check if already connected
    if (isConnectedWithUser(selectedUser.id)) {
      // If connected, navigate to chat
      navigation.navigate('Chat', {
        userId: selectedUser.id,
        userName: selectedUser.full_name || 'User',
      });
    } else {
      // If not connected, prompt to connect
      Alert.alert(
        'Connect with user',
        `Would you like to connect with ${selectedUser.full_name || 'this user'}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Connect',
            onPress: async () => {
              const connection = await requestConnectionWithUser(selectedUser.id);
              if (connection) {
                Alert.alert(
                  'Connection request sent',
                  'The user will be notified of your request.'
                );
              } else {
                Alert.alert(
                  'Error',
                  'Could not send connection request. Please try again later.'
                );
              }
            }
          }
        ]
      );
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    const connection = await acceptConnectionRequest(connectionId);
    if (connection) {
      Alert.alert(
        'Connection Accepted',
        'You are now connected with this user'
      );
      fetchUsers(); // Refresh list
    } else {
      Alert.alert(
        'Error',
        'Could not accept connection request. Please try again later.'
      );
    }
  };

  const getConnectionStatus = (userId: string) => {
    // Check if there's a pending request from this user
    for (const [id, conn] of pendingConnections.entries()) {
      if (conn.initiator_id === userId && conn.receiver_id === currentUser?.id) {
        return {
          status: 'pending',
          connectionId: id
        };
      }
    }
    
    // Check if already connected
    if (isConnectedWithUser(userId)) {
      return {
        status: 'connected'
      };
    }
    
    return {
      status: 'none'
    };
  };

  const renderConnectionRequest = ({ item }: { item: User }) => {
    // Find the connection ID
    let connectionId = '';
    for (const [id, conn] of pendingConnections.entries()) {
      if (conn.initiator_id === item.id && conn.receiver_id === currentUser?.id) {
        connectionId = id;
        break;
      }
    }
    
    return (
      <View style={styles.connectionRequest}>
        <View style={styles.requestUserInfo}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.requestAvatar} />
          ) : (
            <View style={styles.requestAvatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.full_name ? item.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.requestUserName}>{item.full_name || 'User'}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptConnection(connectionId)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const connectionStatus = getConnectionStatus(item.id);
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={24} color="#888" />
            </View>
          )}
          <View style={[
            styles.statusIndicator,
            connectionStatus.status === 'connected' ? styles.statusConnected : styles.statusOffline,
          ]} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name || 'User'}</Text>
          <Text style={styles.userRole}>
            {item.role === 'driver' ? 'Driver' : 'Passenger'}
          </Text>
        </View>
        
        {connectionStatus.status === 'connected' ? (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', {
              userId: item.id,
              userName: item.full_name || 'User',
            })}
          >
            <FontAwesome name="comment" size={16} color="white" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        ) : connectionStatus.status === 'pending' ? (
          <TouchableOpacity 
            style={styles.pendingButton}
            onPress={() => handleAcceptConnection(connectionStatus.connectionId!)}
          >
            <Text style={styles.pendingButtonText}>Accept</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => handleUserPress(item)}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {connectionRequests.length > 0 && (
        <View style={styles.requestsContainer}>
          <Text style={styles.requestsTitle}>Connection Requests</Text>
          <FlatList
            data={connectionRequests}
            renderItem={renderConnectionRequest}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4285F4']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No {targetRole}s found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#E8F0FE',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  connectButtonText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  pendingButton: {
    backgroundColor: '#FFECB3',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pendingButtonText: {
    color: '#FF8F00',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  requestsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectionRequest: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#888',
  },
  requestUserName: {
    fontWeight: '500',
    fontSize: 16,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default RoleBasedUserListScreen;