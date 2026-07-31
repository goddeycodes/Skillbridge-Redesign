const User  = require('../models/User');
const Skill = require('../models/Skill');
const Rating = require('../models/Rating');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const sanitizeUser = (user) => {
  const u = user.toJSON ? user.toJSON() : user;
  delete u.password; delete u.googleId;
  return u;
};

// GET /api/users/:id  — public profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'googleId'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const [teachSkills, learnSkills, ratingsGiven] = await Promise.all([
      Skill.find({ userId: req.params.id, type: 'teach', isActive: true }),
      Skill.find({ userId: req.params.id, type: 'learn', isActive: true }),
      Rating.findAll({
        where: { ratedId: req.params.id },
        attributes: ['score', 'feedback', 'createdAt'],
        limit: 10,
        order: [['createdAt', 'DESC']],
      }),
    ]);

    res.json({ success: true, user: sanitizeUser(user), teachSkills, learnSkills, ratings: ratingsGiven });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/users/me  — update profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'avatar', 'timezone'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    await req.user.update(updates);
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/me/skills  — all skills for current user (teach + learn)
exports.getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    const teach  = skills.filter(s => s.type === 'teach');
    const learn  = skills.filter(s => s.type === 'learn');
    res.json({ success: true, teach, learn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
