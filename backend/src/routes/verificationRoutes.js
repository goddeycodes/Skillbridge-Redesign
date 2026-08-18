const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startVerification, submitQuiz, submitEvidence,
  getVerification, endorseSkill,
  adminGetPending, adminGetAll, adminReview,
} = require('../controllers/verificationController');

// User routes
router.get('/skill/:skillId',     protect, getVerification);
router.post('/start/:skillId',    protect, startVerification);
router.post('/:id/quiz',          protect, submitQuiz);
router.post('/:id/evidence',      protect, submitEvidence);
router.post('/endorse',           protect, endorseSkill);

// Admin routes
router.get('/admin/pending',      protect, adminGetPending);
router.get('/admin/all',          protect, adminGetAll);
router.patch('/admin/:id/review', protect, adminReview);

module.exports = router;
