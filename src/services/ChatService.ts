import { supabase } from '../lib/supabase';
import { Message } from '../types';

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  tripId?: string
): Promise<{ data: Message | null; error: any }> => {
  const newMessage = {
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    trip_id: tripId,
    read: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(newMessage)
    .select()
    .single();

  return { data: data as Message, error };
};

// Get conversation history
export const getConversationHistory = async (
  userId1: string,
  userId2: string,
  tripId?: string,
  limit = 20,
  offset = 0
): Promise<{ data: Message[] | null; error: any }> => {
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

  return { data: data as Message[], error };
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  return { error };
};

// Subscribe to new messages in a conversation
export const subscribeToConversation = (
  currentUserId: string,
  otherUserId: string,
  callback: (message: Message) => void
) => {
  const channel = supabase
    .channel(`conversation:${currentUserId}-${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `(sender_id=eq.${otherUserId} AND receiver_id=eq.${currentUserId}) OR (sender_id=eq.${currentUserId} AND receiver_id=eq.${otherUserId})`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Get unread message count
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
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
