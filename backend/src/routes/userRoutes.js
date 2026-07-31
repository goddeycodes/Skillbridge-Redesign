const router  = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, getMySkills } = require('../controllers/userController');

router.get('/me/skills', protect, getMySkills);   // must be before /:id
router.get('/:id',       getProfile);
router.patch('/me',      protect, updateProfile);

module.exports = router;
