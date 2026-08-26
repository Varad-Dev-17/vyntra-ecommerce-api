import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/order/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order details', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4648d4" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Order not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Order Details</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <Text className="text-sm text-gray-500 mb-1">Order ID</Text>
          <Text className="font-bold text-gray-900 mb-3">#{order.orderId}</Text>
          
          <Text className="text-sm text-gray-500 mb-1">Status</Text>
          <Text className="font-bold text-primary mb-3">{order.orderStatus}</Text>

          <Text className="text-sm text-gray-500 mb-1">Total Amount</Text>
          <Text className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Items</Text>
        {order.items.map((item, index) => {
          const p = item.product;
          const v = item.variant;
          const img = v?.mainImage?.url || p?.images?.[0]?.url || 'https://via.placeholder.com/150';
          return (
            <View key={index} className="flex-row py-4 border-b border-gray-100">
              <Image source={{ uri: img }} className="w-20 h-24 rounded bg-gray-50" />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>{p.name}</Text>
                <Text className="text-xs text-gray-500 mb-2">Qty: {item.quantity}</Text>
                <Text className="text-base font-bold text-gray-900">{formatPrice(item.price)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
