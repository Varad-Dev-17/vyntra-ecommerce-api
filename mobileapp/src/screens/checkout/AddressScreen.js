import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/address');
      if (res.data.success) {
        setAddresses(res.data.addresses || []);
        if (res.data.addresses?.length > 0) {
          setSelectedAddress(res.data.addresses[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedAddress) {
      navigation.navigate('PaymentScreen', { addressId: selectedAddress._id });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Select Delivery Address</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4648d4" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {addresses.length === 0 ? (
            <View className="items-center mt-10">
              <Text className="text-gray-500 text-lg">No addresses found.</Text>
            </View>
          ) : (
            addresses.map(address => (
              <TouchableOpacity 
                key={address._id}
                className={`p-4 rounded-xl border mb-4 ${selectedAddress?._id === address._id ? 'border-primary bg-indigo-50/30' : 'border-gray-200 bg-white'}`}
                onPress={() => setSelectedAddress(address)}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-bold text-base text-gray-900">{address.name}</Text>
                  <View className="bg-gray-100 px-2 py-0.5 rounded">
                    <Text className="text-xs font-semibold text-gray-600">{address.addressType}</Text>
                  </View>
                </View>
                <Text className="text-gray-600 mb-1">{address.streetAddress}</Text>
                <Text className="text-gray-600 mb-1">{address.city}, {address.state} {address.pinCode}</Text>
                <Text className="text-gray-800 font-semibold mt-2">Mobile: {address.mobileNo}</Text>
                
                {selectedAddress?._id === address._id && (
                  <View className="absolute top-4 right-4 bg-primary rounded-full p-0.5">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
          
          <TouchableOpacity className="py-4 border border-dashed border-gray-300 rounded-xl items-center justify-center mt-2 flex-row">
            <Ionicons name="add" size={20} color="#4648d4" />
            <Text className="text-primary font-bold ml-2">Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100">
        <TouchableOpacity 
          className={`py-4 rounded-xl items-center ${selectedAddress ? 'bg-primary' : 'bg-gray-300'}`}
          disabled={!selectedAddress}
          onPress={handleContinue}
        >
          <Text className="text-white font-bold text-base">Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
