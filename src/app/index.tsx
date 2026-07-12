import {
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

// 1. ข้อมูลสินค้าจำลองธีมโต๊ะไม้ (พร้อมอัปเดตลิงก์รูปภาพใหม่ให้แสดงผลได้ชัวร์)
const products = [
  {
    id: '1',
    name: 'โต๊ะทำงานไม้สักสไตล์มินิมอล (Teak Minimalist Desk)',
    stock: 3,
    category: 'Wooden Desks',
    location: 'Warehouse A',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    name: 'โต๊ะคอมพิวเตอร์ไม้โอ๊คปรับระดับได้ (Ergonomic Oak Desk)',
    stock: 7,
    category: 'Wooden Desks',
    location: 'Warehouse B',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    name: 'โต๊ะกินข้าวไม้สนรัสเซีย 6 ที่นั่ง (Pine Wood Dining Table)',
    stock: 2,
    category: 'Wooden Tables',
    location: 'Showroom 1',
    status: 'Active',
    // เปลี่ยน URL รูปภาพใหม่ ป้องกันปัญหารูปภาพไม่แสดงผล
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=500&auto=format&fit=crop&q=60',
  },
];

export default function ProductsScreen() {
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

// 2. การกำหนดสไตล์ตกแต่งแอปพลิเคชัน (ปรับเป็นโทนสีไม้ธรรมชาติ)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfbf7', // ปรับพื้นหลังเป็นสีครีมงาช้างนวลๆ เข้ากับสีไม้
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
    color: '#5C4033', // สีน้ำตาลเข้มเนื้อไม้
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
    backgroundColor: '#A0522D', // สีน้ำตาลส้มอิฐ/น้ำตาลทองเด่นชัดสำหรับปุ่ม Action
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
    shadowColor: '#5c4033', // เปลี่ยนเงาให้มีโทนน้ำตาลจางๆ ดูนุ่มนวลขึ้น
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
    backgroundColor: '#8D6E63', // ปรับปุ่ม Active เป็นสีน้ำตาลช็อกโกแลตนม柔和
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
    color: '#3e2723', // สีน้ำตาลเข้มเกือบดำ อ่านง่าย
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
});