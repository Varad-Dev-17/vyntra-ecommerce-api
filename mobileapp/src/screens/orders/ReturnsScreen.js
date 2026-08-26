import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';

export default function ReturnsScreen({ navigation }) {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get('/returns');
      if (res.data.success) {
        setReturns(res.data.returns || []);
      }
    } catch (error) {
      console.error('Failed to fetch returns', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Returns & Exchanges</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4648d4" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {returns.length === 0 ? (
            <View className="items-center justify-center mt-20">
              <Ionicons name="refresh-circle-outline" size={64} color="#e5e7eb" />
              <Text className="text-gray-500 text-lg mt-4">No returns or exchanges found.</Text>
            </View>
          ) : (
            returns.map(ret => (
              <View key={ret._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 mb-4">
                <Text className="font-bold text-gray-900 mb-1">Return #{ret._id.slice(-6).toUpperCase()}</Text>
                <Text className="text-sm text-gray-600 mb-2">Order ID: {ret.orderId}</Text>
                <Text className="text-sm font-semibold text-primary">{ret.status}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
