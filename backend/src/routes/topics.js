const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取指定用户的交流话题（供弹窗使用）
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM user_chat_topics WHERE user_id=? ORDER BY created_at DESC', [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取当前用户的交流话题
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM user_chat_topics WHERE user_id=? ORDER BY created_at DESC', [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 添加话题
router.post('/', auth, async (req, res) => {
  const { topic, category } = req.body;
  if (!topic?.trim()) return res.status(400).json({ message: '内容必填' });
  try {
    const [r] = await db.execute(
      'INSERT INTO user_chat_topics (user_id, topic, category) VALUES (?,?,?)',
      [req.userId, topic.trim(), category || null]
    );
    res.status(201).json({ id: r.insertId, topic, category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除话题
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM user_chat_topics WHERE id=? AND user_id=?', [req.params.id, req.userId]);
    res.json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
