const express = require('express');
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { getProfile, toggleFollow, updateMe } = require('../controllers/userController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get('/profile/:username', protect, getProfile);
router.put('/me', protect, upload.single('avatar'), updateMe);
router.post('/:userId/follow', protect, toggleFollow);

module.exports = router;
