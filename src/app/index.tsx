import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ⚠️ สำคัญมาก: เอาลิงก์ Raw ที่ก๊อปปี้มาจากเว็บ GitHub ของคุณมาวางแทนที่ตรงนี้ครับ ⚠️
const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/Wisit24/6730202432_Table/refs/heads/main/products.json';

// นิยามประเภทข้อมูลสำหรับ TypeScript (เนื่องจากคุณใช้ไฟล์ .tsx)
interface Product {
  id: string;
  name: string;
  stock: number;
  category: string;
  location: string;
  status: string;
  imageUrl: string;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ดึงข้อมูลเมื่อหน้าจอเปิดขึ้นมา
  useEffect(() => {
    fetch(GITHUB_JSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products from GitHub:', error);
        setLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfbf7" />

      {/* --- ส่วนหัวแอป (Product Header) --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wooden Furniture</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* --- ส่วนค้นหาและฟิลเตอร์ (Search and Filter) --- */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาโต๊ะไม้..."
            placeholderTextColor="#a1887f"
            editable={true}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ เพิ่มสินค้า</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>ตัวกรอง ▼</Text>
        </TouchableOpacity>
      </View>

      {/* --- ส่วนแสดงรายการสินค้า (Products List) --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A0522D" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลสินค้าจาก GitHub...</Text>
        </View>
      ) : (
        <ScrollView style={styles.productsList} showsVerticalScrollIndicator={false}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                {/* รูปภาพสินค้า */}
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                {/* รายละเอียดจำนวน/คลังสินค้า */}
                <View style={styles.productDetails}>
                  <Text style={styles.stockText}>คงเหลือ: {product.stock} ตัว</Text>
                  <Text style={styles.categoryText}>หมวดหมู่: {product.category}</Text>
                  <Text style={styles.locationText}>สถานที่: {product.location}</Text>
                </View>
                {/* ปุ่มสถานะด้านขวา */}
                <View style={styles.productActions}>
                  <TouchableOpacity style={styles.statusButton}>
                    <Text style={styles.statusText}>{product.status}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.moreButton}>
                    <Text style={styles.moreIcon}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* ชื่อสินค้าด้านล่างการ์ด */}
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* --- แถบเมนูด้านล่าง (Bottom Navigation) --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>หน้าแรก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>+</Text>
          <Text style={styles.navText}>เพิ่มสินค้า</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🪵</Text>
          <Text style={[styles.navText, { color: '#8D6E63' }]}>โต๊ะไม้</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📂</Text>
          <Text style={styles.navText}>หมวดหมู่</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfbf7',
  },
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
  menuButton: {
    width: 38,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    color: '#4e342e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5C4033',
  },
  profileButton: {
    width: 30,
    height: 30,
    backgroundColor: '#5C4033',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 16,
    color: 'white',
  },
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
  searchIcon: {
    fontSize: 16,
    color: '#a1887f',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    fontSize: 14,
    color: '#3e2723',
  },
  addButton: {
    backgroundColor: '#A0522D',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  filterText: {
    color: '#A0522D',
    fontSize: 14,
    fontWeight: '500',
  },
  productsList: {
    flex: 1,
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#5c4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#efebe9',
  },
  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  stockText: {
    fontSize: 14,
    color: '#5d4037',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 14,
    color: '#795548',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#795548',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusButton: {
    backgroundColor: '#8D6E63',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 60,
    alignItems: 'center',
    marginRight: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: '#8D6E63',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3e2723',
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#efebe9',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#a1887f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#795548',
    fontSize: 14,
  },
});