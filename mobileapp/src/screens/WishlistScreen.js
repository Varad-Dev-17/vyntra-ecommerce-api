import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import api from '../api/axiosConfig';
import ProductCard from '../components/home/ProductCard';

export default function WishlistScreen({ navigation }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlistItems(res.data.data.items?.map(i => i.product) || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Wishlist</Text>
        <Text className="text-gray-500">{wishlistItems.length} items</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4648d4" />
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item, index) => item?._id || String(index)}
          numColumns={2}
          contentContainerStyle={{ padding: 10 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              <ProductCard 
                product={item} 
                onPress={() => navigation.navigate('ProductDetails', { slug: item.slug })}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="items-center justify-center mt-20">
              <Text className="text-gray-500 text-lg">Your wishlist is empty.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
