const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const mapUserSummary = (user) => ({
  id: String(user._id),
  username: user.username,
  fullName: user.fullName || user.username,
  avatarUrl: user.avatar,
  bio: user.bio || '',
});

const mapConversation = (conversation) => {
  const senderId = conversation.lastMessage?.sender?._id || conversation.lastMessage?.sender;

  return {
    id: String(conversation._id),
    participants: (conversation.participants || []).map(mapUserSummary),
    lastMessage: conversation.lastMessage?.text
      ? {
          text: conversation.lastMessage.text,
          senderId: senderId ? String(senderId) : '',
          createdAt: conversation.lastMessage.createdAt || conversation.updatedAt,
        }
      : undefined,
    unreadCount: 0,
    updatedAt: conversation.updatedAt,
  };
};

const mapMessage = (message) => ({
  id: String(message._id),
  conversationId: String(message.conversation),
  sender: mapUserSummary(message.sender),
  text: message.text,
  createdAt: message.createdAt,
});

const buildParticipantsKey = (userId, participantId) => [String(userId), String(participantId)].sort().join(':');

const getConversationForUser = async (conversationId, userId) =>
  Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).populate('participants', 'username fullName avatar bio');

const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username fullName avatar bio')
      .sort({ updatedAt: -1 });

    return res.json(conversations.map(mapConversation));
  } catch (_error) {
    return res.status(500).json({ message: 'Eroare la încărcarea conversațiilor' });
  }
};

const createConversation = async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    return res.status(400).json({ message: 'Participantul este obligatoriu' });
  }

  if (String(participantId) === String(req.user._id)) {
    return res.status(400).json({ message: 'Nu poți crea o conversație cu tine' });
  }

  try {
    const participant = await User.findById(participantId).select('username fullName avatar bio');

    if (!participant) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    const participantsKey = buildParticipantsKey(req.user._id, participantId);
    let conversation = await Conversation.findOne({ participantsKey }).populate('participants', 'username fullName avatar bio');

    if (!conversation) {
      conversation = await Conversation.create({
        participantsKey,
        participants: [req.user._id, participantId],
      });

      conversation = await conversation.populate('participants', 'username fullName avatar bio');
    }

    return res.status(201).json(mapConversation(conversation));
  } catch (_error) {
    return res.status(500).json({ message: 'Eroare la crearea conversației' });
  }
};

const listMessages = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;

  try {
    const conversation = await getConversationForUser(req.params.conversationId, req.user._id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversația nu a fost găsită' });
    }

    const [total, messages] = await Promise.all([
      Message.countDocuments({ conversation: conversation._id }),
      Message.find({ conversation: conversation._id })
        .populate('sender', 'username fullName avatar bio')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      items: messages.map(mapMessage),
      page,
      hasMore: skip + messages.length < total,
      total,
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Eroare la încărcarea mesajelor' });
  }
};

const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const messageText = String(text || '').trim();

  if (!conversationId || !messageText) {
    return res.status(400).json({ message: 'Conversația și textul sunt obligatorii' });
  }

  try {
    const conversation = await getConversationForUser(conversationId, req.user._id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversația nu a fost găsită' });
    }

    let message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: messageText,
    });

    conversation.lastMessage = {
      text: message.text,
      sender: req.user._id,
      createdAt: message.createdAt,
    };
    conversation.updatedAt = message.createdAt;
    await conversation.save();

    message = await message.populate('sender', 'username fullName avatar bio');

    return res.status(201).json(mapMessage(message));
  } catch (_error) {
    return res.status(500).json({ message: 'Eroare la trimiterea mesajului' });
  }
};

module.exports = {
  listConversations,
  createConversation,
  listMessages,
  sendMessage,
};
