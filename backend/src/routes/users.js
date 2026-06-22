const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { avatarUpload, resumeUpload } = require('../middleware/upload');
const router = express.Router();

// 获取当前用户完整信息（含 phone）
router.get('/me', auth, async (req, res) => {
  try {
    const [[user]] = await db.execute(
      'SELECT id,phone,name,role,identity,identity_other,organization,enrollment_year,undergrad_major,undergrad_major_other,hometown_province,hometown_city,province,city,overseas_location,email,wechat,phone_public,email_public,wechat_public,use_privacy_shield,intro_brief,intro_detail,avatar_path,resume_path FROM users WHERE id=?',
      [req.userId]
    );
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json(user);
  } catch (err) {
    console.error('[user/me]', err);
    res.status(500).json({ message: err.message });
  }
});

// 更新当前用户信息
router.put('/me', auth, async (req, res) => {
  const fields = ['name','role','identity','identity_other','organization','enrollment_year',
    'undergrad_major','undergrad_major_other','hometown_province','hometown_city',
    'province','city','overseas_location','email','wechat',
    'phone_public','email_public','wechat_public','use_privacy_shield','intro_brief','intro_detail'];
  const updates = fields.filter(f => req.body[f] !== undefined);
  if (!updates.length) return res.json({ message: 'nothing to update' });
  try {
    await db.execute(
      `UPDATE users SET ${updates.map(f => `${f}=?`).join(',')} WHERE id=?`,
      [...updates.map(f => req.body[f]), req.userId]
    );
    res.json({ message: '保存成功' });
  } catch (err) {
    console.error('[user/put]', err);
    res.status(500).json({ message: err.message });
  }
});

// 上传头像
router.post('/me/avatar', auth, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '未收到文件' });
  const filePath = `/uploads/avatars/${req.file.filename}`;
  await db.execute('UPDATE users SET avatar_path=? WHERE id=?', [filePath, req.userId]);
  res.json({ avatar_path: filePath });
});

// 上传简历
router.post('/me/resume', auth, (req, res, next) => {
  resumeUpload.single('resume')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '未收到文件' });
  const filePath = `/uploads/resumes/${req.file.filename}`;
  await db.execute('UPDATE users SET resume_path=? WHERE id=?', [filePath, req.userId]);
  res.json({ resume_path: filePath });
});

// 获取所有用户卡片（社区）
router.get('/', auth, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT u.id, u.name, u.role, u.identity, u.identity_other, u.organization,
        u.intro_brief, u.intro_detail, u.avatar_path, u.resume_path,
        u.province, u.city, u.overseas_location, u.email, u.wechat, u.phone,
        u.phone_public, u.email_public, u.wechat_public, u.use_privacy_shield,
        GROUP_CONCAT(IF(ut.highlight_order IS NOT NULL, t.name, NULL) ORDER BY ut.highlight_order SEPARATOR ',') AS highlight_tags
       FROM users u
       LEFT JOIN user_tags ut ON ut.user_id = u.id
       LEFT JOIN tags t ON t.id = ut.tag_id
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (err) {
    console.error('[users/list]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
