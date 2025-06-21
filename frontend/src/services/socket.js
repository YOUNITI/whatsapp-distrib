import { io } from 'socket.io-client';

const SOCKET_URL = 'https://localhost:5000'; // HTTPS!

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket'],
  secure: true, // Важно для HTTPS
  rejectUnauthorized: false, // Только для разработки!
  auth: (cb) => {
    cb({ 
      token: localStorage.getItem('token'),
      userId: JSON.parse(localStorage.getItem('user'))?.phone 
    });
  }
});

// ... остальной код без изменений ...