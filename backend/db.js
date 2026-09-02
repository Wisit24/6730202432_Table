const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'std6730202432',
  password: process.env.DB_PASSWORD || 'vJ@7cT2p',
  database: process.env.DB_NAME || 'ip_std6730202432',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;