import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/order');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      case 'Processing': return 'text-blue-600 bg-blue-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Orders</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4648d4" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="p-4 rounded-xl border border-gray-200 bg-white mb-4 flex-row justify-between items-center"
              onPress={() => navigation.navigate('OrderDetailsScreen', { orderId: item.orderId })}
            >
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Order #{item.orderId}</Text>
                <Text className="font-bold text-lg text-gray-900 mb-2">{formatPrice(item.totalAmount)}</Text>
                <View className="flex-row items-center space-x-2">
                  <View className={`px-2 py-1 rounded ${getStatusColor(item.orderStatus).split(' ')[1]}`}>
                    <Text className={`text-xs font-bold ${getStatusColor(item.orderStatus).split(' ')[0]}`}>
                      {item.orderStatus}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="items-center justify-center mt-20">
              <Ionicons name="cube-outline" size={64} color="#e5e7eb" />
              <Text className="text-gray-500 text-lg mt-4">You have no orders yet.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
