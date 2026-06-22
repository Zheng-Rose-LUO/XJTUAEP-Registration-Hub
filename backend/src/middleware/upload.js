const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeStorage(folder) {
  const dir = path.join(__dirname, '../../uploads', folder);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${req.userId}_${Date.now()}${ext}`);
    }
  });
}

const avatarUpload = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /image\/(jpeg|png)/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('头像只支持 JPG/PNG 格式'));
  }
});

const resumeUpload = multer({
  storage: makeStorage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('简历只支持 PDF 格式'));
  }
});

module.exports = { avatarUpload, resumeUpload };
