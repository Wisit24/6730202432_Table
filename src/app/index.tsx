import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AdminManagement from '../app/AdminManagement';

const BASE_URL = 'http://119.59.102.161:3042/api';
const PHP_REGISTER_URL = 'http://119.59.102.161:3042/api/register';

// ==========================================
// 1. INTERFACES (โครงสร้างข้อมูล Typescript)
// ==========================================
interface Product {
  id: number;
  name: string;
  size?: string; // รองรับฟิลด์ขนาดจาก DB
  stock: number;
  price?: number;
  category: string;
  location: string; // ฟิลด์สถานที่เก็บ / ที่สร้าง
  status: string;
  imageUrl?: string;
  quantity?: number;
}

interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
}

interface Order {
  id: string;
  username: string;
  items: Product[];
  totalAmount: number;
  slipUrl: string;
  status: 'รอตรวจสอบ' | 'อนุมัติแล้ว' | 'ปฏิเสธ';
  createdAt: string;
}

const CATEGORIES = [
  'โต๊ะกินข้าว',
  'โต๊ะอเนกประสงค์',
  'โต๊ะเกมมิ่ง',
];

const showAlert = (title: string, msg: string) => {
  if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
  else Alert.alert(title, msg);
};

export default function HomeScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // ==========================================
  // 2. STATE MANAGEMENT (ตัวแปรสถานะต่างๆ ของระบบ)
  // ==========================================
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ตัวกรองสินค้า (Filter State)
  const [filterInStock, setFilterInStock] = useState<boolean>(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ทั้งหมด');

  // Modal จัดการสินค้า (Admin)
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal รายละเอียดสินค้า
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Modal ขยายรูปภาพสินค้า
  const [isImageZoomModalVisible, setIsImageZoomModalVisible] = useState<boolean>(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string>('');

  // ตะกร้าสินค้า, โค้ดส่วนลด และสลิป (Cart, Slip & Promo State)
  const [cart, setCart] = useState<Product[]>([]);
  const [cartModalVisible, setCartModalVisible] = useState<boolean>(false);
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'percent' | 'fixed'; value: number } | null>(null);

  // จัดการออเดอร์ (Admin Orders State & Modal)
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOrdersModalVisible, setAdminOrdersModalVisible] = useState<boolean>(false);

  // ==========================================
  // 3. API & HANDLERS (ฟังก์ชันจัดการการทำงานหลังบ้าน)
  // ==========================================
  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) return showAlert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบ');
    setAuthLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        fetchProducts();
      } else {
        showAlert('เข้าสู่ระบบไม่สำเร็จ', data.message || 'ข้อมูลไม่ถูกต้อง');
      }
    } catch {
      showAlert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Server ได้');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regUsername || !regPassword) return showAlert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
    setAuthLoading(true);
    try {
      const res = await fetch(PHP_REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });
      const data = await res.json();
      
      if (res.ok && (data.success || data.status === 'success')) {
        showAlert('สำเร็จ', 'สมัครสมาชิกเรียบร้อย กรุณาเข้าสู่ระบบ');
        setIsRegisterMode(false);
        setLoginUsername(regUsername);
        setLoginPassword('');
        setRegUsername('');
        setRegPassword('');
      } else {
        showAlert('สมัครสมาชิกไม่สำเร็จ', data.message || 'ชื่อผู้ใช้นี้อาจถูกใช้งานแล้ว');
      }
    } catch {
      showAlert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Server ได้');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      showAlert('ข้อผิดพลาด', 'ดึงข้อมูลสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      return showAlert('สินค้าหมด', 'ขออภัย สินค้าชิ้นนี้หมดชั่วคราว');
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if ((existingItem.quantity || 1) >= product.stock) {
          showAlert('แจ้งเตือน', 'จำนวนสินค้าในตะกร้าถึงขีดจำกัดสต็อกที่มีอยู่แล้ว');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    showAlert('สำเร็จ', `เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const handleAttachSlip = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setPaymentSlipUrl(imageUrl);
          showAlert('สำเร็จ', 'แนบสลิปการโอนเงินเรียบร้อย');
        }
      };
      input.click();
    } else {
      const url = window.prompt('กรุณากรอก URL รูปภาพสลิป:');
      if (url) {
        setPaymentSlipUrl(url);
        showAlert('สำเร็จ', 'แนบสลิปเรียบร้อย');
      }
    }
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return showAlert('แจ้งเตือน', 'กรุณากรอกโค้ดส่วนลด');

    if (code === 'SUMMER10') {
      setAppliedPromo({ code, type: 'percent', value: 10 });
      showAlert('สำเร็จ', 'ใช้โค้ดส่วนลด SUMMER10 ลด 10% สำเร็จ');
    } else if (code === 'SAVE100') {
      setAppliedPromo({ code, type: 'fixed', value: 100 });
      showAlert('สำเร็จ', 'ใช้โค้ดส่วนลด SAVE100 ลด 100 บาท สำเร็จ');
    } else {
      showAlert('ไม่พบโค้ดส่วนลด', 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return showAlert('ตะกร้าว่าง', 'กรุณาเลือกสินค้าใส่ตะกร้าก่อนสั่งซื้อ');
    if (!paymentSlipUrl) return showAlert('ยังไม่ได้แนบสลิป', 'กรุณาแนบสลิปการโอนเงินเพื่อยืนยันคำสั่งซื้อ');

    const confirmAction = async () => {
      try {
        const newOrder: Order = {
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          username: currentUser?.username || 'Guest',
          items: [...cart],
          totalAmount: totalCartAmount,
          slipUrl: paymentSlipUrl,
          status: 'รอตรวจสอบ',
          createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        };

        setOrders((prev) => [newOrder, ...prev]);

        for (const item of cart) {
          const newStock = Math.max(0, item.stock - (item.quantity || 1));
          await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.id,
              name: item.name,
              size: item.size || '-',
              stock: newStock,
              price: item.price || 1790,
              category: item.category,
              location: item.location || 'Warehouse A',
              status: item.status,
              imageUrl: item.imageUrl,
              role: 'admin',
            }),
          });
        }

        showAlert('สั่งซื้อสำเร็จ', 'คำสั่งซื้อและหลักฐานการชำระเงินของคุณถูกส่งเรียบร้อยแล้ว!');
        setCart([]);
        setPaymentSlipUrl('');
        setAppliedPromo(null);
        setPromoCodeInput('');
        setCartModalVisible(false);
        fetchProducts();
      } catch {
        showAlert('ข้อผิดพลาด', 'ไม่สามารถดำเนินการสั่งซื้อได้');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('ยืนยันการส่งคำสั่งซื้อพร้อมสลิปการโอนเงินใช่หรือไม่?')) confirmAction();
    } else {
      Alert.alert('ยืนยันคำสั่งซื้อ', 'ต้องการส่งคำสั่งซื้อพร้อมสลิปการโอนเงินใช่หรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ยืนยัน', onPress: confirmAction },
      ]);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'อนุมัติแล้ว' | 'ปฏิเสธ') => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showAlert('สำเร็จ', `อัปเดตสถานะออเดอร์ ${orderId} เป็น "${status}" เรียบร้อย`);
  };

  const handleDeleteProduct = (product: Product) => {
    const confirmAction = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.id, role: currentUser?.role }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showAlert('สำเร็จ', 'ลบสินค้าเรียบร้อย');
          setProducts((prev) => prev.filter((item) => item.id !== product.id));
        }
      } catch {
        showAlert('ข้อผิดพลาด', 'เชื่อมต่อ Server ไม่สำเร็จ');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`ลบสินค้า "${product.name}" ใช่หรือไม่?`)) confirmAction();
    } else {
      Alert.alert('ยืนยัน', `ลบสินค้า "${product.name}" ใช่หรือไม่?`, [
        { text: 'ยกเลิก' },
        { text: 'ลบ', style: 'destructive', onPress: confirmAction },
      ]);
    }
  };

  const handleSaveProduct = async (formData: any) => {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: currentUser?.role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('สำเร็จ', isEditMode ? 'อัปเดตเรียบร้อย' : 'เพิ่มสินค้าเรียบร้อย');
        setModalVisible(false);
        fetchProducts();
      } else {
        showAlert('ข้อผิดพลาด', data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      showAlert('ข้อผิดพลาด', 'เชื่อมต่อ Server ไม่สำเร็จ');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q));
    
    let matchStock = true;
    if (filterInStock && !filterOutOfStock) matchStock = p.stock > 0;
    else if (!filterInStock && filterOutOfStock) matchStock = p.stock <= 0;

    let matchCategory = true;
    if (selectedCategoryFilter !== 'ทั้งหมด') {
      matchCategory = p.category === selectedCategoryFilter;
    }

    return matchQuery && matchStock && matchCategory;
  });

  const subtotalAmount = cart.reduce((sum, item) => sum + (Number(item.price || 1790) * (item.quantity || 1)), 0);
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') discountAmount = (subtotalAmount * appliedPromo.value) / 100;
    else if (appliedPromo.type === 'fixed') discountAmount = Math.min(subtotalAmount, appliedPromo.value);
  }
  const totalCartAmount = Math.max(0, subtotalAmount - discountAmount);

  // ==========================================
  // 4. AUTHENTICATION VIEW (หน้าจอเข้าสู่ระบบ / สมัครสมาชิก)
  // ==========================================
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authHeaderTitle}>
            {isRegisterMode ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบร้านค้า'}
          </Text>
          <Text style={styles.authSubTitle}>
            {isRegisterMode ? 'กรอกข้อมูลเพื่อสมัครสมาชิก' : 'กรุณาเข้าสู่ระบบเพื่อเลือกซื้อสินค้า'}
          </Text>

          {!isRegisterMode ? (
            <>
              <Text style={styles.label}>ชื่อผู้ใช้</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อผู้ใช้..."
                placeholderTextColor="#a1a1aa"
                value={loginUsername}
                onChangeText={setLoginUsername}
              />

              <Text style={styles.label}>รหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกรหัสผ่าน..."
                placeholderTextColor="#a1a1aa"
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
              />

              <TouchableOpacity style={styles.authButton} onPress={handleLogin} disabled={authLoading}>
                {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.authButtonText}>เข้าสู่ระบบ</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchAuthBtn} 
                onPress={() => { setIsRegisterMode(true); setLoginUsername(''); setLoginPassword(''); }}>
                <Text style={styles.switchAuthText}>ยังไม่มีบัญชีใช่หรือไม่? <Text style={styles.linkText}>สมัครสมาชิก</Text></Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>กำหนดชื่อผู้ใช้</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อผู้ใช้ใหม่..."
                placeholderTextColor="#a1a1aa"
                value={regUsername}
                onChangeText={setRegUsername}
              />

              <Text style={styles.label}>กำหนดรหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกรหัสผ่านใหม่..."
                placeholderTextColor="#a1a1aa"
                secureTextEntry
                value={regPassword}
                onChangeText={setRegPassword}
              />

              <TouchableOpacity style={styles.authButton} onPress={handleRegister} disabled={authLoading}>
                {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.authButtonText}>ยืนยันการสมัคร</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchAuthBtn} 
                onPress={() => { setIsRegisterMode(false); setRegUsername(''); setRegPassword(''); }}>
                <Text style={styles.switchAuthText}>มีบัญชีอยู่แล้ว? <Text style={styles.linkText}>กลับไปเข้าสู่ระบบ</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 5. MAIN DASHBOARD / SHOP SCREEN (หน้าจอหลักหลังเข้าสู่ระบบ)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      {/* 5.1 แถบเมนูด้านบนสุด (Header Navbar) */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Inventory Store</Text>
        <View style={styles.userSection}>
          <Text style={styles.userText}>ผู้ใช้: {currentUser.username} ({currentUser.role.toUpperCase()})</Text>
          
          {currentUser.role === 'user' && (
            <TouchableOpacity
              style={styles.cartBtnHeader}
              onPress={() => setCartModalVisible(true)}>
              <Text style={styles.cartBtnText}>🛒 ตะกร้า ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</Text>
            </TouchableOpacity>
          )}

          {currentUser.role === 'admin' && (
            <>
              <TouchableOpacity
                style={styles.orderManageBtnHeader}
                onPress={() => setAdminOrdersModalVisible(true)}>
                <Text style={styles.orderManageBtnText}>📋 จัดการออเดอร์ ({orders.filter(o => o.status === 'รอตรวจสอบ').length})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtnHeader}
                onPress={() => {
                  setIsEditMode(false);
                  setEditingProduct(null);
                  setModalVisible(true);
                }}>
                <Text style={styles.addBtnText}>+ เพิ่มสินค้า</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.logoutBtnHeader}
            onPress={() => {
              setCurrentUser(null);
              setLoginUsername('');
              setLoginPassword('');
              setCart([]);
            }}>
            <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.mainScrollView}>
        <View style={styles.pageContainer}>
          {currentUser.role === 'admin' && (
            <AdminManagement
              products={products}
              orders={orders}
              modalVisible={adminOrdersModalVisible}
              onCloseModal={() => setAdminOrdersModalVisible(false)}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          <View style={styles.bannerSection}>
            <Text style={styles.bannerTitle}>โต๊ะคอมพิวเตอร์และสินค้าไอที ราคาดี คุณภาพพรีเมียม</Text>
            <Text style={styles.bannerSubtitle}>
              {currentUser.role === 'user' 
                ? 'เลือกสินค้าใส่ตะกร้าเพื่อสั่งซื้อหลายรายการพร้อมกันได้อย่างสะดวกสบาย' 
                : 'ตอบโจทย์ทุกไลฟ์สไตล์ เลือกได้อย่างดี เพื่อให้ได้สินค้าที่เหมาะสมกับการทำงานและเล่นเกมมากที่สุด'}
            </Text>
          </View>

          <View style={styles.contentLayout}>
            {/* 5.2 แถบตัวกรองสินค้าด้านข้าง (Sidebar Filter) */}
            <View style={styles.sidebar}>
              <View style={styles.filterCard}>
                <Text style={styles.filterGroupTitle}>ประเภทโต๊ะ</Text>
                
                <TouchableOpacity
                  style={[styles.catFilterBtn, selectedCategoryFilter === 'ทั้งหมด' && styles.catFilterBtnActive]}
                  onPress={() => setSelectedCategoryFilter('ทั้งหมด')}>
                  <Text style={[styles.catFilterText, selectedCategoryFilter === 'ทั้งหมด' && styles.catFilterTextActive]}>ทั้งหมด</Text>
                </TouchableOpacity>

                {CATEGORIES.map((cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.catFilterBtn, selectedCategoryFilter === cat && styles.catFilterBtnActive]}
                    onPress={() => setSelectedCategoryFilter(cat)}>
                    <Text style={[styles.catFilterText, selectedCategoryFilter === cat && styles.catFilterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.divider} />

                <Text style={styles.filterGroupTitle}>สถานะสต็อก</Text>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}
                  onPress={() => setFilterInStock(!filterInStock)}>
                  <View style={[styles.checkbox, filterInStock && styles.checkboxChecked]} />
                  <Text style={styles.checkboxLabel}>มีในสต็อก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}
                  onPress={() => setFilterOutOfStock(!filterOutOfStock)}>
                  <View style={[styles.checkbox, filterOutOfStock && styles.checkboxChecked]} />
                  <Text style={styles.checkboxLabel}>ไม่มีในสต็อก</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.filterGroupTitle}>ค้นหาสินค้า</Text>
                <TextInput
                  style={styles.sidebarSearchInput}
                  placeholder="พิมพ์ชื่อสินค้า..."
                  placeholderTextColor="#a1a1aa"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* 5.3 พื้นที่แสดงรายการสินค้า (Product Grid Area) */}
            <View style={styles.productArea}>
              {loading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#dc2626" />
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {filteredProducts.map((product) => (
                    <View key={product.id} style={styles.productGridCard}>
                      <TouchableOpacity 
                        activeOpacity={0.9} 
                        onPress={() => {
                          setSelectedProductDetail(product);
                          setDetailQuantity(1);
                          setIsDetailModalVisible(true);
                        }}
                      >
                        <View style={styles.heartIcon}>
                          <Text style={{ fontSize: 16 }}>🤍</Text>
                        </View>

                        <Image
                          source={{ uri: product.imageUrl || 'https://via.placeholder.com/200' }}
                          style={styles.productCardImage}
                          resizeMode="contain"
                        />

                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{product.category || 'โต๊ะอเนกประสงค์'}</Text>
                        </View>

                        <Text style={styles.productCardTitle} numberOfLines={2}>
                          {product.name}
                        </Text>

                        {/* แสดงขนาดและสถานที่สร้าง/จัดเก็บ */}
                        <Text style={styles.infoSubText}>📏 ขนาด: {product.size || '-'}</Text>
                        <Text style={styles.infoSubText}>📍 ที่สร้าง/แหล่งผลิต: {product.location || '-'}</Text>

                        <Text style={styles.priceText}>
                          ฿{Number(product.price || 1790).toLocaleString('th-TH')}.00
                        </Text>

                        <Text style={styles.stockText}>
                          คงเหลือในสต็อก: {product.stock} ชิ้น
                        </Text>

                        <Text style={styles.shippingText}>
                          {product.stock > 0 ? 'จัดส่ง 3 - 5 วันทำการ' : 'สินค้าหมดชั่วคราว'}
                        </Text>
                      </TouchableOpacity>

                      {currentUser.role === 'user' && (
                        <TouchableOpacity
                          style={[styles.cartAddBtnCard, product.stock <= 0 && styles.disabledBuyBtn]}
                          onPress={() => handleAddToCart(product)}>
                          <Text style={styles.cartAddBtnCardText}>
                            {product.stock > 0 ? '🛒 เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {currentUser.role === 'admin' && (
                        <View style={styles.cardAdminActions}>
                          <TouchableOpacity
                            style={styles.editBtnCard}
                            onPress={() => {
                              setIsEditMode(true);
                              setEditingProduct(product);
                              setModalVisible(true);
                            }}>
                            <Text style={styles.editBtnCardText}>แก้ไข</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtnCard}
                            onPress={() => handleDeleteProduct(product)}>
                            <Text style={styles.deleteBtnCardText}>ลบ</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ==========================================
          6. MODALS (หน้าต่างป๊อปอัปต่างๆ ในระบบ)
          ========================================== */}

      <ProductModal
        visible={modalVisible}
        isEditMode={isEditMode}
        editingProduct={editingProduct}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProduct}
      />

      {/* 6.2 Modal รายละเอียดสินค้าขนาดใหญ่ */}
      <Modal visible={isDetailModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 750 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProductDetail && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                  
                  {/* รูปภาพสินค้า */}
                  <View style={{ flex: 1, minWidth: 260, backgroundColor: '#0b0f19', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' }}>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => {
                        setZoomedImageUrl(selectedProductDetail.imageUrl || 'https://via.placeholder.com/200');
                        setIsImageZoomModalVisible(true);
                      }}
                      style={{ width: '100%', alignItems: 'center' }}
                    >
                      <Image source={{ uri: selectedProductDetail.imageUrl || 'https://via.placeholder.com/200' }} style={{ width: '100%', height: 220 }} resizeMode="contain" />
                      <Text style={{ color: '#60a5fa', fontSize: 11, marginTop: 8, fontWeight: 'bold' }}>🔍 คลิกเพื่อขยายรูปภาพ</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1.2, minWidth: 260 }}>
                    <View style={{ backgroundColor: '#dc2626', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>BY ORDER / SPEC</Text>
                    </View>

                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#f3f4f6', marginBottom: 8, lineHeight: 22 }}>
                      {selectedProductDetail.name}
                    </Text>

                    {/* ข้อมูลขนาดและที่สร้างในหน้า Modal รายละเอียด */}
                    <Text style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>📏 ขนาด: {selectedProductDetail.size || '-'}</Text>
                    <Text style={{ fontSize: 13, color: '#9ca3af', marginBottom: 10 }}>📍 ที่สร้าง/แหล่งผลิต: {selectedProductDetail.location || '-'}</Text>

                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#ef4444', marginBottom: 6 }}>
                      ฿{Number(selectedProductDetail.price || 1790).toLocaleString('th-TH')}.00
                    </Text>
                    <Text style={{ fontSize: 12, color: '#4ade80', marginBottom: 14 }}>📦 จัดส่ง 3 - 5 วันทำการ (สต็อก: {selectedProductDetail.stock} ชิ้น)</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <Text style={styles.label}>จำนวน</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#374151', borderRadius: 8, backgroundColor: '#0b0f19' }}>
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                          onPress={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ paddingHorizontal: 12, color: '#fff', fontWeight: 'bold' }}>{String(detailQuantity).padStart(2, '0')}</Text>
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                          onPress={() => setDetailQuantity(Math.min(selectedProductDetail.stock, detailQuantity + 1))}>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={[styles.saveButton, { backgroundColor: '#2563eb', marginTop: 0 }]}
                      onPress={() => {
                        for (let i = 0; i < detailQuantity; i++) {
                          handleAddToCart(selectedProductDetail);
                        }
                        setIsDetailModalVisible(false);
                      }}>
                      <Text style={styles.saveButtonText}>🛒 เพิ่มลงตะกร้า ({detailQuantity} ชิ้น)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsDetailModalVisible(false)}>
              <Text style={styles.cancelText}>✕ ปิดหน้าต่าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 6.3 Modal สำหรับแสดงรูปภาพขยายเต็มจอ */}
      <Modal visible={isImageZoomModalVisible} animationType="fade" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={{ width: '100%', maxWidth: 700, alignItems: 'center', padding: 10 }}>
            <Image 
              source={{ uri: zoomedImageUrl }} 
              style={{ width: '100%', height: 450, borderRadius: 12 }} 
              resizeMode="contain" 
            />
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: '#1f2937', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 20 }]} 
              onPress={() => setIsImageZoomModalVisible(false)}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>✕ ปิดรูปภาพขยาย</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 6.4 Modal ตะกร้าสินค้า, โค้ดส่วนลด และสแกน QR จ่ายเงิน */}
      <Modal visible={cartModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 450 }]}>
            <Text style={styles.modalTitle}>🛒 ตะกร้าสินค้าและการชำระเงิน</Text>
            
            {cart.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748b', marginVertical: 20 }}>ไม่มีสินค้าในตะกร้า</Text>
            ) : (
              <ScrollView style={{ maxHeight: 150, marginBottom: 8 }}>
                {cart.map((item, index) => (
                  <View key={index} style={styles.cartItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>฿{Number(item.price || 1790).toLocaleString('th-TH')}.00 x {item.quantity}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCart(cart.filter((_, i) => i !== index))}
                      style={styles.removeCartItemBtn}>
                      <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: 'bold' }}>ลบ</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {cart.length > 0 && (
              <>
                <View style={styles.promoBox}>
                  <Text style={styles.label}>โค้ดส่วนลด (เช่น SUMMER10 หรือ SAVE100)</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="กรอกโค้ดส่วนลด..."
                      placeholderTextColor="#a1a1aa"
                      value={promoCodeInput}
                      onChangeText={setPromoCodeInput}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity style={styles.applyPromoBtn} onPress={handleApplyPromo}>
                      <Text style={styles.applyPromoBtnText}>ใช้โค้ด</Text>
                    </TouchableOpacity>
                  </View>
                  {appliedPromo && (
                    <Text style={styles.promoSuccessText}>
                      ✅ ใช้โค้ด {appliedPromo.code} สำเร็จ ({appliedPromo.type === 'percent' ? `ลด ${appliedPromo.value}%` : `ลด ${appliedPromo.value} บาท`})
                    </Text>
                  )}
                </View>

                <View style={styles.cartTotalContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>ราคารวมสินค้า:</Text>
                    <Text style={styles.priceRowVal}>฿{subtotalAmount.toLocaleString('th-TH')}.00</Text>
                  </View>
                  {appliedPromo && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceRowLabel, { color: '#16a34a' }]}>ส่วนลด ({appliedPromo.code}):</Text>
                      <Text style={[styles.priceRowVal, { color: '#16a34a' }]}>-฿{discountAmount.toLocaleString('th-TH')}.00</Text>
                    </View>
                  )}
                  <View style={[styles.priceRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 4, paddingTop: 4 }]}>
                    <Text style={styles.cartTotalText}>ยอดรวมสุทธิ:</Text>
                    <Text style={[styles.cartTotalText, { color: '#dc2626' }]}>฿{totalCartAmount.toLocaleString('th-TH')}.00</Text>
                  </View>
                </View>

                <View style={styles.qrSection}>
                  <Text style={styles.qrTitle}>สแกนจ่ายผ่าน QR Code พร้อมเพย์</Text>
                  <Text style={styles.qrSubText}>เบอร์: 098-543-8519</Text>
                  
                  <View style={styles.qrImageWrapper}>
                    <Image
                      source={{
                        uri: `https://promptpay.io/0985438519/${totalCartAmount}.png`,
                      }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.qrHint}>* ยอดเงินจะเปลี่ยนตามส่วนลดอัตโนมัติ</Text>
                </View>

                <View style={styles.slipSection}>
                  <Text style={styles.label}>หลักฐานการชำระเงิน (สลิป)</Text>
                  <TouchableOpacity style={styles.attachSlipBtn} onPress={handleAttachSlip}>
                    <Text style={styles.attachSlipBtnText}>
                      {paymentSlipUrl ? '✅ แนบสลิปเรียบร้อย (คลิกเปลี่ยน)' : '📎 แนบสลิปการโอนเงิน'}
                    </Text>
                  </TouchableOpacity>

                  {paymentSlipUrl ? (
                    <View style={styles.slipPreviewContainer}>
                      <Image source={{ uri: paymentSlipUrl }} style={styles.slipPreviewImage} resizeMode="contain" />
                      <Text style={styles.slipPreviewText} numberOfLines={1}>สลิป: {paymentSlipUrl}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}

            <TouchableOpacity 
              style={[styles.saveButton, (cart.length === 0 || !paymentSlipUrl) && { backgroundColor: '#94a3b8' }]} 
              onPress={handleCheckout}
              disabled={cart.length === 0 || !paymentSlipUrl}>
              <Text style={styles.saveButtonText}>ยืนยันการชำระเงิน / สั่งซื้อ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setCartModalVisible(false)}>
              <Text style={styles.cancelText}>ปิดหน้าต่าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 7. SUB-COMPONENT: ProductModal (เพิ่ม/แก้ไขสินค้า รองรับการเลือกรูปจากในเครื่อง)
// ==========================================
interface ModalProps {
  visible: boolean;
  isEditMode: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function ProductModal({ visible, isEditMode, editingProduct, onClose, onSave }: ModalProps) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('โต๊ะอเนกประสงค์');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && editingProduct) {
      setName(editingProduct.name || '');
      setSize(editingProduct.size || '-');
      setStock(String(editingProduct.stock || 0));
      setPrice(String(editingProduct.price || 1790));
      setCategory(editingProduct.category || 'โต๊ะอเนกประสงค์');
      setLocation(editingProduct.location || 'Warehouse A');
      setImage(editingProduct.imageUrl || '');
    } else {
      setName(''); 
      setSize('-'); 
      setStock('10'); 
      setPrice('1790'); 
      setCategory('โต๊ะอเนกประสงค์'); 
      setLocation('Warehouse A'); 
      setImage('');
    }
  }, [isEditMode, editingProduct, visible]);

  const handleAddStock = (amount: number) => {
    const currentStock = parseInt(stock) || 0;
    setStock(String(Math.max(0, currentStock + amount)));
  };

  // ฟังก์ชันเลือกรูปจากในเครื่อง
  const handlePickImageFromFile = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const localUrl = URL.createObjectURL(file);
          setImage(localUrl);
          showAlert('สำเร็จ', 'เลือกรูปภาพจากในเครื่องเรียบร้อย');
        }
      };
      input.click();
    } else {
      const url = window.prompt('กรุณากรอก URL รูปภาพ หรือลิงก์ไฟล์รูปในเครื่อง:');
      if (url) {
        setImage(url);
        showAlert('สำเร็จ', 'ตั้งค่ารูปภาพเรียบร้อย');
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return showAlert('ข้อผิดพลาด', 'กรุณากรอกชื่อสินค้า');
    setSubmitting(true);
    await onSave({
      id: editingProduct?.id,
      name: name.trim(),
      size: size.trim() || '-',
      stock: Number(stock) || 0,
      price: Number(price) || 0,
      category: category,
      location: location.trim() || 'Warehouse A',
      status: 'Active',
      imageUrl: image.trim() || 'https://via.placeholder.com/200',
    });
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{isEditMode ? 'แก้ไขสินค้า & เติมสต็อก' : 'เพิ่มสินค้าใหม่'}</Text>

            <Text style={styles.label}>ชื่อสินค้า *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="กรอกชื่อสินค้า..." placeholderTextColor="#a1a1aa" />

            <Text style={styles.label}>ขนาด (Size)</Text>
            <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="เช่น 120x60x75 cm" placeholderTextColor="#a1a1aa" />

            <Text style={styles.label}>ราคาสินค้า (บาท)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="1790" placeholderTextColor="#a1a1aa" />

            <Text style={styles.label}>จำนวนสต็อก</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="10" placeholderTextColor="#a1a1aa" />

            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              <TouchableOpacity style={styles.restockQuickBtn} onPress={() => handleAddStock(10)}>
                <Text style={styles.restockQuickText}>+10 ชิ้น</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restockQuickBtn} onPress={() => handleAddStock(50)}>
                <Text style={styles.restockQuickText}>+50 ชิ้น</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restockQuickBtn} onPress={() => handleAddStock(100)}>
                <Text style={styles.restockQuickText}>+100 ชิ้น</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>ประเภทโต๊ะ</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.modalCatChip, category === cat && styles.modalCatChipActive]}
                  onPress={() => setCategory(cat)}>
                  <Text style={[styles.modalCatChipText, category === cat && styles.modalCatChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>ที่สร้าง / แหล่งผลิต (Location)</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="เช่น Warehouse A" placeholderTextColor="#a1a1aa" />

            {/* ส่วนจัดการรูปภาพสินค้า */}
            <Text style={styles.label}>รูปภาพสินค้า</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity style={[styles.attachSlipBtn, { flex: 1, backgroundColor: '#1d4ed8' }]} onPress={handlePickImageFromFile}>
                <Text style={styles.attachSlipBtnText}>📁 เลือกรูปจากในเครื่อง</Text>
              </TouchableOpacity>
            </View>

            <TextInput 
              style={[styles.input, { fontSize: 11 }]} 
              value={image} 
              onChangeText={setImage} 
              placeholder="หรือวาง URL รูปภาพที่นี่..." 
              placeholderTextColor="#a1a1aa" 
            />

            {image ? (
              <View style={{ alignItems: 'center', marginBottom: 12, backgroundColor: '#0b0f19', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1f2937' }}>
                <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 6 }} resizeMode="contain" />
                <Text style={{ color: '#4ade80', fontSize: 10, marginTop: 4 }}>โหลดรูปภาพสำเร็จ</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>ยกเลิก</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 8. STYLESHEET (ชุดตกแต่งดีไซน์หน้าจอทั้งหมด)
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  authContainer: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center', padding: 20 },
  authCard: { backgroundColor: '#111827', borderRadius: 20, padding: 30, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#1f2937', shadowColor: '#dc2626', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  authHeaderTitle: { fontSize: 24, fontWeight: '900', color: '#f3f4f6', marginBottom: 6, textAlign: 'center', letterSpacing: 0.5 },
  authSubTitle: { fontSize: 13, color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  authButton: { backgroundColor: '#dc2626', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12, shadowColor: '#dc2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  authButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  switchAuthBtn: { marginTop: 16, alignItems: 'center' },
  switchAuthText: { fontSize: 13, color: '#9ca3af' },
  linkText: { color: '#ef4444', fontWeight: 'bold' },

  topHeader: {
    backgroundColor: '#0b0f19',
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 75,
    marginTop: 65,
    zIndex: 999,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    elevation: 8,
  },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userText: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
  cartBtnHeader: { backgroundColor: '#1d4ed8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
  cartBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  orderManageBtnHeader: { backgroundColor: '#b45309', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  orderManageBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  addBtnHeader: { backgroundColor: '#15803d', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  logoutBtnHeader: { backgroundColor: '#b91c1c', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  mainScrollView: { flex: 1 },
  pageContainer: { maxWidth: 1240, width: '100%', alignSelf: 'center', padding: 28 },
  
  bannerSection: { marginBottom: 28, backgroundColor: '#111827', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937' },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: '#f9fafb', marginBottom: 8, letterSpacing: 0.5 },
  bannerSubtitle: { fontSize: 14, color: '#9ca3af', lineHeight: 22 },

  contentLayout: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  sidebar: { width: 270 },
  filterCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  filterGroupTitle: { fontSize: 14, fontWeight: 'bold', color: '#f3f4f6', marginBottom: 12, letterSpacing: 0.3 },
  
  catFilterBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 6, backgroundColor: '#1f2937' },
  catFilterBtnActive: { backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#dc2626' },
  catFilterText: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  catFilterTextActive: { color: '#fca5a5', fontWeight: 'bold' },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: '#4b5563', marginRight: 10, backgroundColor: '#1f2937' },
  checkboxChecked: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  checkboxLabel: { fontSize: 13, color: '#d1d5db' },
  divider: { height: 1, backgroundColor: '#1f2937', marginVertical: 14 },
  sidebarSearchInput: {
    backgroundColor: '#0b0f19',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#fff',
  },

  productArea: { flex: 1, minWidth: 300 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  
  productGridCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    minWidth: 230,
    borderWidth: 1,
    borderColor: '#1f2937',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  heartIcon: { position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: 'rgba(17, 24, 39, 0.7)', padding: 6, borderRadius: 20 },
  productCardImage: { width: '100%', height: 150, marginBottom: 12 },
  
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#082f49', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#0369a1' },
  categoryBadgeText: { fontSize: 10, color: '#38bdf8', fontWeight: 'bold' },

  productCardTitle: { fontSize: 14, fontWeight: '700', color: '#f3f4f6', lineHeight: 20, height: 40, marginBottom: 6 },
  infoSubText: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  priceText: { fontSize: 18, fontWeight: '900', color: '#ef4444', marginTop: 4, marginBottom: 4 },
  stockText: { fontSize: 12, color: '#9ca3af', marginBottom: 2, fontWeight: '500' },
  shippingText: { fontSize: 12, color: '#4ade80', fontWeight: '600', marginBottom: 12 },

  cartAddBtnCard: { backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  disabledBuyBtn: { backgroundColor: '#374151' },
  cartAddBtnCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },

  cardAdminActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1f2937' },
  editBtnCard: { flex: 1, backgroundColor: '#082f49', paddingVertical: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#0369a1' },
  editBtnCardText: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
  deleteBtnCard: { flex: 1, backgroundColor: '#450a0a', paddingVertical: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#991b1b' },
  deleteBtnCardText: { color: '#fca5a5', fontSize: 12, fontWeight: 'bold' },

  centerContainer: { paddingVertical: 60, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(3, 7, 18, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#111827', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: '#1f2937' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#f3f4f6', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 6 },
  input: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 13, color: '#fff' },
  
  modalCatChip: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#374151', borderRadius: 8, alignItems: 'center', backgroundColor: '#1f2937' },
  modalCatChipActive: { backgroundColor: '#7f1d1d', borderColor: '#dc2626' },
  modalCatChipText: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  modalCatChipTextActive: { color: '#fca5a5', fontWeight: 'bold' },

  saveButton: { backgroundColor: '#dc2626', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: '#ffffff', fontWeight: 'bold' },
  cancelButton: { padding: 10, alignItems: 'center', marginTop: 6 },
  cancelText: { color: '#9ca3af' },

  cartItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  cartItemName: { fontSize: 13, fontWeight: 'bold', color: '#f3f4f6' },
  cartItemPrice: { fontSize: 12, color: '#ef4444' },
  removeCartItemBtn: { backgroundColor: '#450a0a', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#991b1b' },
  
  promoBox: { backgroundColor: '#0b0f19', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937', marginVertical: 8 },
  applyPromoBtn: { backgroundColor: '#374151', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 8 },
  applyPromoBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  promoSuccessText: { fontSize: 11, color: '#4ade80', fontWeight: 'bold', marginTop: 6 },

  cartTotalContainer: { marginVertical: 6, paddingVertical: 6 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  priceRowLabel: { fontSize: 12, color: '#9ca3af' },
  priceRowVal: { fontSize: 12, color: '#f3f4f6', fontWeight: 'bold' },
  cartTotalText: { fontSize: 14, fontWeight: 'bold', color: '#f3f4f6' },

  qrSection: { alignItems: 'center', marginVertical: 8, backgroundColor: '#0b0f19', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937' },
  qrTitle: { fontSize: 11, fontWeight: 'bold', color: '#f3f4f6' },
  qrSubText: { fontSize: 10, color: '#9ca3af', marginBottom: 6 },
  qrImageWrapper: { backgroundColor: '#ffffff', padding: 6, borderRadius: 8 },
  qrImage: { width: 110, height: 110 },
  qrHint: { fontSize: 8, color: '#6b7280', marginTop: 4 },

  slipSection: { marginTop: 6, marginBottom: 8 },
  attachSlipBtn: { backgroundColor: '#1d4ed8', padding: 10, borderRadius: 8, alignItems: 'center' },
  attachSlipBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  slipPreviewContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#0b0f19', padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#1f2937' },
  slipPreviewImage: { width: 28, height: 28, marginRight: 8, borderRadius: 4 },
  slipPreviewText: { fontSize: 10, color: '#9ca3af', flex: 1 },

  restockQuickBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  restockQuickText: {
    fontSize: 11,
    color: '#e5e7eb',
    fontWeight: 'bold',
  },
});