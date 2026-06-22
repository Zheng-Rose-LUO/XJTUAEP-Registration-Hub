CREATE DATABASE IF NOT EXISTS community_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE community_db;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '登录账号',
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50),
  identity ENUM('本科生','硕士生','博士生','其他'),
  organization VARCHAR(100),
  enrollment_year YEAR,
  undergrad_major VARCHAR(100),
  hometown VARCHAR(100),
  province VARCHAR(50),
  city VARCHAR(50),
  district VARCHAR(50),
  overseas_location VARCHAR(200),
  email VARCHAR(100),
  wechat VARCHAR(100),
  phone_public TINYINT(1) DEFAULT 0,
  email_public TINYINT(1) DEFAULT 0,
  wechat_public TINYINT(1) DEFAULT 0,
  use_privacy_shield TINYINT(1) DEFAULT 0,
  intro_brief VARCHAR(300),
  intro_detail TEXT,
  avatar_path VARCHAR(255),
  resume_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_chat_topics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  topic VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tags (name) VALUES
  ('已工作'), ('已保研'), ('已考研'), ('曾留学'), ('留学中'),
  ('羽毛球'), ('篮球'), ('登山'), ('科幻小说'),
  ('AI for Science'), ('具身智能');

CREATE TABLE user_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tag_id INT NOT NULL,
  highlight_order TINYINT NULL COMMENT '高亮序号1/2/3，NULL=不高亮',
  UNIQUE KEY uq_user_tag (user_id, tag_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
