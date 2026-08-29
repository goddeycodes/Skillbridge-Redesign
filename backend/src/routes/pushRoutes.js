const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getPublicKey, subscribe, unsubscribe } = require('../controllers/pushController');

router.get('/vapid-public-key', protect, getPublicKey);
router.post('/subscribe',       protect, subscribe);
router.post('/unsubscribe',     protect, unsubscribe);

module.exports = router;
