const axios = require('axios');
const Skill = require('../models/Skill');
const User  = require('../models/User');

const toEngineSkill = (s) => ({
  id:          String(s._id),
  userId:      s.userId,
  name:        s.name,
  category:    s.category,
  type:        s.type,
  proficiency: s.proficiency,
  tags:        s.tags,
  language:    s.language,
  description: s.description,
});

// GET /api/matches
exports.getMatches = async (req, res) => {
  try {
    // 1. Get current user's skills
    const mySkills = await Skill.find({ userId: req.user.id, isActive: true }).lean();

    if (!mySkills.length)
      return res.status(400).json({
        success: false,
        message: 'Add at least one skill to teach AND one skill to learn before matching.',
        code: 'NO_SKILLS',
      });

    const hasTeach = mySkills.some(s => s.type === 'teach');
    const hasLearn = mySkills.some(s => s.type === 'learn');

    if (!hasTeach || !hasLearn)
      return res.status(400).json({
        success: false,
        message: `You need at least one skill to ${!hasTeach ? 'teach' : 'learn'} to get matches.`,
        code: 'INCOMPLETE_SKILLS',
      });

    // 2. Fetch all other active users' skills for cross-user matching
    const allSkills = await Skill.find({
      userId: { $ne: req.user.id },
      isActive: true,
    }).lean();

    // 3. Call matching engine
    const engineRes = await axios.post(
      `${process.env.MATCHING_ENGINE_URL || 'http://localhost:8000'}/match`,
      {
        requesterId:       req.user.id,
        requesterSkills:   mySkills.map(toEngineSkill),
        allSkills:         allSkills.map(toEngineSkill),
        requesterTimezone: req.user.timezone || 'UTC',
      },
      { timeout: 10000 }
    );

    const rawMatches = engineRes.data.matches || [];

    if (!rawMatches.length)
      return res.json({ success: true, matches: [], total: 0 });

    // 4. Hydrate candidate profiles from PostgreSQL
    const candidateIds = rawMatches.map(m => m.candidateId);
    const users = await User.findAll({
      where: { id: candidateIds },
      attributes: ['id', 'name', 'avatar', 'bio', 'reputation', 'credits', 'timezone', 'isVerified'],
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    // 5. Merge engine scores with user profiles
    const matches = rawMatches
      .filter(m => userMap[m.candidateId])
      .map(m => ({
        ...m,
        user: userMap[m.candidateId],
        matchPercent: Math.round(m.score * 100),
      }));

    res.json({ success: true, matches, total: matches.length });
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      return res.status(503).json({
        success: false,
        message: 'Matching engine is temporarily unavailable. Please try again shortly.',
        code: 'ENGINE_OFFLINE',
      });
    }
    console.error('Match error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
