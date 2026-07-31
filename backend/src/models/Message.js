const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId:     { type: String, required: true, index: true }, // sorted "uid1-uid2"
  senderId:   { type: String, required: true },
  senderName: { type: String, required: true },
  content:    { type: String, required: true, maxlength: 2000 },
  readBy:     [{ type: String }],
}, { timestamps: true });

messageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
