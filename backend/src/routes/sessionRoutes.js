const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  bookSession, getSessions, getSession,
  completeSession, cancelSession, rateSession,
} = require('../controllers/sessionController');

router.get('/',              protect, getSessions);
router.get('/:id',           protect, getSession);
router.post('/',             protect, bookSession);
router.patch('/:id/complete',protect, completeSession);
router.patch('/:id/cancel',  protect, cancelSession);
router.post('/:id/rate',     protect, rateSession);

module.exports = router;
