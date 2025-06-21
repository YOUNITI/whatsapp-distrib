import React, { createContext, useEffect, useState } from 'react';

export const WebSocketContext = createContext(null); // Экспорт контекста

export default function WebSocketProvider({ children }) {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Подключение к WebSocket-серверу (замените URL на ваш)
    const socket = new WebSocket('ws://localhost:5002');
    setWs(socket);

    // Очистка при размонтировании
    return () => {
      if (socket) socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}