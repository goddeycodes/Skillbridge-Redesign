const ForumPost = require('../models/ForumPost');
const PostView  = require('../models/PostView');
const User      = require('../models/User');
const notify    = require('../services/notificationService');

const CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Arts & Crafts', 'Cooking', 'Fitness', 'Academic', 'Other',
];

// GET /api/community/categories
exports.getCategories = (req, res) => {
  res.json({ success: true, categories: CATEGORIES });
};

// GET /api/community/posts
exports.getPosts = async (req, res) => {
  try {
    const { category, q, limit = 20, skip = 0 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q)        filter.$text    = { $search: q };

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      ForumPost.countDocuments(filter),
    ]);

    res.json({ success: true, posts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/community/posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    // Count one view per user per post
    const priorView = await PostView.findOneAndUpdate(
      { postId: post._id, userId: req.user.id },
      { $setOnInsert: { postId: post._id, userId: req.user.id, viewedAt: new Date() } },
      { upsert: true, new: false }
    );

    let responsePost = post;
    if (!priorView) {
      responsePost = await ForumPost.findByIdAndUpdate(
        post._id,
        { $inc: { views: 1 } },
        { new: true }
      );
    }

    res.json({ success: true, post: responsePost, viewCounted: !priorView });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/community/posts
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title?.trim() || !content?.trim() || !category)
      return res.status(400).json({ success: false, message: 'Title, content and category are required.' });

    const post = await ForumPost.create({
      userId:     req.user.id,
      userName:   req.user.name,
      userAvatar: req.user.avatar || undefined,
      title:      title.trim(),
      content:    content.trim(),
      category,
      tags: Array.isArray(tags)
        ? tags.map(t => t.trim().toLowerCase()).filter(Boolean)
        : [],
    });

    // Notify all other active users in the background
    notifyAllUsers(req.user.id, req.user.name, title.trim(), category, post._id)
      .catch(err => console.error('Community notify error:', err.message));

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/community/posts/:id/upvote
exports.upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const userId  = req.user.id;
    const upvoted = post.upvotes.includes(userId);
    if (upvoted) post.upvotes.pull(userId);
    else         post.upvotes.push(userId);
    await post.save();

    res.json({ success: true, upvotes: post.upvotes.length, upvoted: !upvoted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/community/posts/:id/replies
exports.addReply = async (req, res) => {
  try {
    const { content, parentReplyId } = req.body;
    if (!content?.trim())
      return res.status(400).json({ success: false, message: 'Reply content is required.' });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.replies.push({
      userId:        req.user.id,
      userName:      req.user.name,
      userAvatar:    req.user.avatar || undefined,
      content:       content.trim(),
      parentReplyId: parentReplyId || null,
    });
    post.replyCount = post.replies.length;
    await post.save();

    const reply = post.replies[post.replies.length - 1];

    // Notify the post author if someone else replied
    if (post.userId !== req.user.id) {
      const snippet = content.trim().slice(0, 60) + (content.trim().length > 60 ? '…' : '');
      notify.newReply(
        post.userId,
        req.user.name,
        post.title,
        post._id.toString(),
        snippet
      );
    }

    res.status(201).json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/community/posts/:id/replies/:replyId/upvote
exports.upvoteReply = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found.' });

    const userId  = req.user.id;
    const upvoted = reply.upvotes.includes(userId);
    if (upvoted) reply.upvotes.pull(userId);
    else         reply.upvotes.push(userId);
    await post.save();

    res.json({ success: true, upvotes: reply.upvotes.length, upvoted: !upvoted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/community/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.userId !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorised.' });

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Internal helper ───────────────────────────────────────────────────────────
async function notifyAllUsers(posterId, posterName, postTitle, category, postId) {
  const users = await User.findAll({
    where:      { isActive: true },
    attributes: ['id'],
  });

  const promises = users
    .filter(u => u.id !== posterId)
    .map(u =>
      notify.newCommunityPost(u.id, posterName, postTitle, category, postId?.toString())
    );

  await Promise.allSettled(promises);
}