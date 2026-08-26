import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPasswordScreen({ navigation }) {
  const { sendForgotPasswordCode } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    const res = await sendForgotPasswordCode(email);
    setLoading(false);
    if (res.success) {
      Alert.alert('Success', 'Password reset code sent to your email.');
      navigation.navigate('SignIn');
    } else {
      setError(res.message || 'Failed to send code');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <TouchableOpacity 
          className="absolute top-12 left-6 z-10"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-500 font-semibold">Back</Text>
        </TouchableOpacity>

        <View className="mb-8 items-center mt-10">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Reset Password</Text>
          <Text className="text-gray-500 text-center">Enter your email and we'll send you a code to reset your password.</Text>
        </View>

        {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="mt-6">
          <Button 
            title="Send Code" 
            onPress={handleSendCode} 
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
