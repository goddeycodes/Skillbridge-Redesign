const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId:        { type: String, required: true },
  userName:      { type: String, required: true },
  userAvatar:    { type: String },
  content:       { type: String, required: true, maxlength: 1000 },
  upvotes:       [{ type: String }],
  parentReplyId: { type: String, default: null }, // set when replying to another comment, not the post itself
}, { timestamps: true });

const forumPostSchema = new mongoose.Schema({
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  userAvatar: { type: String },
  title:      { type: String, required: true, maxlength: 150 },
  content:    { type: String, required: true, maxlength: 3000 },
  category:   { type: String, required: true },
  tags:       [{ type: String }],
  upvotes:    [{ type: String }],
  replies:    [replySchema],
  replyCount: { type: Number, default: 0 }, // denormalized so the post list can show it without loading the full replies array
  isPinned:   { type: Boolean, default: false },
  views:      { type: Number, default: 0 },
}, { timestamps: true });

forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('ForumPost', forumPostSchema);
