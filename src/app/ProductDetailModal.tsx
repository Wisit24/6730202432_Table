import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from './mockData'; // 👈 เปลี่ยนจาก '../data/mockData' เป็น './mockData'

interface Props {
  visible: boolean;
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onIncreaseQty: () => void;
  onDecreaseQty: () => void;
  onAddToCart: () => void;
  onImagePress: (imageUrl: string) => void;
}

export default function ProductDetailModal({
  visible,
  product,
  quantity,
  onClose,
  onIncreaseQty,
  onDecreaseQty,
  onAddToCart,
  onImagePress,
}: Props) {
  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailContentLayout}>
              <View style={styles.detailLeftBox}>
                <TouchableOpacity onPress={() => onImagePress(product.imageUrl || '')}>
                  <Image source={{ uri: product.imageUrl }} style={styles.detailMainImage} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={styles.zoomHintText}>🔍 คลิกที่รูปเพื่อขยายใหญ่</Text>
              </View>

              <View style={styles.detailRightBox}>
                <View style={styles.byOrderBadge}>
                  <Text style={styles.byOrderBadgeText}>BY ORDER</Text>
                </View>
                
                <Text style={styles.detailTitle}>{product.name}</Text>

                <View style={styles.metaInfoRow}>
                  <Text style={styles.metaText}>แบรนด์: <Text style={{ color: '#38bdf8' }}>{product.brand || 'NEOLUTION'}</Text></Text>
                  <Text style={styles.metaText}>รหัสสินค้า: <Text style={{ color: '#9ca3af' }}>{product.sku || 'SKU-001'}</Text></Text>
                </View>

                <Text style={styles.detailPriceText}>฿{product.price.toLocaleString('th-TH')}.00</Text>
                <Text style={styles.detailShippingText}>📦 จัดส่ง 3 - 5 วันทำการ</Text>

                <View style={styles.quantityRow}>
                  <Text style={styles.label}>จำนวน</Text>
                  <View style={styles.quantityControlBox}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={onDecreaseQty}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValueText}>{String(quantity).padStart(2, '0')}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={onIncreaseQty}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <div style={{ display: 'flex', gap: 12 }}>
                  <TouchableOpacity style={styles.addToCartDetailBtn} onPress={onAddToCart}>
                    <Text style={styles.addToCartDetailText}>🛒 เพิ่มในตะกร้า</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyNowDetailBtn} onPress={onAddToCart}>
                    <Text style={styles.buyNowDetailText}>ซื้อเลย</Text>
                  </TouchableOpacity>
                </div>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeDetailModalBtn} onPress={onClose}>
            <Text style={styles.closeDetailModalText}>✕ ปิดหน้าต่าง</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(3, 7, 18, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  detailModalContainer: { backgroundColor: '#111827', borderRadius: 16, padding: 24, width: '100%', maxWidth: 900, borderWidth: 1, borderColor: '#1f2937', maxHeight: '90%' },
  detailContentLayout: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  detailLeftBox: { flex: 1, minWidth: 300, alignItems: 'center', backgroundColor: '#0b0f19', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
  detailMainImage: { width: '100%', height: 280 },
  zoomHintText: { fontSize: 11, color: '#6b7280', marginTop: 8 },
  detailRightBox: { flex: 1.2, minWidth: 300 },
  byOrderBadge: { backgroundColor: '#dc2626', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  byOrderBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  detailTitle: { fontSize: 16, fontWeight: 'bold', color: '#f9fafb', lineHeight: 22, marginBottom: 10 },
  metaInfoRow: { flexDirection: 'row', gap: 16, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  metaText: { fontSize: 12, color: '#9ca3af' },
  detailPriceText: { fontSize: 24, fontWeight: '900', color: '#ef4444', marginBottom: 6 },
  detailShippingText: { fontSize: 12, color: '#4ade80', marginBottom: 16 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  label: { fontSize: 13, color: '#9ca3af', fontWeight: 'bold' },
  quantityControlBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#374151', borderRadius: 8, backgroundColor: '#0b0f19' },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  qtyBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  qtyValueText: { paddingHorizontal: 12, color: '#fff', fontWeight: 'bold' },
  addToCartDetailBtn: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db' },
  addToCartDetailText: { color: '#111827', fontWeight: 'bold', fontSize: 13 },
  buyNowDetailBtn: { flex: 1, backgroundColor: '#dc2626', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buyNowDetailText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  closeDetailModalBtn: { marginTop: 16, backgroundColor: '#374151', padding: 10, borderRadius: 8, alignItems: 'center' },
  closeDetailModalText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});