const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

const toPublicUser = (user) => ({
  _id: user._id,
  username: user.username,
  fullName: user.fullName || user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  followers: user.followers,
  following: user.following,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

router.post('/register', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const username = req.body.username?.trim().toLowerCase();
    const fullName = req.body.fullName?.trim() || username;
    const password = req.body.password;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username and password are required.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Acest e-mail sau nume de utilizator este deja folosit.',
      });
    }

    const user = await User.create({
      ...req.body,
      email,
      username,
      fullName,
      password,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.status(201).json({ user: toPublicUser(user), token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email;
    const password = req.body.password;

    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: 'Email or username and password are required.' });
    }

    const identifier = rawIdentifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Date invalide' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Date invalide' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.json({ user: toPublicUser(user), token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  return res.json(toPublicUser(req.user));
});

module.exports = router;
