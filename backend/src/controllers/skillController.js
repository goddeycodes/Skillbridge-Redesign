const Skill = require('../models/Skill');

const SKILL_CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Arts & Crafts', 'Cooking', 'Fitness', 'Academic', 'Other'
];

// POST /api/skills
exports.createSkill = async (req, res) => {
  try {
    const { name, description, category, tags, type, proficiency, format, language } = req.body;

    if (!name?.trim())  return res.status(400).json({ success: false, message: 'Skill name is required.' });
    if (!category)      return res.status(400).json({ success: false, message: 'Category is required.' });
    if (!['teach','learn'].includes(type))
      return res.status(400).json({ success: false, message: 'Type must be "teach" or "learn".' });

    // Limit per user per type
    const count = await Skill.countDocuments({ userId: req.user.id, type, isActive: true });
    if (count >= 10)
      return res.status(400).json({ success: false, message: `You can list up to 10 ${type} skills.` });

    const skill = await Skill.create({
      userId: req.user.id, name: name.trim(), description, category,
      tags: Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      type, proficiency, format: format || 'one-on-one', language: language || 'English',
    });

    res.status(201).json({ success: true, skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/skills?type=teach&category=Technology&q=python&language=English
exports.getSkills = async (req, res) => {
  try {
    const { type, category, q, language, userId } = req.query;
    const filter = { isActive: true };
    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (language) filter.language = language;
    if (userId)   filter.userId   = userId;
    if (q)        filter.$text    = { $search: q };

    const skills = await Skill.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/skills/categories
exports.getCategories = async (req, res) => {
  res.json({ success: true, categories: SKILL_CATEGORIES });
};

// PATCH /api/skills/:id
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill)                       return res.status(404).json({ success: false, message: 'Skill not found.' });
    if (skill.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorised.' });

    const allowed = ['name','description','category','tags','proficiency','format','language'];
    allowed.forEach(k => { if (req.body[k] !== undefined) skill[k] = req.body[k]; });
    await skill.save();

    res.json({ success: true, skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/skills/:id  (soft delete)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill)                       return res.status(404).json({ success: false, message: 'Skill not found.' });
    if (skill.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorised.' });

    skill.isActive = false;
    await skill.save();
    res.json({ success: true, message: 'Skill removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
