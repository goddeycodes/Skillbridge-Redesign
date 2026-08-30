const Session  = require('../models/Session');
const User     = require('../models/User');
const Skill    = require('../models/Skill');
const Rating   = require('../models/Rating');
const SkillVerification = require('../models/SkillVerification');
const CreditTransaction = require('../models/CreditTransaction');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { roomIdFor } = require('../utils/roomId');
const notify = require('../services/notificationService');
const dailyService = require('../services/dailyService');

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
      roomId: roomIdFor(json.teacherId, json.learnerId),
      // Frontend uses this to decide whether to show the in-app "Join" button
      // at all, vs falling back to an external meetingLink (or nothing).
      hasVideoRoom: !!json.videoRoomName,
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

    const skill = await Skill.findById(skillId);
    if (!skill || !skill.isActive)
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    if (skill.userId !== teacherId)
      return res.status(400).json({ success: false, message: 'Skill does not belong to this teacher.' });
    if (!skill.isVerified)
      return res.status(400).json({
        success: false,
        message: 'This skill has not been verified yet. The teacher must complete verification before sessions can be booked.',
        code: 'SKILL_NOT_VERIFIED',
      });

    const session = await Session.create(
      { teacherId, learnerId, skillId, title, scheduledAt, duration: duration || 60, meetingLink, notes, status: 'pending' },
      { transaction: t }
    );

    await learner.decrement('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: learnerId, amount: -1, type: 'spent', reason: `Booked: ${title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();

    await notify.sessionRequested(teacherId, learner.name, title, session.id);

    const [hydrated] = await hydrateSessions([session], learnerId);
    res.status(201).json({ success: true, session: hydrated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sessions?status=upcoming|completed|cancelled&role=teacher|learner
exports.getSessions = async (req, res) => {
  try {
    const { status, role } = req.query;
    const where = {};

    if (role === 'teacher')      where.teacherId = req.user.id;
    else if (role === 'learner') where.learnerId = req.user.id;
    else where[Op.or] = [{ teacherId: req.user.id }, { learnerId: req.user.id }];

    if (status === 'upcoming')  where.status = { [Op.in]: ['pending', 'confirmed'] };
  if (status === 'completed') where.status = 'completed';
  if (status === 'cancelled') where.status = 'cancelled';
  // status === 'all' or undefined: no filter, return everything

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

// GET /api/sessions/:id/video
// Mints a short-lived join token for the in-app Daily.co room. Called
// on-demand when the user clicks "Join," not stored anywhere.
exports.getVideoAccess = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.teacherId !== req.user.id && session.learnerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    if (session.status !== 'confirmed')
      return res.status(400).json({ success: false, message: 'This session does not have an active video room.' });
    if (!session.videoRoomName)
      return res.status(404).json({
        success: false,
        message: 'No in-app video room for this session — use the external meeting link if one was provided.',
        code: 'NO_VIDEO_ROOM',
      });

    const token = await dailyService.createMeetingToken(session.videoRoomName, req.user.name);
    if (!token)
      return res.status(503).json({ success: false, message: 'Could not create a join link right now. Please try again.' });

    res.json({ success: true, roomUrl: session.videoRoomUrl, token });
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
    if (session.status !== 'confirmed')
      return res.status(400).json({ success: false, message: 'Only confirmed sessions can be marked complete.' });

    session.status = 'completed';
    await session.save({ transaction: t });

    const teacher = await User.findByPk(session.teacherId, { transaction: t });
    await teacher.increment('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: session.teacherId, amount: 1, type: 'earned', reason: `Completed: ${session.title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();

    const otherId = req.user.id === session.teacherId ? session.learnerId : session.teacherId;

    await notify.sessionCompleted(otherId, req.user.name);
    await notify.creditEarned(
      session.teacherId,
      1,
      `You earned 1 credit for teaching "${session.title}".`
    );

    // Learner auto-endorses the teacher's skill after a completed session
    try {
      const learner = await User.findByPk(session.learnerId, { attributes: ['id', 'name'] });
      const verification = await SkillVerification.findOne({
        skillId: session.skillId,
        userId:  session.teacherId,
      });
      if (verification && learner) {
        const already = verification.endorsements.some(e => e.sessionId === session.id);
        if (!already) {
          verification.endorsements.push({
            endorserId:   learner.id,
            endorserName: learner.name,
            sessionId:    session.id,
          });
          verification.stepsCompleted.endorsement = verification.endorsements.length >= 1;
          await verification.save();
          await notify.skillEndorsed(session.teacherId, learner.name, verification.skillName);
        }
      }
    } catch (endorseErr) {
      console.warn('Auto-endorse failed:', endorseErr.message);
    }

    const [hydrated] = await hydrateSessions([session], req.user.id);
    res.json({ success: true, session: hydrated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/sessions/:id/accept
exports.acceptSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.teacherId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the teacher can accept a session request.' });
    if (session.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending requests can be accepted.' });

    session.status = 'confirmed';

    // Provision the in-app video room now — this is the moment the session
    // becomes real, so there's no point creating a room any earlier (for a
    // request that might get declined) or later (the learner should be able
    // to join as soon as it's confirmed).
    const room = await dailyService.createRoomForSession(session);
    if (room) {
      session.videoRoomName = room.roomName;
      session.videoRoomUrl  = room.roomUrl;
    }
    // If room creation failed (e.g. DAILY_API_KEY not configured), we still
    // confirm the session — it just falls back to session.meetingLink (an
    // external link) if one was provided, or no video at all. Never block
    // accepting a session because a third-party video API had a hiccup.

    await session.save();

    await notify.sessionAccepted(session.learnerId, req.user.name, session.title, session.id);

    const [hydrated] = await hydrateSessions([session], req.user.id);
    res.json({ success: true, session: hydrated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/sessions/:id/decline
exports.declineSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await Session.findByPk(req.params.id, { transaction: t });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.teacherId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the teacher can decline a session request.' });
    if (session.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending requests can be declined.' });

    session.status = 'cancelled';
    await session.save({ transaction: t });

    const learner = await User.findByPk(session.learnerId, { transaction: t });
    await learner.increment('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: session.learnerId, amount: 1, type: 'refund', reason: `Declined: ${session.title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();

    await notify.sessionDeclined(session.learnerId, req.user.name, session.title);

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

    const wasPending = session.status === 'pending';
    const isLearner  = req.user.id === session.learnerId;
    const hadVideoRoom = session.videoRoomName;

    session.status = 'cancelled';
    await session.save({ transaction: t });

    const learner = await User.findByPk(session.learnerId, { transaction: t });
    await learner.increment('credits', { by: 1, transaction: t });
    await CreditTransaction.create(
      { userId: session.learnerId, amount: 1, type: 'refund', reason: `Cancelled: ${session.title}`, sessionId: session.id },
      { transaction: t }
    );

    await t.commit();

    // Clean up the video room promptly rather than letting it sit until its
    // exp — a session cancelled hours before its scheduled time shouldn't
    // leave a live room lying around. Best-effort: never blocks the cancel.
    if (hadVideoRoom) dailyService.deleteRoom(hadVideoRoom);

    if (wasPending && isLearner) {
      await notify.create({
        userId: session.teacherId,
        type:   'session_cancelled',
        title:  'Session request withdrawn',
        body:   `${req.user.name} withdrew their request for "${session.title}".`,
        link:   '/sessions/teaching',
      });
    } else if (wasPending) {
      await notify.sessionDeclined(session.learnerId, req.user.name, session.title);
    } else if (isLearner) {
      await notify.create({
        userId: session.teacherId,
        type:   'session_cancelled',
        title:  'Session cancelled',
        body:   `${req.user.name} cancelled "${session.title}".`,
        link:   '/sessions/teaching',
      });
    } else {
      await notify.sessionCancelled(session.learnerId, req.user.name, session.title);
    }

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

    await notify.ratingReceived(ratedId, req.user.name, score);

    res.status(201).json({ success: true, rating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};