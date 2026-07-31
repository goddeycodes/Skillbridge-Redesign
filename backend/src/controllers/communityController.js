const PostView = require('../models/PostView');
const ForumPost = require('../models/ForumPost');

const CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Arts & Crafts', 'Cooking', 'Fitness', 'Academic', 'General',
];

// GET /api/community/posts?category=&q=&page=1
exports.getPosts = async (req, res) => {
  try {
    const { category, q, page = 1 } = req.query;
    const limit = 15;
    const skip  = (Number(page) - 1) * limit;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (q) filter.$text = { $search: q };

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-replies'), // exclude replies from list view for performance
      ForumPost.countDocuments(filter),
    ]);

    res.json({ success: true, posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/community/posts/:id  — full post with replies
exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Count only authenticated users
    if (req.user) {

      // Don't count the author's own views
      if (post.userId !== req.user.id) {

        const existingView = await PostView.findOne({
          postId: post._id,
          userId: req.user.id,
        });

        if (!existingView) {
          await PostView.create({
            postId: post._id,
            userId: req.user.id,
          });

          post.views += 1;
          await post.save();
        }
      }
    }

    res.json({
      success: true,
      post,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// POST /api/community/posts
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title?.trim())   return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required.' });
    if (!category)        return res.status(400).json({ success: false, message: 'Category is required.' });

    const post = await ForumPost.create({
      userId:     req.user.id,
      userName:   req.user.name,
      userAvatar: req.user.avatar,
      title:      title.trim(),
      content:    content.trim(),
      category,
      tags: Array.isArray(tags)
        ? tags.map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5)
        : [],
    });

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

    const uid = req.user.id;
    const idx = post.upvotes.indexOf(uid);
    if (idx === -1) post.upvotes.push(uid);   // upvote
    else            post.upvotes.splice(idx, 1); // toggle off

    await post.save();
    res.json({ success: true, upvotes: post.upvotes.length, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/community/posts/:id/replies
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Reply cannot be empty.' });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.replies.push({
      userId:     req.user.id,
      userName:   req.user.name,
      userAvatar: req.user.avatar,
      content:    content.trim(),
    });
    await post.save();

    const reply = post.replies[post.replies.length - 1];
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

    const uid = req.user.id;
    const idx = reply.upvotes.indexOf(uid);
    if (idx === -1) reply.upvotes.push(uid);
    else            reply.upvotes.splice(idx, 1);

    await post.save();
    res.json({ success: true, upvotes: reply.upvotes.length, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/community/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised.' });

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  res.json({ success: true, categories: ['All', ...CATEGORIES] });
};
