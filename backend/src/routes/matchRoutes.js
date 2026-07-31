const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getMatches } = require('../controllers/matchController');

router.get('/', protect, getMatches);

module.exports = router;
