const mongoose = require('mongoose');

const postViewSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One view per user per post
postViewSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PostView', postViewSchema);