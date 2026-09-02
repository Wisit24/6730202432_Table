const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// ตั้งค่า CORS ให้รองรับการเรียกจาก Browser ทุกโดเมน และรองรับทุก Headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. API เข้าสู่ระบบ (Login)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT id, username, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('🔴 Login Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET: ดึงสินค้า
app.get('/api/products', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('🔴 Fetch Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST: เพิ่ม/แก้ไข สินค้า (รองรับ price แล้ว)
app.post('/api/products', async (req, res) => {
  const { role, id, name, size, stock, price, category, location, status, imageUrl } = req.body;

  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'ปฏิเสธการเข้าถึง: เฉพาะ Admin เท่านั้น' });
  }

  const productName = name || 'สินค้าใหม่';
  const productSize = size || '-';
  const productStock = Number(stock) || 0;
  const productPrice = Number(price) || 0; // เพิ่มการแปลงค่า price เป็นตัวเลข
  const productCategory = category || 'General';
  const productLocation = location || 'Warehouse A';
  const productStatus = status || 'Active';
  const productImg = imageUrl || 'https://via.placeholder.com/100';

  try {
    if (id) {
      // เพิ่ม price=? เข้าไปในคำสั่ง UPDATE
      const sql = `UPDATE products SET name=?, size=?, stock=?, price=?, category=?, location=?, status=?, imageUrl=? WHERE id=?`;
      await db.query(sql, [productName, productSize, productStock, productPrice, productCategory, productLocation, productStatus, productImg, id]);
      res.json({ success: true, message: 'อัปเดตเรียบร้อย' });
    } else {
      // เพิ่ม price เข้าไปในคำสั่ง INSERT
      const sql = `INSERT INTO products (name, size, stock, price, category, location, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await db.query(sql, [productName, productSize, productStock, productPrice, productCategory, productLocation, productStatus, productImg]);
      res.json({ success: true, insertId: result.insertId });
    }
  } catch (err) {
    console.error('🔴 Save Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST: ลบสินค้า
app.post('/api/products/delete', async (req, res) => {
  const { id, role } = req.body;

  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'ปฏิเสธการเข้าถึง: เฉพาะ Admin เท่านั้น' });
  }

  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ ID ในระบบ' });
    }
    res.json({ success: true, message: 'ลบสินค้าสำเร็จ' });
  } catch (err) {
    console.error('🔴 Delete Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST: สมัครสมาชิก (Register)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    }

    const sql = 'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())';
    await db.query(sql, [username, password, 'user']);

    res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    console.error('🔴 Register Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3042;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));