require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'community_db',
  });

  // 查出已有列名
  const [cols] = await conn.query('SHOW COLUMNS FROM users');
  const existing = new Set(cols.map(c => c.Field));

  const toAdd = [
    [`role`, `ALTER TABLE users ADD COLUMN role ENUM('学子','导师') DEFAULT '学子' AFTER password`],
    [`identity_other`, `ALTER TABLE users ADD COLUMN identity_other VARCHAR(100) AFTER identity`],
    [`undergrad_major_other`, `ALTER TABLE users ADD COLUMN undergrad_major_other VARCHAR(100) AFTER undergrad_major`],
    [`hometown_province`, `ALTER TABLE users ADD COLUMN hometown_province VARCHAR(50) AFTER hometown`],
    [`hometown_city`, `ALTER TABLE users ADD COLUMN hometown_city VARCHAR(50) AFTER hometown_province`],
    [`city`, `ALTER TABLE users ADD COLUMN city VARCHAR(50) AFTER province`],
    [`use_privacy_shield`, `ALTER TABLE users ADD COLUMN use_privacy_shield TINYINT(1) DEFAULT 0 AFTER wechat_public`],
  ];

  for (const [col, sql] of toAdd) {
    if (existing.has(col)) { console.log(`SKIP (exists): ${col}`); continue; }
    await conn.query(sql);
    console.log(`OK: ${col}`);
  }

  await conn.query(`UPDATE users SET identity='本科生' WHERE identity='本科'`);
  await conn.query(`UPDATE users SET identity='硕士生' WHERE identity='硕士'`);
  await conn.query(`UPDATE users SET identity='博士生' WHERE identity='博士'`);
  await conn.query(`ALTER TABLE users MODIFY COLUMN identity ENUM('本科生','硕士生','博士生','其他')`);

  console.log('迁移完成');
  await conn.end();
}

migrate().catch(e => { console.error(e.message); process.exit(1); });
