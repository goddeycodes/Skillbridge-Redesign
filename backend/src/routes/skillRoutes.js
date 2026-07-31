const router  = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { createSkill, getSkills, getCategories, updateSkill, deleteSkill } = require('../controllers/skillController');

router.get('/categories', getCategories);
router.get('/',           getSkills);
router.post('/',          protect, createSkill);
router.patch('/:id',      protect, updateSkill);
router.delete('/:id',     protect, deleteSkill);

module.exports = router;
