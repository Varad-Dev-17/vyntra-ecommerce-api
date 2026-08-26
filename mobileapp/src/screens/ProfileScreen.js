import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { title: 'My Orders', icon: 'cube-outline', route: 'OrdersScreen' },
    { title: 'Returns & Exchanges', icon: 'refresh-circle-outline', route: 'ReturnsScreen' },
    { title: 'Wishlist', icon: 'heart-outline', route: 'Wishlist' },
    { title: 'Saved Addresses', icon: 'location-outline', route: 'AddressScreen' },
    { title: 'Profile Settings', icon: 'settings-outline', route: 'SettingsScreen' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6 border-b border-gray-100 flex-row items-center">
        <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center overflow-hidden mr-4">
          {user?.profileImage?.url ? (
            <Image source={{ uri: user.profileImage.url }} className="w-full h-full" />
          ) : (
            <Text className="text-2xl font-bold text-primary">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        <View>
          <Text className="text-xl font-bold text-gray-900">{user?.username || 'User'}</Text>
          <Text className="text-gray-500">{user?.email || 'email@example.com'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            className="flex-row items-center justify-between p-4 mb-3 bg-gray-50 rounded-xl border border-gray-100"
            onPress={() => item.route ? navigation.navigate(item.route) : null}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm mr-4">
                <Ionicons name={item.icon} size={20} color="#4648d4" />
              </View>
              <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          className="flex-row items-center justify-center p-4 mt-6 border border-red-500 rounded-xl"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2 text-base">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
