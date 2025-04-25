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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import {
  sendMessage,
  getConversationHistory,
  markMessageAsRead,
  subscribeToConversation,
} from '../services/ChatService';
import { Message } from '../types';
import { RouteProp, useRoute } from '@react-navigation/native';

type ChatScreenParams = {
  userId: string;
  userName: string;
  tripId?: string;
};

type ChatScreenRouteProp = RouteProp<{ Chat: ChatScreenParams }, 'Chat'>;

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute<ChatScreenRouteProp>();
  const { userId: receiverId, userName: receiverName, tripId } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    // Load initial chat history
    loadChatHistory();
    
    // Subscribe to new messages
    const unsubscribe = subscribeToConversation(user.id, receiverId, (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      
      // Mark message as read if received
      if (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id) {
        markMessageAsRead(newMessage.id!);
      }
    });
    
    return () => {
      unsubscribe();
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
    
    try {
      const { data, error } = await sendMessage(user.id, receiverId, messageText, tripId);
      
      if (error) {
        console.error('Error sending message:', error);
      } else if (data) {
        // Add message to the list (this will be handled by the subscription,
        // but we add it immediately for responsive UI)
        setMessages((prevMessages) => [data, ...prevMessages]);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
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
          onChangeText={setInputText}
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
