import requests
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# 1. ดึงข้อมูลจาก API ของ Backend
res = requests.get("http://119.59.102.161:3042/api/products")
df = pd.DataFrame(res.json())

# ** แก้ไขจุดที่เกิด Error: แปลงคอลัมน์ price ให้เป็นตัวเลข (Numeric) ก่อนนำไปคำนวณ **
df['price'] = pd.to_numeric(df['price'], errors='coerce')

# เลือกฟีเจอร์สำหรับทำ Clustering
features = df[['price']]

# 2. ทำ Standard Scaling และรัน K-Means Clustering (กำหนด k = 3)
scaler = StandardScaler()
scaled = scaler.fit_transform(features)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(scaled)

# หากในฐานข้อมูลยังไม่มีคอลัมน์ units_sold ให้สร้างข้อมูลจำลองอิงตามช่วงราคา
if 'units_sold' not in df.columns:
    df['units_sold'] = df['price'].apply(lambda x: 120 if x < 100 else (60 if x < 300 else 20))

# 3. ตั้งค่าสีและป้ายกำกับให้เหมือนสไลด์หน้า 10
colors = {0: '#1f77b4', 1: '#ff7f0e', 2: '#2ca02c'} # สีน้ำเงิน, ส้ม, เขียว
labels = {
    0: 'Cluster 0 (budget)', 
    1: 'Cluster 1 (mid-range)', 
    2: 'Cluster 2 (premium)'
}

# 4. วาดกราฟ Scatter Plot
plt.figure(figsize=(10, 6))

for cluster_val in sorted(df['cluster'].unique()):
    cluster_data = df[df['cluster'] == cluster_val]
    plt.scatter(
        cluster_data['price'], 
        cluster_data['units_sold'],
        c=colors.get(cluster_val, '#333333'), 
        label=labels.get(cluster_val, f'Cluster {cluster_val}'),
        s=50 # ขนาดจุด
    )

# 5. ตกแต่งกราฟ
plt.title('Simulated K-Means Clustering Results\nUnits sold per month by Product price (THB)', loc='left', pad=20)
plt.xlabel('Product price (THB)')
plt.ylabel('Units sold per month')

# เลื่อน Legend ไปไว้ด้านล่าง
plt.legend(loc='upper left', bbox_to_anchor=(0, -0.15), ncol=3, frameon=False)
plt.grid(True, alpha=0.3)
plt.tight_layout()

# 6. แสดงผลกราฟ
plt.show()