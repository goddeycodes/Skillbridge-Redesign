const router  = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPosts, getPost, createPost,
  upvotePost, addReply, upvoteReply,
  deletePost, getCategories,
} = require('../controllers/communityController');

router.get('/categories',                              getCategories);
router.get('/posts',                                   getPosts);
router.get('/posts/:id',                 protect,      getPost);
router.post('/posts',                    protect,      createPost);
router.post('/posts/:id/upvote',         protect,      upvotePost);
router.post('/posts/:id/replies',        protect,      addReply);
router.post('/posts/:id/replies/:replyId/upvote', protect, upvoteReply);
router.delete('/posts/:id',              protect,      deletePost);

module.exports = router;
