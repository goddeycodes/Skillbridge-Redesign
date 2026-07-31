const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getHistory } = require('../controllers/messageController');

router.get('/:otherUserId', protect, getHistory);

module.exports = router;
