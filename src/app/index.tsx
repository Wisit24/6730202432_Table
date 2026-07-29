import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://119.59.102.161:3042/api/products';

interface Product {
  id: number;
  name: string;
  size?: string;
  stock: number;
  category: string;
  location: string;
  status: string;
  imageUrl: string;
}

// ==========================================
// 2. MAIN COMPONENT (หน้าจอหลัก)
// ==========================================
export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ฟังก์ชันดึงข้อมูลจาก Backend (ปรับแก้ให้รับข้อมูลผ่าน Web Browser ได้ราบรื่น)
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (Status: ${response.status})`);
      }

      const data: Product[] = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาตรวจสอบการเชื่อมต่อ Backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ฟังก์ชันสำหรับค้นหา
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  // การ์ดแสดงผลสินค้าแต่ละชิ้น
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
          style={styles.productImage}
          contentFit="cover"
        />

        <View style={styles.productDetails}>
          <Text style={styles.stockText}>คงเหลือ: {item.stock ?? 0} ตัว</Text>
          <Text style={styles.categoryText}>หมวดหมู่: {item.category || '-'}</Text>
          <Text style={styles.locationText}>สถานที่: {item.location || '-'}</Text>
          <Text style={styles.sizeText}>ขนาด: {item.size || '-'}</Text>
          <Text style={styles.statusDetailText}>
            สถานะ: <Text style={styles.statusHighlight}>{item.status || '-'}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfbf7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wooden Furniture</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Add Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาเฟอร์นิเจอร์..."
            placeholderTextColor="#a1887f"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ เพิ่มสินค้า</Text>
        </TouchableOpacity>
      </View>

      {/* Body: แสดงสถานะการโหลด หรือ รายการสินค้า */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A0522D" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลสินค้า...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>ลองใหม่อีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          onRefresh={loadData}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>ไม่พบรายการสินค้า</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ==========================================
// 3. STYLES (ตกแต่ง UI)
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbf7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#efebe9',
  },
  menuButton: { width: 38, height: 30, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 18, color: '#4e342e' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#5C4033' },
  profileButton: {
    width: 30,
    height: 30,
    backgroundColor: '#5C4033',
    borderRadius: 15,
    justify: 'center',
    alignItems: 'center',
  },
  profileIcon: { fontSize: 16, color: 'white' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#efebe9',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: { fontSize: 16, color: '#a1887f' },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 5, fontSize: 14, color: '#3e2723' },
  addButton: { backgroundColor: '#A0522D', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  addButtonText: { color: 'white', fontSize: 13, fontWeight: '600' },
  productsList: { padding: 20 },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#efebe9' },
  productDetails: { flex: 1, marginLeft: 15 },
  stockText: { fontSize: 13, fontWeight: '500', color: '#5d4037', marginBottom: 2 },
  categoryText: { fontSize: 13, color: '#795548', marginBottom: 2 },
  locationText: { fontSize: 13, color: '#795548', marginBottom: 2 },
  sizeText: { fontSize: 13, color: '#795548', marginBottom: 2 },
  statusDetailText: { fontSize: 13, color: '#795548' },
  statusHighlight: { fontWeight: '600', color: '#A0522D' },
  moreButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  moreIcon: { fontSize: 22, color: '#8D6E63' },
  productName: { fontSize: 15, fontWeight: '600', color: '#3e2723', lineHeight: 22 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#795548', fontSize: 14 },
  errorText: { color: '#d32f2f', fontSize: 14, textAlign: 'center', marginBottom: 15 },
  retryButton: { backgroundColor: '#8D6E63', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#a1887f' },
});