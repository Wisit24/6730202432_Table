import matplotlib.pyplot as plt
import pandas as pd

# 1. สร้างข้อมูลจำลองตามสไลด์หน้า 10
data = {
    'price': [25, 40, 55, 70, 150, 190, 210, 250, 290, 550, 600, 650, 700, 850],
    'units_sold': [120, 95, 140, 110, 90, 60, 55, 50, 65, 20, 18, 15, 22, 10],
    'cluster': [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2] 
}
df = pd.DataFrame(data)

# 2. ตั้งค่าสีและป้ายกำกับให้เหมือนสไลด์
colors = {0: '#1f77b4', 1: '#ff7f0e', 2: '#2ca02c'} # สีน้ำเงิน, ส้ม, เขียว
labels = {
    0: 'Cluster 0 (budget)', 
    1: 'Cluster 1 (mid-range)', 
    2: 'Cluster 2 (premium)'
}

# 3. วาดกราฟ Scatter Plot
plt.figure(figsize=(10, 6))

for cluster_val in sorted(df['cluster'].unique()):
    cluster_data = df[df['cluster'] == cluster_val]
    plt.scatter(
        cluster_data['price'], 
        cluster_data['units_sold'],
        c=colors[cluster_val], 
        label=labels[cluster_val],
        s=30 # ขนาดจุด
    )

# 4. ตกแต่งกราฟ
plt.title('Simulated K-Means Clustering Results\nUnits sold per month by Product price (THB)', loc='left', pad=20)
plt.xlabel('Product price (THB)')
plt.ylabel('Units sold per month')

# เลื่อน Legend ไปไว้ด้านล่างซ้าย
plt.legend(loc='upper left', bbox_to_anchor=(0, -0.15), ncol=3, frameon=False)
plt.grid(True, alpha=0.3)
plt.tight_layout()

# 5. แสดงผลกราฟ
plt.show()