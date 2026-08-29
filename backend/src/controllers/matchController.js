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

const hydrateMatches = async (rawMatches) => {
  if (!rawMatches.length) return [];

  const candidateIds = rawMatches.map(m => m.candidateId);
  const teachSkillIds  = rawMatches.map(m => m.theyTeachId).filter(Boolean);

  const [users, teachSkills] = await Promise.all([
    User.findAll({
      where: { id: candidateIds },
      attributes: ['id', 'name', 'avatar', 'bio', 'reputation', 'credits', 'timezone', 'isVerified'],
    }),
    Skill.find({ _id: { $in: teachSkillIds } }).select('_id isVerified').lean(),
  ]);

  const userMap     = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));
  const verifiedMap = Object.fromEntries(teachSkills.map(s => [String(s._id), !!s.isVerified]));

  return rawMatches
    .filter(m => userMap[m.candidateId])
    .map(m => ({
      ...m,
      user: userMap[m.candidateId],
      matchPercent: Math.round(m.score * 100),
      theyTeachVerified: verifiedMap[m.theyTeachId] ?? false,
    }));
};

const callEngine = async (requesterId, requesterSkills, allSkills, timezone) => {
  const engineRes = await axios.post(
    `${process.env.MATCHING_ENGINE_URL || 'http://localhost:8000'}/match`,
    {
      requesterId,
      requesterSkills:   requesterSkills.map(toEngineSkill),
      allSkills:         allSkills.map(toEngineSkill),
      requesterTimezone: timezone || 'UTC',
    },
    { timeout: 10000 }
  );
  return engineRes.data.matches || [];
};

const matchTeachesTarget = (m, targetSkill) => {
  const targetId = String(targetSkill._id);
  if (m.theyTeachId === targetId) return true;
  return m.theyTeach?.toLowerCase() === targetSkill.name?.toLowerCase();
};

/** When browsing Discover Skills, run matching focused on one teach skill */
const findMatchesForSkill = async (requesterId, mySkills, targetSkill, allSkills) => {
  const candSkills = allSkills.filter(s => s.userId === targetSkill.userId);
  if (!candSkills.some(s => s.type === 'learn')) return [];

  const raw = await callEngine(requesterId, mySkills, candSkills, 'UTC');

  return raw
    .filter(m => m.candidateId === targetSkill.userId)
    .map(m => ({
      ...m,
      theyTeach:         targetSkill.name,
      theyTeachId:       String(targetSkill._id),
      theyTeachCategory: targetSkill.category,
      theyTeachProf:     targetSkill.proficiency,
      theyTeachLang:     targetSkill.language || 'English',
      theyTeachDesc:     targetSkill.description || '',
      theyTeachVerified: !!targetSkill.isVerified,
    }));
};

// GET /api/matches?forSkillId=...&forSkillName=...
exports.getMatches = async (req, res) => {
  try {
    const { forSkillId, forSkillName } = req.query;

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

    const allSkills = await Skill.find({
      userId: { $ne: req.user.id },
      isActive: true,
    }).lean();

    let targetSkill = null;
    if (forSkillId) {
      targetSkill = await Skill.findOne({ _id: forSkillId, type: 'teach', isActive: true }).lean();
    }

    let rawMatches = await callEngine(
      req.user.id,
      mySkills,
      allSkills,
      req.user.timezone
    );

    if (targetSkill) {
      let filtered = rawMatches.filter(m => matchTeachesTarget(m, targetSkill));

      if (!filtered.length) {
        filtered = await findMatchesForSkill(req.user.id, mySkills, targetSkill, allSkills);
      }

      rawMatches = filtered;
    } else if (forSkillName) {
      const nameLower = forSkillName.toLowerCase();
      rawMatches = rawMatches.filter(m =>
        m.theyTeach?.toLowerCase().includes(nameLower)
      );
    }

    const matches = await hydrateMatches(rawMatches);

    res.json({
      success: true,
      matches,
      total: matches.length,
      searchContext: targetSkill
        ? { forSkillId: String(targetSkill._id), forSkillName: targetSkill.name }
        : forSkillName
          ? { forSkillName }
          : null,
    });
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
