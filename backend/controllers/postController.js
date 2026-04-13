const Post = require('../models/Post');
const Notification = require('../models/Notification');

const getPopulatedPostById = async (postId) =>
  Post.findById(postId)
    .populate('user', 'username fullName avatar bio')
    .populate('comments.user', 'username fullName avatar');

const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const post = await Post.create({
      user: req.user._id,
      image,
      caption,
    });

    const populatedPost = await getPopulatedPostById(post._id);
    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const feedUserIds = [...new Set([String(req.user._id), ...(req.user.following || []).map((id) => String(id))])];

    const posts = await Post.find({ user: { $in: feedUserIds } })
      .populate('user', 'username fullName avatar bio')
      .populate('comments.user', 'username fullName avatar')
      .sort('-createdAt');

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getExplore = async (_req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username fullName avatar bio')
      .populate('comments.user', 'username fullName avatar')
      .sort('-createdAt');

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = String(req.user._id);
    const postOwnerId = String(post.user);
    const index = post.likes.findIndex((likeId) => String(likeId) === userId);

    if (index === -1) {
      post.likes.push(req.user._id);

      if (postOwnerId !== userId) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id,
        });
      }
    } else {
      post.likes.splice(index, 1);
      await Notification.deleteMany({
        recipient: post.user,
        sender: req.user._id,
        type: 'like',
        post: post._id,
      });
    }

    await post.save();
    const populatedPost = await getPopulatedPostById(post._id);
    return res.json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'username fullName avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = [...post.comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return res.json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!req.body.text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    post.comments.push({
      user: req.user._id,
      text: req.body.text.trim(),
    });

    await post.save();
    const populatedPost = await getPopulatedPostById(post._id);
    const comment = populatedPost.comments[populatedPost.comments.length - 1];

    if (String(post.user) !== String(req.user._id)) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        comment: {
          id: comment._id,
          text: comment.text,
        },
      });
    }

    return res.status(201).json({ comment, post: populatedPost });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Nu poți șterge acest comentariu' });
    }

    await Notification.deleteMany({
      recipient: post.user,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      'comment.id': comment._id,
    });

    comment.deleteOne();
    await post.save();

    const populatedPost = await getPopulatedPostById(post._id);
    return res.json({ post: populatedPost });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getExplore,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
};

