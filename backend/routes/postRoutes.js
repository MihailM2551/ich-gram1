const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const {
  createPost,
  getFeed,
  getExplore,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/postController');

const uploadsPath = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get('/search', protect, async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('username fullName avatar bio');

    return res.json(users);
  } catch (_error) {
    return res.status(500).json({ message: 'Search failed' });
  }
});

router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username fullName avatar')
      .populate('post', 'image')
      .sort('-createdAt');

    return res.json(notifications);
  } catch (_error) {
    return res.status(500).json({ message: 'Failed to load notifications' });
  }
});

router.get('/', protect, getFeed);
router.get('/feed', protect, getFeed);
router.get('/explore', protect, getExplore);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id/like', protect, toggleLike);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
