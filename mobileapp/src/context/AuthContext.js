import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const payload = jwtDecode(token);
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('profileImage');
          setUser(null);
        } else {
          const storedProfileImage = await AsyncStorage.getItem('profileImage');
          setUser({
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
            isAdmin: payload.isAdmin,
            profileImage: storedProfileImage ? JSON.parse(storedProfileImage) : payload.profileImage,
            mobileNo: payload.mobileNo,
            dateOfBirth: payload.dateOfBirth,
            gender: payload.gender,
            token,
          });
        }
      }
    } catch (err) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('profileImage');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      if (response.data.success) {
        const token = response.data.token;
        await AsyncStorage.setItem('token', token);
        const payload = jwtDecode(token);
        if (payload.profileImage) {
          await AsyncStorage.setItem('profileImage', JSON.stringify(payload.profileImage));
        } else {
          await AsyncStorage.removeItem('profileImage');
        }
        setUser({
          userId: payload.userId,
          email: payload.email,
          username: payload.username,
          isAdmin: payload.isAdmin,
          profileImage: payload.profileImage,
          mobileNo: payload.mobileNo,
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          token,
        });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Something went wrong',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/signout');
    } catch (err) {
      console.log('Signout error:', err);
    }
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('profileImage');
    setUser(null);
  };

  const sendForgotPasswordCode = async (email) => {
    try {
      const response = await api.patch('/auth/send-forgot-password-code', { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send code',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, sendForgotPasswordCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
