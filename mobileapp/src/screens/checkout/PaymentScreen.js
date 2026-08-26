import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';

export default function PaymentScreen({ route, navigation }) {
  const { addressId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('COD');

  const PAYMENT_METHODS = [
    { id: 'COD', name: 'Cash on Delivery', icon: 'cash-outline' },
    { id: 'CARD', name: 'Credit / Debit Card', icon: 'card-outline' },
    { id: 'UPI', name: 'UPI', icon: 'phone-portrait-outline' }
  ];

  const handlePlaceOrder = async () => {
    if (!addressId) {
      Alert.alert('Error', 'No address selected');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/order/create', {
        shippingAddressId: addressId,
        paymentMethod: selectedMethod,
      });
      
      if (res.data.success) {
        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
        ]);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert('Error', 'An error occurred while placing your order.');
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
        <Text className="text-xl font-bold text-gray-900">Payment</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</Text>
        
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity 
            key={method.id}
            className={`flex-row items-center p-4 rounded-xl border mb-3 ${selectedMethod === method.id ? 'border-primary bg-indigo-50/30' : 'border-gray-200'}`}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
              <Ionicons name={method.icon} size={20} color={selectedMethod === method.id ? '#4648d4' : 'gray'} />
            </View>
            <Text className={`flex-1 font-semibold text-base ${selectedMethod === method.id ? 'text-primary' : 'text-gray-800'}`}>
              {method.name}
            </Text>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedMethod === method.id ? 'border-primary' : 'border-gray-300'}`}>
              {selectedMethod === method.id && <View className="w-3 h-3 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
        ))}

        {selectedMethod === 'CARD' && (
          <View className="p-4 bg-gray-50 rounded-xl mt-2 border border-gray-100">
            <Text className="text-sm text-gray-500 text-center">Card payments will be integrated securely via Stripe/Razorpay in production.</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100">
        <TouchableOpacity 
          className="bg-primary py-4 rounded-xl items-center flex-row justify-center"
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color="white" className="mr-2" />
              <Text className="text-white font-bold text-base ml-2">Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
