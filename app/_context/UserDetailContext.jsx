'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserDetailContext = createContext(null);

export const UserDetailProvider = ({ children }) => {
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUserDetail(response.data?.user || null);
      return response.data?.user || null;
    } catch (error) {
      setUserDetail(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncUser();
  }, []);

  const signIn = async ({ email, password }) => {
    const response = await axios.post('/api/auth/login', { email, password });
    setUserDetail(response.data?.user || null);
    return response.data;
  };

  const signUp = async ({ name, email, password, adminPassword }) => {
    const response = await axios.post('/api/auth/signup', { name, email, password, adminPassword });
    setUserDetail(response.data?.user || null);
    return response.data;
  };

  const signOut = async () => {
    await axios.post('/api/auth/logout');
    setUserDetail(null);
  };

  const deleteAccount = async () => {
    const response = await axios.post('/api/auth/delete-account');
    setUserDetail(null);
    return response.data;
  };

  return (
    <UserDetailContext.Provider
      value={{
        userDetail,
        setUserDetail,
        loading,
        isAuthenticated: Boolean(userDetail),
        syncUser,
        signIn,
        signUp,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </UserDetailContext.Provider>
  );
};

export const useUserDetail = () => {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error('useUserDetail must be used within a UserDetailProvider');
  }
  return context;
};
