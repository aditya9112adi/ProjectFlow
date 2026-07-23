import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { app } from './app.js';
import { connectDB } from './config/database.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = http.createServer(app);
  
  // Initialize WebSocket server
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 ProjectFlow API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`🔌 WebSocket server initialized`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
