import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [whatsappAuth, setWhatsappAuth] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setWhatsappAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        whatsappAuth,
        setWhatsappAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Добавляем кастомный хук для использования контекста
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}