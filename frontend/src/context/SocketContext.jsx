import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Note: useAuth provides user object. The token is in localStorage, or we can use the API instance defaults.
    const storedToken = localStorage.getItem('token');
    if (user && storedToken) {
      // Connect to the socket server
      // Determine the base URL dynamically based on the current window location or env var
      const socketUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
      
      const socketInstance = io(socketUrl, {
        auth: { token: storedToken },
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to real-time server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
