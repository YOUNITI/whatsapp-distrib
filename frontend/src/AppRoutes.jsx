import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/Auth/AuthPage';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout'; // Если используете общий лейаут

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout> {/* Опциональная обертка для лейаута */}
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Защищенные маршруты */}
        <Route 
          path="/" 
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />} 
        />
        
        {/* Дополнительные маршруты */}
        <Route path="/chats" element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />} />
        
        {/* Обработка несуществующих путей */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;