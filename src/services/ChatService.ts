import { supabase } from '../lib/supabase';
import { Message } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this to the top level of your OptimizedChatService.ts file
// This exports the syncMessageQueue function needed by App.tsx

// Add this to the top level of your OptimizedChatService.ts file
// This exports the syncMessageQueue function needed by App.tsx

// Make sure this function is exported
export const syncMessageQueue = async (force = false): Promise<boolean> => {
  if (messageQueue.length === 0) return true;
  
  // Only sync if we have enough messages or force is true
  if (!force && messageQueue.length < MESSAGE_BATCH_SIZE) return true;
  
  try {
    console.log(`Syncing ${messageQueue.length} messages to server`);
    
    // Take a snapshot of current queue
    const messagesToSync = [...messageQueue];
    
    // Insert all messages in a single request
    const { data, error } = await supabase
      .from('messages')
      .insert(messagesToSync)
      .select();
    
    if (error) {
      console.error('Error syncing message queue:', error);
      return false;
    }
    
    // Remove synced messages from queue
    messageQueue = messageQueue.filter(msg => {
      // Keep messages that were not in the sync batch
      return !messagesToSync.some(syncMsg => 
        syncMsg.sender_id === msg.sender_id && 
        syncMsg.receiver_id === msg.receiver_id && 
        syncMsg.content === msg.content && 
        syncMsg.created_at === msg.created_at
      );
    });
    
    // Update storage
    await AsyncStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify(messageQueue));
    
    // Update last sync time
    await AsyncStorage.setItem(LAST_MESSAGE_SYNC_KEY, Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Unexpected error in syncMessageQueue:', error);
    return false;
  }
};

// Constants
const MESSAGE_BATCH_SIZE = 10; // Number of messages to store before syncing
const MESSAGE_SYNC_INTERVAL = 30000; // 30 seconds
const UNSENT_MESSAGES_KEY = 'unsent_messages';
const CONVERSATION_CACHE_KEY = 'conversation_cache_';
const LAST_MESSAGE_SYNC_KEY = 'last_message_sync';

// In-memory message queue for batching
let messageQueue: Message[] = [];
let syncTimer: NodeJS.Timeout | null = null;

/**
 * Initialize the message queue and sync timer
 */
const initMessageQueue = () => {
  if (syncTimer) return;
  
  // Load any unsent messages from storage
  AsyncStorage.getItem(UNSENT_MESSAGES_KEY)
    .then(messages => {
      if (messages) {
        messageQueue = JSON.parse(messages);
        console.log(`Loaded ${messageQueue.length} unsent messages from storage`);
      }
    })
    .catch(error => {
      console.error('Error loading unsent messages:', error);
    });
  
  // Start periodic sync
  syncTimer = setInterval(syncMessageQueue, MESSAGE_SYNC_INTERVAL);
  
  // Add event listener for app state changes to sync when app goes to background
  // This would require additional setup with AppState from react-native
};

/**
 * Cache conversation history locally
 */
const cacheConversationHistory = async (
  userId1: string,
  userId2: string,
  messages: Message[]
) => {
  try {
    // Sort by created_at descending (newest first)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Create a conversation ID (consistent regardless of order)
    const conversationId = [userId1, userId2].sort().join('-');
    
    // Save to storage
    await AsyncStorage.setItem(
      CONVERSATION_CACHE_KEY + conversationId,
      JSON.stringify(sortedMessages)
    );
  } catch (error) {
    console.error('Error caching conversation history:', error);
  }
};

/**
 * Get cached conversation history
 */
