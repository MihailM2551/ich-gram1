const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mapPublicUser = (user, currentUserId) => {
  const followers = Array.isArray(user.followers) ? user.followers : [];
  const following = Array.isArray(user.following) ? user.following : [];
  const viewerId = String(currentUserId || '');

  return {
    _id: user._id,
    username: user.username,
    fullName: user.fullName || user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio || '',
    website: user.website || '',
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    savedPostIds: [],
    isCurrentUser: viewerId ? String(user._id) === viewerId : false,
    isFollowing: viewerId ? followers.some((id) => String(id) === viewerId) : false,
  };
};

const getProfile = async (req, res) => {
  try {
    const rawUsername = decodeURIComponent(String(req.params.username || '')).trim();

    if (!rawUsername) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const profileUser = await User.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(rawUsername)}$`, 'i') },
    });

    if (!profileUser) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const posts = await Post.find({ user: profileUser._id })
      .populate('user', 'username fullName avatar bio website')
      .sort({ createdAt: -1 });

    return res.json({
      user: mapPublicUser(profileUser, req.user._id),
      posts,
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Failed to load profile' });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(currentUser._id) === String(targetUser._id)) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.some((id) => String(id) === String(targetUser._id));

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => String(id) !== String(targetUser._id));
      targetUser.followers = targetUser.followers.filter((id) => String(id) !== String(currentUser._id));
      await Notification.deleteMany({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow',
      });
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow',
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.json(mapPublicUser(targetUser, currentUser._id));
  } catch (_error) {
    return res.status(500).json({ message: 'Failed to update follow state' });
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextUsername = req.body.username?.trim().toLowerCase();
    const nextFullName = req.body.fullName?.trim();

    if (nextUsername && nextUsername !== user.username) {
      const existing = await User.findOne({ username: nextUsername, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = nextUsername;
    }

    if (typeof nextFullName === 'string') {
      user.fullName = nextFullName || user.username;
    }

    if (typeof req.body.bio === 'string') {
      user.bio = req.body.bio.trim();
    }

    if (typeof req.body.website === 'string') {
      user.website = req.body.website.trim();
    }

    if (req.file) {
      user.avatar = path.posix.join('/uploads', req.file.filename);
    }

    await user.save();
    return res.json(mapPublicUser(user, user._id));
  } catch (_error) {
    return res.status(500).json({ message: 'Profile could not be updated' });
  }
};

module.exports = {
  getProfile,
  toggleFollow,
  updateMe,
};
