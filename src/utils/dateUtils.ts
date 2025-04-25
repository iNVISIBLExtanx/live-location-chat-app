/**
 * Utility functions for date and time formatting
 */

/**
 * Format a timestamp to display in chat messages
 * @param timestamp ISO string date
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  // Format time part (hours:minutes)
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  if (isToday) {
    // If message is from today, just show the time
    return date.toLocaleTimeString([], timeFormatOptions);
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // If message is from this week, show the day name and time
    return `${date.toLocaleDateString([], { weekday: 'short' })} ${date.toLocaleTimeString([], timeFormatOptions)}`;
  } else {
    // Otherwise show month, day and time
    return `${date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })} ${date.toLocaleTimeString([], timeFormatOptions)}`;
  }
};

/**
 * Format a timestamp for chat session headers or grouping
 * @param timestamp ISO string date
 */
export const formatMessageDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
  
  if (isToday) {
    return 'Today';
  } else if (isYesterday) {
    return 'Yesterday';
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // If within the last week, show the day name
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    // Otherwise show full date
    return date.toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

/**
 * Format a relative time for "last seen" or similar displays
 * @param timestamp ISO string date
 */
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffSeconds < 604800) {
    const days = Math.floor(diffSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    // If more than a week, just show the date
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};