const getCachedConversationHistory = async (
  userId1: string,
  userId2: string
): Promise<Message[] | null> => {
  try {
    // Create a conversation ID (consistent regardless of order)
    const conversationId = [userId1, userId2].sort().join('-');
    
    const cachedConversation = await AsyncStorage.getItem(
      CONVERSATION_CACHE_KEY + conversationId
    );
    
    if (cachedConversation) {
      return JSON.parse(cachedConversation);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached conversation history:', error);
    return null;
  }
};

/**
 * Send a message with optimized database writes
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  tripId?: string
): Promise<{ data: Message | null; error: any }> => {
  // Ensure message queue is initialized
  if (!syncTimer) {
    initMessageQueue();
  }
  
  const newMessage = {
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    trip_id: tripId,
    read: false,
    created_at: new Date().toISOString(),
  };

  // Add to memory queue
  messageQueue.push(newMessage);
  
  // Update storage
  try {
    await AsyncStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify(messageQueue));
    
    // Update local conversation cache
    const cachedMessages = await getCachedConversationHistory(senderId, receiverId) || [];
    cachedMessages.unshift(newMessage); // Add to beginning (newest first)
    await cacheConversationHistory(senderId, receiverId, cachedMessages);
    
    // Try to sync if we have enough messages
    if (messageQueue.length >= MESSAGE_BATCH_SIZE) {
      syncMessageQueue();
    }
    
    return { data: newMessage, error: null };
  } catch (error) {
    console.error('Error queuing message:', error);
    return { data: null, error };
  }
};

/**
 * Get conversation history with caching strategy
 */
export const getConversationHistory = async (
  userId1: string,
  userId2: string,
  tripId?: string,
  limit = 20,
  offset = 0
): Promise<{ data: Message[] | null; error: any }> => {
  // Force sync any pending messages first
  await syncMessageQueue(true);
  
  try {
    // Try cache first for faster response
    const cachedMessages = await getCachedConversationHistory(userId1, userId2);
    
    // Get database records
    let query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
      .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (tripId) {
      query = query.eq('trip_id', tripId);
    }

    const { data, error } = await query;
    
    if (error) {
      // Return cached data if available, otherwise return error
      if (cachedMessages) {
        const paginatedCache = cachedMessages.slice(offset, offset + limit);
        return { data: paginatedCache, error: null };
      }
      return { data: null, error };
    }
    
    // Update cache with new data
    if (data && data.length > 0) {
      // Merge with existing cache if offset is > 0
      if (offset > 0 && cachedMessages) {
        const mergedMessages = [...cachedMessages];
        // Add new messages that aren't in cache
        data.forEach(newMsg => {
          if (!mergedMessages.some(msg => msg.id === newMsg.id)) {
            mergedMessages.push(newMsg as Message);
          }
        });
        
        // Sort and update cache
        mergedMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        await cacheConversationHistory(userId1, userId2, mergedMessages);
      } else {
        // Replace cache if this is the first page
        await cacheConversationHistory(userId1, userId2, data as Message[]);
      }
    }
    
    // Add any pending messages from the queue that match this conversation
    const pendingMessages = messageQueue.filter(msg => 
      (msg.sender_id === userId1 && msg.receiver_id === userId2) ||
      (msg.sender_id === userId2 && msg.receiver_id === userId1)
    );
    
    // Merge with database results
    const allMessages = [...(data as Message[]), ...pendingMessages];
    
    // Sort by created_at descending (newest first)
    allMessages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Return paginated results
    return { data: allMessages.slice(0, limit), error: null };
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    
    // Return cached data as fallback
    const cachedMessages = await getCachedConversationHistory(userId1, userId2);
    if (cachedMessages) {
      const paginatedCache = cachedMessages.slice(offset, offset + limit);
      return { data: paginatedCache, error: null };
    }
    
    return { data: null, error };
  }
};

/**
 * Mark message as read (optimized)
 */
export const markMessageAsRead = async (messageId: string): Promise<{ error: any }> => {
  // Queue it for next sync if there's no ID (locally created message)
  if (!messageId.includes('-')) {
    return { error: null }; // Local messages don't need marking as read
  }
  
  // Otherwise update in the database directly
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  return { error };
};

/**
 * Use Presence for real-time typing indicators and online status
 * This avoids database writes for ephemeral statuses
 */
export const setupChatPresence = (
  userId: string,
  otherUserId: string,
  callbacks: {
    onTyping?: (isTyping: boolean) => void;
    onOnlineStatus?: (isOnline: boolean) => void;
    onNewMessage?: (message: Message) => void;
  }
) => {
  // Create a unique channel name based on the two user IDs (sorted to be consistent)
  // Sorting ensures both users join the same channel regardless of who created it
  const channelName = `presence:chat:${[userId, otherUserId].sort().join('-')}`;
  
  console.log(`Setting up chat presence channel: ${channelName}`);
  
  // Create the presence channel
  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userId,
      },
    },
  });
  
  // Track presence changes
  channel.on('presence', { event: 'sync' }, () => {
    console.log('Presence sync event received');
    const state = channel.presenceState();
    
    // Check if the other user is present
    const otherUserState = state[otherUserId];
    if (otherUserState && otherUserState.length > 0) {
      const userData = otherUserState[0] as { isTyping?: boolean; presence_ref: string };
      
      // Update typing status
      if (callbacks.onTyping && userData.isTyping !== undefined) {
        callbacks.onTyping(userData.isTyping);
      }
      
      // Update online status
      if (callbacks.onOnlineStatus) {
        callbacks.onOnlineStatus(true);
      }
    } else if (callbacks.onOnlineStatus) {
      callbacks.onOnlineStatus(false);
    }
  });
  
  // Handle broadcast messages (new messages)
  channel.on('broadcast', { event: 'new_message' }, (payload) => {
    console.log('Broadcast message received:', payload);
    if (callbacks.onNewMessage && payload.message) {
      callbacks.onNewMessage(payload.message as Message);
    }
  });
  
  // Subscribe to the channel
  channel.subscribe(async (status) => {
    console.log(`Chat presence channel status: ${status}`);
    if (status !== 'SUBSCRIBED') return;
    
    // Set initial presence
    await channel.track({
      isTyping: false,
      online_at: new Date().toISOString(),
    } as { isTyping: boolean; online_at: string });
  });
  
  // Return functions to update status and send messages
  return {
    setTyping: async (isTyping: boolean) => {
      await channel.track({ isTyping } as { isTyping: boolean });
    },
    
    sendPresenceMessage: async (message: Message) => {
      console.log('Sending presence message:', message);
      
      // Add to local queue for eventual database sync
      messageQueue.push(message);
      await AsyncStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify(messageQueue));
      
      // Broadcast to the channel for immediate delivery
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: { message },
      });
      
      // Update local conversation cache
      const cachedMessages = await getCachedConversationHistory(userId, otherUserId) || [];
      cachedMessages.unshift(message);
      await cacheConversationHistory(userId, otherUserId, cachedMessages);
      
      // Force immediate sync to database to ensure it's available via postgres_changes
      try {
        console.log('Forcing immediate message sync to database');
        await syncMessageQueue(true);
      } catch (error) {
        console.error('Error syncing message to database:', error);
      }
    },
    
    cleanup: () => {
      console.log('Cleaning up chat presence channel');
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Subscribe to conversation updates
 * Use traditional subscription as a fallback for reliable message delivery
 */
export const subscribeToConversation = (
  currentUserId: string,
  otherUserId: string,
  callback: (message: Message) => void
) => {
  // First check if there's cached data
  getCachedConversationHistory(currentUserId, otherUserId).then(cachedMessages => {
    if (cachedMessages) {
      // Sort newest first for consistency with UI
      const sortedMessages = [...cachedMessages].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // Only send the most recent messages to avoid flooding the UI
      sortedMessages.slice(0, 20).forEach(callback);
    }
  });
  
  // Check the message queue for unsent messages to this conversation
  const unsentMessages = messageQueue.filter(msg => 
    (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
    (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
  );
  
  // Call callback with any unsent messages
  unsentMessages.forEach(callback);
  
  console.log(`Setting up realtime subscription for conversation between ${currentUserId} and ${otherUserId}`);
  
  // Create a unique channel name that is the same regardless of which user creates it
  // This ensures both users are listening on the same channel
  const userIds = [currentUserId, otherUserId].sort();
  const channelName = `conversation:${userIds[0]}-${userIds[1]}`;
  
  // Then subscribe to real-time updates
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `(sender_id=eq.${otherUserId} AND receiver_id=eq.${currentUserId}) OR (sender_id=eq.${currentUserId} AND receiver_id=eq.${otherUserId})`,
      },
      (payload) => {
        console.log('Received message via postgres_changes:', payload.new);
        callback(payload.new as Message);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status for conversation: ${status}`);
      
      // If subscription fails, try to resubscribe
      if (status === 'CHANNEL_ERROR') {
        console.error('Channel error, will try to reconnect in 5 seconds');
        setTimeout(() => {
          // Remove the channel and resubscribe
          supabase.removeChannel(channel);
          subscribeToConversation(currentUserId, otherUserId, callback);
        }, 5000);
      }
    });

  return () => {
    console.log('Unsubscribing from conversation channel');
    supabase.removeChannel(channel);
  };
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  // Force sync any pending messages first
  await syncMessageQueue(true);
  
  const { data, error, count } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }

  return count || 0;
};

// Initialize message queue when the service is imported
initMessageQueue();