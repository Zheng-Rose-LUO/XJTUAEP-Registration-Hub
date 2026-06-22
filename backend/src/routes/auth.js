const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';

// 注册
router.post('/register', async (req, res) => {
  const { phone, password, name } = req.body;
  if (!phone || !password) return res.status(400).json({ message: '手机号和密码必填' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (phone, password, name) VALUES (?, ?, ?)',
      [phone, hash, name || null]
    );
    res.status(201).json({ message: '注册成功', userId: result.insertId });
  } catch (err) {
    console.error('[register error]', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '手机号已注册' });
    res.status(500).json({ message: '服务器错误', detail: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: '手机号和密码必填' });

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!rows.length) return res.status(401).json({ message: '手机号或密码错误' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: '手机号或密码错误' });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, name: user.name });
  } catch (err) {
    console.error('[login error]', err);
    res.status(500).json({ message: '服务器错误', detail: err.message });
  }
});

module.exports = router;
