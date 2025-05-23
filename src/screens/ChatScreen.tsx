import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import {
  sendMessage,
  getConversationHistory,
  markMessageAsRead,
  setupChatPresence,
  subscribeToConversation,
} from '../services/ChatService';
import { Message } from '../types';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

type ChatScreenParams = {
  userId: string;
  userName: string;
  tripId?: string;
};

type ChatScreenRouteProp = RouteProp<{ Chat: ChatScreenParams }, 'Chat'>;

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const { isConnectedWithUser, getConnectionWithUser, requestConnectionWithUser } = useConnection();
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { userId: receiverId, userName: receiverName, tripId } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const presenceRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Add component lifecycle debugging to track when the component is mounted/unmounted
  useEffect(() => {
    console.log('💬 ChatScreen MOUNTED');
    return () => {
      console.log('💬 ChatScreen UNMOUNTED');
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    console.log(`🔌 Setting up chat connections for ${user?.id} with ${receiverId}`);
    
    // Check if connected with the user
    if (!isConnectedWithUser(receiverId) && !tripId) {
      Alert.alert(
        'Not Connected',
        `You are not connected with ${receiverName}. Would you like to send a connection request?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Connect',
            onPress: async () => {
              const connection = await requestConnectionWithUser(receiverId);
              if (connection) {
                Alert.alert(
                  'Connection Request Sent',
                  `${receiverName} will be notified of your request.`
                );
              } else {
                Alert.alert(
                  'Error',
                  'Could not send connection request. Please try again later.'
                );
                navigation.goBack();
              }
            }
          }
        ]
      );
    }
    
    // Load initial chat history
    loadChatHistory();
    
    // Set up presence channel for typing indicators and online status
    const connection = getConnectionWithUser(receiverId);
    
    if (connection || tripId) {
      presenceRef.current = setupChatPresence(user.id, receiverId, {
        onTyping: (isTyping) => {
          setIsOtherUserTyping(isTyping);
        },
        onOnlineStatus: (isOnline) => {
          setIsOtherUserOnline(isOnline);
        },
        onNewMessage: (newMessage) => {
          console.log('🚨 Broadcast message received via onNewMessage callback:', newMessage);
          
          // CRITICAL: Force update UI state with the new message
          setMessages(prevMessages => {
            // Deep copy to ensure React detects the state change
            const updatedMessages = [...prevMessages];
            
            // Check if message already exists to avoid duplicates
            const messageExists = updatedMessages.some(msg => 
              (msg.id && msg.id === newMessage.id) || 
              (msg.sender_id === newMessage.sender_id && 
               msg.created_at === newMessage.created_at && 
               msg.content === newMessage.content)
            );
            
            if (messageExists) {
              console.log('❌ Message already exists in state, not adding again');
              return prevMessages; // No change needed
            }
            
            console.log('✅ Adding new broadcast message to UI state');
            // Add message at the beginning (newest first)
            return [newMessage, ...updatedMessages];
          });
          
          // Mark message as read if received
          if (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id) {
            markMessageAsRead(newMessage.id!);
          }
        }
      });
      
      // Subscribe to database changes for real-time messages
      // This is critical for ensuring messages appear instantly for both sender and receiver
      unsubscribeRef.current = subscribeToConversation(user.id, receiverId, (newMessage) => {
        console.log('Real-time message received from database subscription:', newMessage);
        // Check if message already exists in our list to avoid duplicates
        setMessages((prevMessages) => {
          // Check if we already have this message
          const messageExists = prevMessages.some(msg => 
            msg.id === newMessage.id || 
            (msg.sender_id === newMessage.sender_id && 
             msg.created_at === newMessage.created_at && 
             msg.content === newMessage.content)
          );
          
          if (messageExists) {
            return prevMessages;
          }
          
          // If it's a new message, add it to the list
          return [newMessage, ...prevMessages];
        });
        
        // Mark message as read if received
        if (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id) {
          markMessageAsRead(newMessage.id!);
        }
      });
    }
    
    return () => {
      console.log('🧹 Cleaning up chat connections - THIS SHOULD ONLY HAPPEN WHEN LEAVING THE CHAT SCREEN');
      
      // Clean up presence channel
      if (presenceRef.current && presenceRef.current.cleanup) {
        console.log('🗑️ Cleaning up presence channel');
        presenceRef.current.cleanup();
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        console.log('🗑️ Clearing typing timeout');
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Unsubscribe from conversation updates
      if (unsubscribeRef.current) {
        console.log('🗑️ Unsubscribing from conversation updates');
        unsubscribeRef.current();
      }
    };
  }, [user?.id, receiverId]);

  const loadChatHistory = async (offset = 0) => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      const { data, error } = await getConversationHistory(user.id, receiverId, tripId, 20, offset);
      
      if (error) {
        console.error('Error loading chat history:', error);
      } else if (data) {
        if (offset === 0) {
          setMessages(data);
        } else {
          setMessages((prev) => [...prev, ...data]);
        }
        
        // Mark unread messages as read
        data.forEach((message) => {
          if (message.sender_id === receiverId && message.receiver_id === user.id && !message.read) {
            markMessageAsRead(message.id!);
          }
        });
      }
    } catch (error) {
      console.error('Error in loadChatHistory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.id) return;
    
    const messageText = inputText.trim();
    setInputText('');
    
    console.log(`📤 Trying to send message: "${messageText}"`);
    
    try {
      // Check if we should use presence for sending
      if (presenceRef.current && presenceRef.current.sendPresenceMessage) {
        console.log('📣 Using presence channel for message delivery');
        
        // Create message object
        const newMessage = {
          sender_id: user.id,
          receiver_id: receiverId,
          content: messageText,
          trip_id: tripId,
          read: false,
          created_at: new Date().toISOString(),
        };
        
        console.log('📦 Message object created:', newMessage);
        
        // Update UI BEFORE sending to ensure it appears immediately
        // regardless of network conditions
        console.log('🚀 Adding message to UI immediately');
        setMessages((prevMessages) => {
          console.log('Current message count before adding:', prevMessages.length);
          const newMessages = [newMessage, ...prevMessages];
          console.log('New message count after adding:', newMessages.length);
          return newMessages;
        });
        
        // Send via presence for delivery to other users
        console.log('📡 Sending via presence channel...');
        await presenceRef.current.sendPresenceMessage(newMessage);
        console.log('✅ Message sent successfully via presence');
      } else {
        console.log('⚠️ No presence channel available, using fallback method');
        // Fall back to regular sending
        const { data, error } = await sendMessage(user.id, receiverId, messageText, tripId);
        
        if (error) {
          console.error('❌ Error sending message:', error);
          Alert.alert('Error', 'Failed to send message. Please try again.');
        } else if (data) {
          console.log('✅ Message sent successfully via direct API');
          // Add the message to the list
          setMessages((prevMessages) => [data, ...prevMessages]);
        }
      }
      
      // Clear typing indicator
      if (presenceRef.current && presenceRef.current.setTyping) {
        presenceRef.current.setTyping(false);
      }
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      Alert.alert('Error', 'There was a problem sending your message. Please try again.');
    }
  };

  const handleTextInputChange = (text: string) => {
    setInputText(text);
    
    // Update typing indicator
    if (presenceRef.current && presenceRef.current.setTyping) {
      // Set typing to true
      presenceRef.current.setTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a timeout to clear typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (presenceRef.current && presenceRef.current.setTyping) {
          presenceRef.current.setTyping(false);
        }
      }, 2000);
    }
  };

  const loadMoreMessages = () => {
    if (refreshing || loading || messages.length === 0) return;
    loadChatHistory(messages.length);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.mySentMessage : styles.receivedMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.mySentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.mySentMessageText : styles.receivedMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.mySentMessageTime : styles.receivedMessageTime
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#4285F4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Status bar showing online/typing status */}
      <View style={styles.statusBar}>
        <View style={[
          styles.onlineIndicator,
          isOtherUserOnline ? styles.online : styles.offline
        ]} />
        <Text style={styles.statusText}>
          {isOtherUserTyping ? 'Typing...' : (isOtherUserOnline ? 'Online' : 'Offline')}
        </Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id || item.created_at}
        inverted
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => loadChatHistory()}
        contentContainerStyle={styles.messagesContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={handleTextInputChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.disabledButton
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <FontAwesome name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  mySentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '70%',
  },
  mySentBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  mySentMessageText: {
    color: '#000',
  },
  receivedMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  mySentMessageTime: {
    color: '#7B7B7B',
  },
  receivedMessageTime: {
    color: '#7B7B7B',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    backgroundColor: '#F8F8F8',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#B5B5B5',
  },
});

export default ChatScreen;