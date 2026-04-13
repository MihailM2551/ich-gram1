const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participantsKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
