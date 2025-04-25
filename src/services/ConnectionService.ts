import { supabase } from '../lib/supabase';
import { User } from '../types';

export type Connection = {
  id?: string;
  initiator_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

/**
 * Get all connections for the current user
 */
export const getUserConnections = async (userId: string): Promise<{
  data: Connection[] | null;
  error: any;
}> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
    .in('status', ['accepted', 'active']);
  
  return { data: data as Connection[], error };
};

/**
 * Check if two users are connected
 */
export const checkConnectionStatus = async (
  userId1: string,
  userId2: string
): Promise<{
  isConnected: boolean;
  connection: Connection | null;
  error: any;
}> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`and(initiator_id.eq.${userId1},receiver_id.eq.${userId2}),and(initiator_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .in('status', ['accepted', 'active'])
    .maybeSingle();
  
  return {
    isConnected: !!data,
    connection: data as Connection,
    error,
  };
};

/**
 * Create a connection request between users
 */
export const requestConnection = async (
  initiatorId: string,
  receiverId: string
): Promise<{ data: Connection | null; error: any }> => {
  // Check if connection already exists
  const { data: existingConn } = await supabase
    .from('connections')
    .select('*')
    .or(`and(initiator_id.eq.${initiatorId},receiver_id.eq.${receiverId}),and(initiator_id.eq.${receiverId},receiver_id.eq.${initiatorId})`)
    .maybeSingle();
  
  if (existingConn) {
    // If connection exists but is inactive, reactivate it
    if (existingConn.status === 'inactive' || existingConn.status === 'rejected') {
      const { data, error } = await supabase
        .from('connections')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConn.id)
        .select()
        .single();
      
      return { data: data as Connection, error };
    }
    
    // Otherwise return existing connection
    return { data: existingConn as Connection, error: null };
  }
  
  // Create new connection
  const newConnection = {
    initiator_id: initiatorId,
    receiver_id: receiverId,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('connections')
    .insert(newConnection)
    .select()
    .single();
  
  return { data: data as Connection, error };
};

/**
 * Accept a connection request
 */
export const acceptConnection = async (
  connectionId: string,
  userId: string
): Promise<{ data: Connection | null; error: any }> => {
  const { data, error } = await supabase
    .from('connections')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('receiver_id', userId) // Ensure the user accepting is the receiver
    .select()
    .single();
  
  return { data: data as Connection, error };
};

/**
 * Reject a connection request
 */
export const rejectConnection = async (
  connectionId: string,
  userId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('connections')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('receiver_id', userId); // Ensure the user rejecting is the receiver
  
  return { error };
};

/**
 * End an active connection
 */
export const endConnection = async (
  connectionId: string,
  userId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('connections')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`); // Either user can end the connection
  
  return { error };
};

/**
 * Get pending connection requests for a user
 */
export const getPendingConnections = async (
  userId: string
): Promise<{ data: (Connection & { initiator: User })[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*, initiator:users!initiator_id(*)')
    .eq('receiver_id', userId)
    .eq('status', 'pending');
  
  return { data: data as (Connection & { initiator: User })[], error };
};

/**
 * Subscribe to connection changes
 */
export const subscribeToConnections = (
  userId: string,
  callback: (connection: Connection) => void
) => {
  const channel = supabase
    .channel(`connections:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `or(initiator_id=eq.${userId},receiver_id=eq.${userId})`,
      },
      (payload) => {
        callback(payload.new as Connection);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};