const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3042;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend/React Native ดึงข้อมูลได้
app.use(express.json());

// -------------------------------------------------------------
// 0. GET /api : เช็กสถานะ API
// -------------------------------------------------------------
app.get('/api', (req, res) => {
  res.send('API is running');
});

// -------------------------------------------------------------
// 1. GET /api/products : ดึงข้อมูลสินค้าทั้งหมด (เพิ่มที่ขาดไป)
// -------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// -------------------------------------------------------------
// 2. GET /api/products/:id : ดึงข้อมูลสินค้าตาม ID
// -------------------------------------------------------------
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// -------------------------------------------------------------
// 3. POST /api/products : เพิ่มสินค้าใหม่
// -------------------------------------------------------------
app.post('/api/products', async (req, res) => {
  try {
    const { name, size, stock, category, location, status, imageUrl } = req.body;

    const sql = `
      INSERT INTO products (name, size, stock, category, location, status, imageUrl) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name,
      size || '-',
      stock || 0,
      category,
      location,
      status || 'Active',
      imageUrl
    ]);

    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start Server (ใส่ '0.0.0.0' เพื่อให้ไอพีภายนอกเข้าถึงได้)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});