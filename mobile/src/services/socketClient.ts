import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Array<(notification: any) => void> = [];
  private countListeners: Array<(count: number) => void> = [];

  public connect(userId?: string, token?: string) {
    if (this.socket && this.socket.connected) return;

    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    this.socket = io(backendUrl, {
      auth: { token },
      query: { token, userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to server ID:', this.socket?.id);
      if (userId) {
        this.socket?.emit('join_user_room', { userId });
      }
    });

    this.socket.on('notification:new', (notification: any) => {
      this.listeners.forEach((fn) => fn(notification));
    });

    this.socket.on('notification:unread_count', (data: { unreadCount: number }) => {
      if (data && typeof data.unreadCount === 'number') {
        this.countListeners.forEach((fn) => fn(data.unreadCount));
      }
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected');
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public onNewNotification(callback: (notification: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public onUnreadCountChange(callback: (count: number) => void) {
    this.countListeners.push(callback);
    return () => {
      this.countListeners = this.countListeners.filter((l) => l !== callback);
    };
  }
}

export const socketClient = new SocketClient();
