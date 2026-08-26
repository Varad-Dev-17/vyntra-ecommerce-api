import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axiosConfig';
import ProductCard from '../components/home/ProductCard';

export default function ShopScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Pagination & Fetch Params
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('newest');
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // UI State
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
    fetchProducts(1, true);
  }, []);

  // Fetch whenever sort or search or filters apply changes
  const applyFilters = () => {
    setShowFilters(false);
    fetchProducts(1, true);
  };

  const fetchFilterOptions = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/categories?limit=50'),
        api.get('/brands?limit=50')
      ]);
      if (catRes.data.success) setCategories(catRes.data.data.categories || []);
      if (brandRes.data.success) setBrands(brandRes.data.data.brands || []);
    } catch (err) {
      console.error('Failed to fetch filter options', err);
    }
  };

  const fetchProducts = async (pageNumber = 1, shouldReset = false) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `/products?page=${pageNumber}&limit=10&sort=${activeSort}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedCategories.length > 0) url += `&categories=${encodeURIComponent(selectedCategories.join(','))}`;
      if (selectedBrands.length > 0) url += `&brands=${encodeURIComponent(selectedBrands.join(','))}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const res = await api.get(url);
      if (res.data.success) {
        const newProducts = res.data.data.products || [];
        if (shouldReset) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
        setHasMore(newProducts.length === 10);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, false);
    }
  };

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item.name)) {
      setList(list.filter(i => i !== item.name));
    } else {
      setList([...list, item.name]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center space-x-3">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput 
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchProducts(1, true)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchProducts(1, true); }}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity className="bg-gray-100 p-2 rounded-lg" onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={24} color={selectedCategories.length > 0 || selectedBrands.length > 0 ? '#4648d4' : 'black'} />
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4648d4" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item._id + index}
          numColumns={2}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              <ProductCard 
                product={item} 
                onPress={() => navigation.navigate('ProductDetails', { slug: item.slug })}
              />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => loadingMore ? <ActivityIndicator size="small" color="#4648d4" className="my-4" /> : null}
          ListEmptyComponent={() => (
            <View className="items-center justify-center mt-20">
              <Text className="text-gray-500 text-lg">No products found.</Text>
            </View>
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">Filters & Sorting</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {/* Sort */}
            <Text className="font-bold text-lg mb-2 text-gray-900">Sort By</Text>
            <View className="flex-row flex-wrap mb-6">
              {[
                { id: 'newest', label: 'Newest Arrivals' },
                { id: 'priceAsc', label: 'Price: Low to High' },
                { id: 'priceDesc', label: 'Price: High to Low' },
                { id: 'ratingDesc', label: 'Highest Rated' },
              ].map(s => (
                <TouchableOpacity 
                  key={s.id} 
                  onPress={() => setActiveSort(s.id)}
                  className={`px-4 py-2 rounded-full border mr-2 mb-2 ${activeSort === s.id ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                >
                  <Text className={activeSort === s.id ? 'text-white font-semibold' : 'text-gray-700'}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price */}
            <Text className="font-bold text-lg mb-2 text-gray-900">Price Range (₹)</Text>
            <View className="flex-row items-center space-x-4 mb-6 pr-4">
              <TextInput 
                className="flex-1 bg-gray-50 border border-gray-200 rounded p-2 text-gray-800"
                placeholder="Min"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text className="text-gray-500">to</Text>
              <TextInput 
                className="flex-1 bg-gray-50 border border-gray-200 rounded p-2 text-gray-800"
                placeholder="Max"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>

            {/* Categories */}
            <Text className="font-bold text-lg mb-2 text-gray-900">Categories</Text>
            <View className="flex-row flex-wrap mb-6">
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat._id} 
                  onPress={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                  className={`px-4 py-2 rounded-full border mr-2 mb-2 ${selectedCategories.includes(cat.name) ? 'bg-indigo-50 border-primary' : 'bg-white border-gray-300'}`}
                >
                  <Text className={selectedCategories.includes(cat.name) ? 'text-primary font-semibold' : 'text-gray-700'}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Brands */}
            <Text className="font-bold text-lg mb-2 text-gray-900">Brands</Text>
            <View className="flex-row flex-wrap mb-10">
              {brands.map(brand => (
                <TouchableOpacity 
                  key={brand._id} 
                  onPress={() => toggleSelection(brand, selectedBrands, setSelectedBrands)}
                  className={`px-4 py-2 rounded-full border mr-2 mb-2 ${selectedBrands.includes(brand.name) ? 'bg-indigo-50 border-primary' : 'bg-white border-gray-300'}`}
                >
                  <Text className={selectedBrands.includes(brand.name) ? 'text-primary font-semibold' : 'text-gray-700'}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-100 flex-row space-x-4 bg-white">
            <TouchableOpacity 
              className="flex-1 py-4 rounded-xl items-center border border-gray-300"
              onPress={() => {
                setSelectedCategories([]);
                setSelectedBrands([]);
                setMinPrice('');
                setMaxPrice('');
                setActiveSort('newest');
              }}
            >
              <Text className="font-bold text-gray-700">Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-primary py-4 rounded-xl items-center"
              onPress={applyFilters}
            >
              <Text className="font-bold text-white">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
