import React from 'react';
import { View, TextInput, Text } from 'react-native';

export default function Input({ label, error, touched, className = '', ...props }) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-gray-700 font-semibold mb-2">{label}</Text>}
      <TextInput
        className={`bg-gray-50 border ${error && touched ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-gray-800 text-base`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && touched && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
