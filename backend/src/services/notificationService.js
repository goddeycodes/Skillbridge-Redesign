const Notification = require('../models/Notification');
const pushService = require('./pushService');

let _io = null;

const init = (io) => {
  _io = io;
};

const create = async ({ userId, type, title, body, link, meta }) => {
  try {
    const notification = await Notification.create({
      userId, type, title, body, link, meta,
    });

    const payload = {
      _id:       notification._id,
      type:      notification.type,
      title:     notification.title,
      body:      notification.body,
      link:      notification.link,
      meta:      notification.meta,
      read:      false,
      createdAt: notification.createdAt,
    };

    if (_io) {
      _io.to(`user:${userId}`).emit('notification', payload);
    }

    // Browser / OS push (when user granted permission)
    pushService.sendToUser(userId, {
      title: notification.title,
      body:  notification.body,
      link:  notification.link,
      tag:   String(notification._id),
    }).catch(err => console.error('pushService.sendToUser failed:', err.message));

    return notification;
  } catch (err) {
    console.error('notificationService.create failed:', err.message);
  }
};

const welcome = (userId, name) =>
  create({
    userId, type: 'welcome',
    title: `Welcome to SkillBridge, ${name}!`,
    body:  'You have 10 free credits. Add your first skill to get started.',
    link:  '/profile',
  });

const sessionRequested = (teacherId, learnerName, sessionTitle, sessionId) =>
  create({
    userId: teacherId,
    type:   'session_requested',
    title:  'New session request',
    body:   `${learnerName} requested "${sessionTitle}". Review it in Teaching Sessions.`,
    link:   '/sessions/teaching',
    meta:   { sessionId },
  });

const sessionAccepted = (learnerId, teacherName, sessionTitle, sessionId) =>
  create({
    userId: learnerId,
    type:   'session_accepted',
    title:  'Session confirmed!',
    body:   `${teacherName} accepted your request for "${sessionTitle}".`,
    link:   '/sessions',
    meta:   { sessionId },
  });

const sessionDeclined = (learnerId, teacherName, sessionTitle) =>
  create({
    userId: learnerId,
    type:   'session_declined',
    title:  'Session request declined',
    body:   `${teacherName} declined "${sessionTitle}". Your credit has been refunded.`,
    link:   '/sessions',
  });

const sessionBooked = (teacherId, learnerName, sessionTitle, sessionId) =>
  create({
    userId: teacherId,
    type:   'session_booked',
    title:  'New session confirmed',
    body:   `${learnerName} booked "${sessionTitle}" with you. The session is confirmed.`,
    link:   '/sessions',
    meta:   { sessionId },
  });

const sessionCancelled = (userId, otherName, sessionTitle) =>
  create({
    userId, type: 'session_cancelled',
    title: 'Session cancelled',
    body:  `"${sessionTitle}" with ${otherName} was cancelled. Your credit was refunded.`,
    link:  '/sessions',
  });

const sessionCompleted = (userId, otherName) =>
  create({
    userId, type: 'session_completed',
    title: 'Session complete',
    body:  `Your session with ${otherName} is done. Leave a rating!`,
    link:  '/sessions',
  });

const newReply = (userId, replierName, postTitle, postId, replySnippet) =>
  create({
    userId, type: 'new_reply',
    title: 'New reply on your post',
    body:  replySnippet
      ? `${replierName} replied: "${replySnippet}"`
      : `${replierName} replied to "${postTitle}".`,
    link:  postId ? `/community?post=${postId}` : '/community',
    meta:  postId ? { postId } : undefined,
  });

const newCommunityPost = (userId, posterName, postTitle, category, postId) =>
  create({
    userId,
    type:  'new_community_post',
    title: `New discussion in ${category}`,
    body:  `${posterName} posted: "${postTitle}"`,
    link:  postId ? `/community?post=${postId}` : '/community',
    meta:  postId ? { postId, category } : { category },
  });

const skillEndorsed = (userId, endorserName, skillName) =>
  create({
    userId, type: 'skill_endorsed',
    title: 'Skill endorsed',
    body:  `${endorserName} endorsed your "${skillName}" skill.`,
    link:  '/profile',
  });

const verificationApproved = (userId, skillName) =>
  create({
    userId, type: 'verification_approved',
    title: 'Skill verified ✓',
    body:  `Your "${skillName}" skill is verified. You can now teach it.`,
    link:  '/profile',
  });

const verificationRejected = (userId, skillName, reason) =>
  create({
    userId, type: 'verification_rejected',
    title: 'Verification needs attention',
    body:  reason || `Your "${skillName}" verification was not approved. Resubmit on your profile.`,
    link:  '/profile',
  });

const ratingReceived = (userId, raterName, score) =>
  create({
    userId, type: 'rating_received',
    title: 'New rating received',
    body:  `${raterName} gave you ${score} star${score !== 1 ? 's' : ''}.`,
    link:  '/profile',
    meta:  { score },
  });

const creditEarned = (userId, amount, reason) =>
  create({
    userId, type: 'credit_earned',
    title: `+${amount} credit${amount !== 1 ? 's' : ''} earned`,
    body:  reason,
    link:  '/credits',
    meta:  { amount },
  });

const matchFound = (userId, matchName, matchPercent) =>
  create({
    userId, type: 'match_found',
    title: 'New match found',
    body:  `${matchName} is a ${matchPercent}% match for you.`,
    link:  '/matching',
    meta:  { matchPercent },
  });

module.exports = {
  init,
  create,
  welcome,
  sessionRequested,
  sessionAccepted,
  sessionDeclined,
  sessionBooked,
  sessionCancelled,
  sessionCompleted,
  newReply,
  newCommunityPost,
  skillEndorsed,
  verificationApproved,
  verificationRejected,
  ratingReceived,
  creditEarned,
  matchFound,
};
