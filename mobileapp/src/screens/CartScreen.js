import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axiosConfig';
import Button from '../components/common/Button';

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalMRP: 0, totalDiscount: 0, totalAmount: 0 });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCartItems(res.data.cart?.items || []);
        calculateSummary(res.data.cart?.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (items) => {
    let mrp = 0;
    let amount = 0;
    items.forEach(item => {
      const p = item.product;
      const qty = item.quantity;
      const price = item.selectedVariant?.price || p.price || 0;
      const originalPrice = item.selectedVariant?.mrp || p.mrp || price;
      
      mrp += originalPrice * qty;
      amount += price * qty;
    });
    setSummary({
      totalMRP: mrp,
      totalDiscount: mrp - amount,
      totalAmount: amount
    });
  };

  const updateQuantity = async (productId, variantId, qty) => {
    if (qty < 1) return;
    try {
      await api.post('/cart/update', { productId, variantId, quantity: qty });
      fetchCart();
    } catch (err) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeItem = async (productId, variantId) => {
    try {
      await api.post('/cart/remove', { productId, variantId });
      fetchCart();
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item');
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

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Ionicons name="cart-outline" size={100} color="#e5e7eb" />
        <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">Your Bag is Empty</Text>
        <Text className="text-gray-500 text-center mb-8">Looks like you haven't added anything to your bag yet.</Text>
        <View className="w-full">
          <Button title="Continue Shopping" onPress={() => navigation.navigate('ShopTab')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Shopping Bag</Text>
        <Text className="text-gray-500">{cartItems.length} items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {cartItems.map((item, index) => {
          const p = item.product;
          const v = item.selectedVariant;
          const displayPrice = v?.price || p?.price || 0;
          const displayMrp = v?.mrp || p?.mrp || displayPrice;
          const img = v?.mainImage?.url || p?.images?.[0]?.url || 'https://via.placeholder.com/150';
          
          return (
            <View key={index} className="flex-row py-4 border-b border-gray-100">
              <Image source={{ uri: img }} className="w-24 h-32 rounded bg-gray-50" />
              <View className="flex-1 ml-4 justify-between">
                <View>
                  <Text className="text-xs font-bold uppercase text-primary mb-1">{p.brand?.name || p.brand}</Text>
                  <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>{p.name}</Text>
                  
                  {v?.attributes && (
                    <Text className="text-xs text-gray-500 mb-2">
                      {v.attributes.map(attr => `${attr.attribute.name}: ${attr.attributeOption.value}`).join(' | ')}
                    </Text>
                  )}
                  
                  <View className="flex-row items-center mb-2">
                    <Text className="text-base font-bold text-gray-900 mr-2">{formatPrice(displayPrice)}</Text>
                    {displayMrp > displayPrice && (
                      <Text className="text-xs text-gray-500 line-through">{formatPrice(displayMrp)}</Text>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center bg-gray-50 rounded border border-gray-200">
                    <TouchableOpacity 
                      className="px-3 py-1"
                      onPress={() => updateQuantity(p._id, v?._id, item.quantity - 1)}
                    >
                      <Text className="text-lg font-bold text-gray-600">-</Text>
                    </TouchableOpacity>
                    <Text className="px-3 font-semibold text-gray-900">{item.quantity}</Text>
                    <TouchableOpacity 
                      className="px-3 py-1"
                      onPress={() => updateQuantity(p._id, v?._id, item.quantity + 1)}
                    >
                      <Text className="text-lg font-bold text-gray-600">+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(p._id, v?._id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Order Summary */}
        <View className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Price Details</Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Total MRP</Text>
            <Text className="text-gray-900">{formatPrice(summary.totalMRP)}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Discount</Text>
            <Text className="text-green-600">- {formatPrice(summary.totalDiscount)}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Delivery Charges</Text>
            <Text className="text-green-600">FREE</Text>
          </View>
          <View className="flex-row justify-between py-3 border-t border-gray-200 mt-2">
            <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
            <Text className="text-lg font-bold text-gray-900">{formatPrice(summary.totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-500 font-semibold uppercase">Total Amount</Text>
          <Text className="text-xl font-bold text-gray-900">{formatPrice(summary.totalAmount)}</Text>
        </View>
        <TouchableOpacity 
          className="bg-primary px-8 py-4 rounded-xl"
          onPress={() => navigation.navigate('AddressScreen')}
        >
          <Text className="text-white font-bold text-base">Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
