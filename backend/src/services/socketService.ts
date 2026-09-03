import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export class SocketService {
  public static init(server: HttpServer): SocketIOServer {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['*'];

    io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          callback(null, true);
        },
        credentials: true,
      },
      path: '/socket.io',
    });

    io.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
          // Allow connection as guest if no token provided
          socket.data.userId = 'guest';
          return next();
        }

        const secret = process.env.JWT_SECRET || 'supersecretjwtkey';
        const decoded = jwt.verify(token as string, secret) as any;
        socket.data.userId = decoded.id || decoded.userId || 'guest';
        next();
      } catch (err) {
        socket.data.userId = 'guest';
        next();
      }
    });

    io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      if (userId && userId !== 'guest') {
        const roomName = `user:${userId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] User ${userId} joined room ${roomName}`);
      }

      socket.on('join_user_room', (data: { userId: string }) => {
        if (data?.userId) {
          socket.join(`user:${data.userId}`);
        }
      });

      socket.on('disconnect', () => {
        // Disconnected
      });
    });

    console.log('[Socket.IO] Notification Gateway Initialized');
    return io;
  }

  public static getIO(): SocketIOServer | null {
    return io;
  }

  public static emitToUser(userId: string, event: string, payload: any) {
    if (!io) return;
    const roomName = `user:${userId}`;
    io.to(roomName).emit(event, payload);
  }

  public static emitUnreadCount(userId: string, count: number) {
    this.emitToUser(userId, 'notification:unread_count', { unreadCount: count });
  }
}
