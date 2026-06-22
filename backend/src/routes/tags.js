const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取全部标签
router.get('/', auth, async (req, res) => {
  try {
    const [tags] = await db.execute('SELECT * FROM tags ORDER BY id');
    // 附带当前用户已选
    const [userTags] = await db.execute(
      'SELECT tag_id, highlight_order FROM user_tags WHERE user_id=?', [req.userId]
    );
    const selected = Object.fromEntries(userTags.map(r => [r.tag_id, r.highlight_order]));
    res.json(tags.map(t => ({ ...t, selected: t.id in selected, highlight_order: selected[t.id] ?? null })));
  } catch (err) {
    console.error('[tags/get]', err);
    res.status(500).json({ message: err.message });
  }
});

// 创建新标签（自动去重）
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: '标签名必填' });
  try {
    await db.execute('INSERT IGNORE INTO tags (name) VALUES (?)', [name.trim()]);
    const [[tag]] = await db.execute('SELECT * FROM tags WHERE name=?', [name.trim()]);
    res.json(tag);
  } catch (err) {
    console.error('[tags/post]', err);
    res.status(500).json({ message: err.message });
  }
});

// 切换用户标签选中/取消
router.post('/toggle', auth, async (req, res) => {
  const { tagId } = req.body;
  try {
    const [[existing]] = await db.execute(
      'SELECT id FROM user_tags WHERE user_id=? AND tag_id=?', [req.userId, tagId]
    );
    if (existing) {
      await db.execute('DELETE FROM user_tags WHERE user_id=? AND tag_id=?', [req.userId, tagId]);
      res.json({ action: 'removed' });
    } else {
      await db.execute('INSERT INTO user_tags (user_id, tag_id) VALUES (?,?)', [req.userId, tagId]);
      res.json({ action: 'added' });
    }
  } catch (err) {
    console.error('[tags/toggle]', err);
    res.status(500).json({ message: err.message });
  }
});

// 设置高亮标签（最多3个）
router.post('/highlight', auth, async (req, res) => {
  const { tagId, order } = req.body; // order: 1|2|3|null
  try {
    if (order === null) {
      await db.execute(
        'UPDATE user_tags SET highlight_order=NULL WHERE user_id=? AND tag_id=?', [req.userId, tagId]
      );
    } else {
      // 清掉同序号
      await db.execute(
        'UPDATE user_tags SET highlight_order=NULL WHERE user_id=? AND highlight_order=?', [req.userId, order]
      );
      await db.execute(
        'UPDATE user_tags SET highlight_order=? WHERE user_id=? AND tag_id=?', [order, req.userId, tagId]
      );
    }
    res.json({ message: 'ok' });
  } catch (err) {
    console.error('[tags/highlight]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
