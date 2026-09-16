import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fibax_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('fibax_auth_token') || null;
  });

  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'

  // Verify session on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('fibax_user', JSON.stringify(data.user));
          } else {
            // Token expired or invalid
            logout();
          }
        })
        .catch(() => {
          // Network offline or failed; keep local cache
        });
    }
  }, [token]);

  // Fetch orders whenever user is authenticated or opens account
  const fetchUserOrders = async () => {
    if (!token) return [];
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/user/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUserOrders(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
    return [];
  };

  useEffect(() => {
    if (currentUser && token) {
      fetchUserOrders();
    }
  }, [currentUser?.id, token]);

  const login = async (identifier, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('fibax_auth_token', data.token);
        localStorage.setItem('fibax_user', JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('fibax_auth_token', data.token);
        localStorage.setItem('fibax_user', JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Registration failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) return { success: false, error: 'Not logged in.' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('fibax_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Update failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setToken(null);
    setCurrentUser(null);
    setUserOrders([]);
    localStorage.removeItem('fibax_auth_token');
    localStorage.removeItem('fibax_user');
    setIsAccountModalOpen(false);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAccountModal = (tab = 'orders') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
    if (currentUser) {
      fetchUserOrders();
    }
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateProfile,
        userOrders,
        loadingOrders,
        fetchUserOrders,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        isAccountModalOpen,
        accountModalTab,
        setAccountModalTab,
        openAccountModal,
        closeAccountModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
