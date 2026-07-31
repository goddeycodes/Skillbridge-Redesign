const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getLedger } = require('../controllers/creditController');

router.get('/', protect, getLedger);

module.exports = router;
