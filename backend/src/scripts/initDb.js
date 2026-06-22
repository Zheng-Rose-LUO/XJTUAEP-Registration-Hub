require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function init() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const sql = fs.readFileSync(path.join(__dirname, '../../init.sql'), 'utf8');
  await conn.query(sql);
  console.log('数据库初始化成功！');
  await conn.end();
}

init().catch(err => {
  console.error('初始化失败：', err.message);
  process.exit(1);
});
