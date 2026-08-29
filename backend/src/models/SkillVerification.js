const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
}, { _id: false });

const skillVerificationSchema = new mongoose.Schema({
  skillId:      { type: String, required: true },   // MongoDB Skill _id
  userId:       { type: String, required: true },   // Postgres user UUID
  skillName:    { type: String, required: true },
  userName:     { type: String, required: true },
  userAvatar:   { type: String },

  // ── Step 1: Quiz ──────────────────────────────────────────────────────────
  quizQuestions:  [{ type: String }],               // AI-generated questions
  quizAnswers:    [quizAnswerSchema],                // user's submitted answers
  quizSubmitted:  { type: Boolean, default: false },

  // ── Step 2: Evidence ──────────────────────────────────────────────────────
  evidenceUrl:    { type: String },                 // portfolio/cert/github URL
  evidenceNote:   { type: String, maxlength: 500 }, // user's description
  evidenceSubmitted: { type: Boolean, default: false },

  // ── Step 3: Peer endorsements (accumulated over time) ────────────────────
  endorsements: [{
    endorserId:   { type: String },                 // user who endorsed
    endorserName: { type: String },
    sessionId:    { type: String },                 // session that prompted it
    createdAt:    { type: Date, default: Date.now },
  }],

  // ── Admin review ──────────────────────────────────────────────────────────
  status:       {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote:    { type: String },                   // feedback to user
  reviewedBy:   { type: String },                   // admin user UUID
  reviewedAt:   { type: Date },

  // Step completion tracking
  stepsCompleted: {
    quiz:        { type: Boolean, default: false },
    evidence:    { type: Boolean, default: false },
    endorsement: { type: Boolean, default: false }, // unlocked after first session
  },
}, { timestamps: true });

skillVerificationSchema.index({ skillId: 1, userId: 1 }, { unique: true });
skillVerificationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SkillVerification', skillVerificationSchema);
