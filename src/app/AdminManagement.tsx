import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order, Product } from '../types';

interface AdminManagementProps {
  products: Product[];
  orders: Order[];
  modalVisible: boolean;
  onCloseModal: () => void;
  onUpdateStatus: (orderId: string, status: 'อนุมัติแล้ว' | 'ปฏิเสธ') => void;
  onOpenOrderModal: () => void;
}

export default function AdminManagement({
  products,
  orders,
  modalVisible,
  onCloseModal,
  onUpdateStatus,
  onOpenOrderModal,
}: AdminManagementProps) {
  // State สำหรับเก็บ URL รูปสลิปที่ต้องการกดขยาย
  const [zoomedSlipUrl, setZoomedSlipUrl] = useState<string | null>(null);

  // ยอดขายสะสมคงค้างตลอด (ไม่รีเซ็ต)
  const [persistentTotalSales, setPersistentTotalSales] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('persistent_total_sales');
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  useEffect(() => {
    const totalApproved = orders
      .filter((o) => o.status === 'อนุมัติแล้ว')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const newTotal = persistentTotalSales + totalApproved;
    
    if (totalApproved > 0) {
      setPersistentTotalSales(newTotal);
      if (typeof window !== 'undefined') {
        localStorage.setItem('persistent_total_sales', newTotal.toString());
      }
    }
  }, [orders]);

  // คำนวณสถิติต่างๆ
  const pendingOrdersCount = orders.filter((o) => o.status === 'รอตรวจสอบ').length;
  const totalProductsCount = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  return (
    <View style={styles.container}>
      {/* แถวแสดงการ์ดสถิติภาพรวมทั้งหมด */}
      <View style={styles.statsGrid}>
        {/* การ์ดยอดขายอนุมัติแล้ว */}
        <View style={[styles.card, { flex: 2, minWidth: 240 }]}>
          <Text style={styles.cardTitle}>ยอดขายอนุมัติแล้ว</Text>
          <Text style={[styles.cardAmount, { color: '#16a34a' }]}>฿{persistentTotalSales.toLocaleString('th-TH')}.00</Text>
        </View>

        {/* การ์ดออเดอร์รอตรวจสอบ */}
        <TouchableOpacity style={[styles.card, { flex: 1, minWidth: 180 }]} onPress={onOpenOrderModal}>
          <Text style={styles.cardTitle}>ออเดอร์รอตรวจสอบ</Text>
          <Text style={[styles.cardAmount, { color: '#2563eb' }]}>{pendingOrdersCount} รายการ</Text>
        </TouchableOpacity>

        {/* การ์ดสินค้าทั้งหมดในระบบ */}
        <View style={[styles.card, { flex: 1, minWidth: 180 }]}>
          <Text style={styles.cardTitle}>สินค้าทั้งหมดในระบบ</Text>
          <Text style={[styles.cardAmount, { color: '#0f172a' }]}>{totalProductsCount} ราย</Text>
        </View>

        {/* การ์ดสต็อกคงเหลือรวม */}
        <View style={[styles.card, { flex: 1, minWidth: 180 }]}>
          <Text style={styles.cardTitle}>สต็อกคงเหลือรวม</Text>
          <Text style={[styles.cardAmount, { color: '#d97706' }]}>{totalStockCount} ชิ้น</Text>
        </View>
      </View>

      {/* Modal จัดการออเดอร์ของ Admin */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📋 จัดการรายการสั่งซื้อและสลิป</Text>

            {orders.length === 0 ? (
              <Text style={styles.emptyText}>ยังไม่มีรายการสั่งซื้อเข้ามา</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {orders.map((ord) => (
                  <View key={ord.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderIdText}>ออเดอร์: {ord.id}</Text>
                      <Text style={[styles.statusBadge, ord.status === 'อนุมัติแล้ว' ? styles.statusApproved : ord.status === 'ปฏิเสธ' ? styles.statusRejected : styles.statusPending]}>
                        {ord.status}
                      </Text>
                    </View>

                    <Text style={styles.orderUser}>ลูกค้า: {ord.username} ({ord.createdAt})</Text>
                    
                    <View style={styles.orderItemsBox}>
                      {ord.items.map((item, idx) => (
                        <Text key={idx} style={styles.orderItemText}>
                          - {item.name} (x{item.quantity || 1}) ฿{(Number(item.price || 1790) * (item.quantity || 1)).toLocaleString()}
                        </Text>
                      ))}
                    </View>

                    <Text style={styles.orderTotal}>ยอดชำระสุทธิ: ฿{ord.totalAmount.toLocaleString('th-TH')}.00</Text>

                    {ord.slipUrl ? (
                      <View style={styles.slipContainer}>
                        <Text style={styles.labelSlip}>สลิปโอนเงิน (คลิกเพื่อขยาย):</Text>
                        
                        {/* ห่อหุ้มด้วย TouchableOpacity เพื่อให้กดคลิกเพื่อซูมรูปได้ */}
                        <TouchableOpacity 
                          activeOpacity={0.8}
                          onPress={() => setZoomedSlipUrl(ord.slipUrl)}
                        >
                          <Image source={{ uri: ord.slipUrl }} style={styles.slipImage} resizeMode="contain" />
                          <Text style={{ color: '#2563eb', fontSize: 10, marginTop: 4, textAlign: 'center', fontWeight: 'bold' }}>🔍 คลิกเพื่อขยายรูปสลิป</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {ord.status === 'รอตรวจสอบ' && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => onUpdateStatus(ord.id, 'อนุมัติแล้ว')}>
                          <Text style={styles.btnText}>อนุมัติยอดขาย</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => onUpdateStatus(ord.id, 'ปฏิเสธ')}>
                          <Text style={styles.btnText}>ปฏิเสธ</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onCloseModal}>
              <Text style={styles.closeBtnText}>ปิดหน้าต่าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal สำหรับแสดงภาพสลิปขนาดใหญ่เมื่อถูกคลิก */}
      <Modal visible={!!zoomedSlipUrl} animationType="fade" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={{ width: '100%', maxWidth: 700, alignItems: 'center', padding: 10 }}>
            {zoomedSlipUrl && (
              <Image 
                source={{ uri: zoomedSlipUrl }} 
                style={{ width: '100%', height: 450, borderRadius: 12 }} 
                resizeMode="contain" 
              />
            )}
            <TouchableOpacity 
              style={{ backgroundColor: '#1f2937', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 20, borderWidth: 1, borderColor: '#374151' }} 
              onPress={() => setZoomedSlipUrl(null)}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>✕ ปิดรูปภาพขยาย</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 6 },
  cardAmount: { fontSize: 22, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 500 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 14, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#64748b', marginVertical: 20 },
  orderCard: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderIdText: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  statusBadge: { fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusPending: { backgroundColor: '#fef3c7', color: '#d97706' },
  statusApproved: { backgroundColor: '#dcfce7', color: '#16a34a' },
  statusRejected: { backgroundColor: '#fee2e2', color: '#dc2626' },
  orderUser: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  orderItemsBox: { backgroundColor: '#ffffff', padding: 8, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#f1f5f9' },
  orderItemText: { fontSize: 12, color: '#334155' },
  orderTotal: { fontSize: 13, fontWeight: 'bold', color: '#dc2626', marginBottom: 8 },
  slipContainer: { marginVertical: 6 },
  labelSlip: { fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 2 },
  slipImage: { width: '100%', height: 120, borderRadius: 6, backgroundColor: '#000' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { flex: 1, backgroundColor: '#16a34a', padding: 8, borderRadius: 6, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: '#dc2626', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#0f172a', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 14 },
  closeBtnText: { color: '#ffffff', fontWeight: 'bold' },
});