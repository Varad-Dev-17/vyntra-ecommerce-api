import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function Button({ title, onPress, loading = false, disabled = false, className = '' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`bg-primary rounded-xl py-4 items-center justify-center ${disabled || loading ? 'opacity-70' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white font-bold text-lg">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
