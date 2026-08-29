const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: [
      'match_found', 'session_booked', 'session_requested', 'session_accepted',
      'session_declined', 'session_reminder', 'session_completed', 'session_cancelled',
      'new_reply', 'new_message', 'new_community_post',
      'skill_endorsed', 'verification_approved', 'verification_rejected',
      'rating_received', 'credit_earned', 'welcome',
    ],
  },
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  link:     { type: String },
  read:     { type: Boolean, default: false },
  meta:     { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);