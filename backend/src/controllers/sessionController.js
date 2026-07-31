const Session  = require('../models/Session');
const User     = require('../models/User');
const Rating   = require('../models/Rating');
const CreditTransaction = require('../models/CreditTransaction');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const USER_ATTRS = ['id', 'name', 'avatar', 'reputation', 'timezone', 'isVerified'];

/** Attach hydrated teacher/learner profiles + viewer's role + canRate flag to each session */
const hydrateSessions = async (sessions, viewerId) => {
  if (!sessions.length) return [];

  const userIds = [...new Set(sessions.flatMap(s => [s.teacherId, s.learnerId]))];
  const users = await User.findAll({ where: { id: userIds }, attributes: USER_ATTRS });
  const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

  const sessionIds = sessions.map(s => s.id);
  const myRatings = await Rating.findAll({
    where: { sessionId: sessionIds, raterId: viewerId },
    attributes: ['sessionId'],
  });
  const ratedSessionIds = new Set(myRatings.map(r => r.sessionId));

  return sessions.map(s => {
    const json = s.toJSON();
    const isTeacher = json.teacherId === viewerId;
    return {
      ...json,
      role: isTeacher ? 'teacher' : 'learner',
      otherUser: userMap[isTeacher ? json.learnerId : json.teacherId] || null,
      canRate: json.status === 'completed' && !ratedSessionIds.has(json.id),
      roomId: [json.teacherId, json.learnerId].sort().join('-'),
    };
  });
};

// POST /api/sessions
exports.bookSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { teacherId, skillId, title, scheduledAt, duration, meetingLink, notes } = req.body;
    const learnerId = req.user.id;

    if (!teacherId || !skillId || !title || !scheduledAt)
      return res.status(400).json({ success: false, message: 'Missing required booking fields.' });

    if (learnerId === teacherId)
      return res.status(400).json({ success: false, message: 'Cannot book a session with yourself.' });

    if (new Date(scheduledAt) <= new Date())
      return res.status(400).json({ success: false, message: 'Session must be scheduled in the future.' });

    const [learner, teacher] = await Promise.all([
      User.findByPk(learnerId, { transaction: t }),
      User.findByPk(teacherId, { transaction: t }),
    ]);

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    if (learner.credits < 1)
      return res.status(400).json({ success: false, message: 'Insufficient credits. You need at least 1 credit to book a session.' });

    const session = await Session.create(
      { teacherId, learnerId, skillId, title, scheduledAt, duration: duration || 60, meetingLink, notes, status: 'confirmed' },
      { transaction: t }
    );

    await learner.decrement('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: learnerId, amount: -1, type: 'spent', reason: `Booked: ${title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();
    const [hydrated] = await hydrateSessions([session], learnerId);
    res.status(201).json({ success: true, session: hydrated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sessions?status=upcoming|completed|cancelled
exports.getSessions = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { [Op.or]: [{ teacherId: req.user.id }, { learnerId: req.user.id }] };

    if (status === 'upcoming')  where.status = { [Op.in]: ['pending', 'confirmed'] };
    if (status === 'completed') where.status = 'completed';
    if (status === 'cancelled') where.status = 'cancelled';

    const sessions = await Session.findAll({ where, order: [['scheduledAt', 'ASC']] });
    const hydrated = await hydrateSessions(sessions, req.user.id);

    res.json({ success: true, sessions: hydrated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sessions/:id
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised.' });

    const [hydrated] = await hydrateSessions([session], req.user.id);
    res.json({ success: true, session: hydrated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/sessions/:id/complete
exports.completeSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await Session.findByPk(req.params.id, { transaction: t });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    if (session.status === 'completed')
      return res.status(400).json({ success: false, message: 'Session already marked complete.' });
    if (session.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Cannot complete a cancelled session.' });

    session.status = 'completed';
    await session.save({ transaction: t });

    const teacher = await User.findByPk(session.teacherId, { transaction: t });
    await teacher.increment('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: session.teacherId, amount: 1, type: 'earned', reason: `Completed: ${session.title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();
    const [hydrated] = await hydrateSessions([session], req.user.id);
    res.json({ success: true, session: hydrated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/sessions/:id/cancel
exports.cancelSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await Session.findByPk(req.params.id, { transaction: t });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    if (session.status === 'completed')
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed session.' });
    if (session.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Session already cancelled.' });

    session.status = 'cancelled';
    await session.save({ transaction: t });

    // Refund the learner's credit since the session never happened
    const learner = await User.findByPk(session.learnerId, { transaction: t });
    await learner.increment('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: session.learnerId, amount: 1, type: 'refund', reason: `Cancelled: ${session.title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();
    const [hydrated] = await hydrateSessions([session], req.user.id);
    res.json({ success: true, session: hydrated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/sessions/:id/rate
exports.rateSession = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const session = await Session.findByPk(req.params.id);

    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only rate completed sessions.' });
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    if (!score || score < 1 || score > 5)
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 5.' });

    const ratedId = session.teacherId === req.user.id ? session.learnerId : session.teacherId;

    const existing = await Rating.findOne({ where: { sessionId: session.id, raterId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, message: 'You already rated this session.' });

    const rating = await Rating.create({ sessionId: session.id, raterId: req.user.id, ratedId, score, feedback });

    // Recalculate the rated user's average reputation
    const allRatings = await Rating.findAll({ where: { ratedId }, attributes: ['score'] });
    const avg = allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length;
    await User.update({ reputation: Math.round(avg * 10) / 10 }, { where: { id: ratedId } });

    res.status(201).json({ success: true, rating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
