import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        process.env.CORS_ORIGIN
      ].filter(Boolean),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Join personal room based on user ID for direct notifications
    socket.join(socket.user._id);
    
    // Join a general role room for broadcasts
    if (socket.user.role === 'admin') {
      socket.join('admins');
    } else {
      socket.join('students');
    }

    // Clients can also request to join their specific team room
    socket.on('join_team', (teamId) => {
      if (teamId) {
        socket.join(`team_${teamId}`);
      }
    });

    socket.on('leave_team', (teamId) => {
      if (teamId) {
        socket.leave(`team_${teamId}`);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
