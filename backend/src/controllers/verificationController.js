const SkillVerification = require('../models/SkillVerification');
const Skill = require('../models/Skill');
const User  = require('../models/User');
const notify = require('../services/notificationService');

// ── Quiz generation via Claude API ───────────────────────────────────────────
const generateQuizQuestions = async (skillName, category, proficiency) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Generate exactly 5 short-answer quiz questions to verify that someone truly has ${proficiency}-level knowledge of "${skillName}" (category: ${category}).

Requirements:
- Questions should be practical and specific, not generic
- Mix conceptual understanding with real-world application
- Difficulty should match ${proficiency} level
- Each question on its own line, numbered 1-5
- No preamble, no explanations — just the 5 questions

Format:
1. [question]
2. [question]
3. [question]
4. [question]
5. [question]`,
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse numbered lines into array
    const questions = text
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 5);

    if (questions.length < 3) throw new Error('Insufficient questions generated');
    return questions;
  } catch (err) {
    console.error('Quiz generation failed:', err.message);
    // Fallback generic questions if API fails
    return [
      `Describe your experience with ${skillName} and how long you have been practising it.`,
      `What are the most important concepts or techniques in ${skillName} that a ${proficiency} should know?`,
      `Give a real example of a project or task you completed using ${skillName}.`,
      `What common mistakes do beginners make in ${skillName}, and how do you avoid them?`,
      `How do you stay current with developments or best practices in ${skillName}?`,
    ];
  }
};

// POST /api/verification/start/:skillId
// Start or resume a verification — generates quiz questions
exports.startVerification = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.skillId);
    if (!skill)                       return res.status(404).json({ success: false, message: 'Skill not found.' });
    if (skill.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not your skill.' });
    if (skill.type !== 'teach')       return res.status(400).json({ success: false, message: 'Only teaching skills need verification.' });
    if (skill.isVerified)             return res.status(400).json({ success: false, message: 'Skill is already verified.' });

    // Check for existing verification
    let verification = await SkillVerification.findOne({ skillId: req.params.skillId, userId: req.user.id });

    if (verification && verification.status === 'approved')
      return res.status(400).json({ success: false, message: 'Already approved.' });

    if (verification && verification.status === 'under_review')
      return res.json({ success: true, verification, message: 'Your submission is under review.' });

    // Generate quiz if starting fresh or was rejected
    if (!verification || verification.status === 'rejected') {
      const questions = await generateQuizQuestions(skill.name, skill.category, skill.proficiency || 'intermediate');

      if (verification) {
        // Reset rejected verification
        verification.quizQuestions   = questions;
        verification.quizAnswers     = [];
        verification.quizSubmitted   = false;
        verification.evidenceUrl     = undefined;
        verification.evidenceNote    = undefined;
        verification.evidenceSubmitted = false;
        verification.status          = 'pending';
        verification.adminNote       = undefined;
        verification.stepsCompleted  = { quiz: false, evidence: false, endorsement: verification.stepsCompleted.endorsement };
        await verification.save();
      } else {
        verification = await SkillVerification.create({
          skillId:       req.params.skillId,
          userId:        req.user.id,
          skillName:     skill.name,
          userName:      req.user.name,
          userAvatar:    req.user.avatar,
          quizQuestions: questions,
        });
      }
    }

    res.json({ success: true, verification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/verification/:id/quiz
// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ question, answer }]
    const verification = await SkillVerification.findById(req.params.id);

    if (!verification)                        return res.status(404).json({ success: false, message: 'Verification not found.' });
    if (verification.userId !== req.user.id)  return res.status(403).json({ success: false, message: 'Not authorised.' });
    if (verification.stepsCompleted.quiz)     return res.status(400).json({ success: false, message: 'Quiz already submitted.' });
    if (!answers?.length)                     return res.status(400).json({ success: false, message: 'Answers are required.' });

    verification.quizAnswers    = answers;
    verification.quizSubmitted  = true;
    verification.stepsCompleted.quiz = true;

    if (verification.stepsCompleted.evidence) {
      verification.status = 'under_review';
    }

    await verification.save();

    res.json({ success: true, verification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/verification/:id/evidence
// Submit evidence link
exports.submitEvidence = async (req, res) => {
  try {
    const { evidenceUrl, evidenceNote } = req.body;
    const verification = await SkillVerification.findById(req.params.id);

    if (!verification)                        return res.status(404).json({ success: false, message: 'Verification not found.' });
    if (verification.userId !== req.user.id)  return res.status(403).json({ success: false, message: 'Not authorised.' });
    if (!evidenceUrl)                         return res.status(400).json({ success: false, message: 'Evidence URL is required.' });

    verification.evidenceUrl       = evidenceUrl;
    verification.evidenceNote      = evidenceNote;
    verification.evidenceSubmitted = true;
    verification.stepsCompleted.evidence = true;

    // If quiz is also done, move to under_review
    if (verification.stepsCompleted.quiz) {
      verification.status = 'under_review';
    }

    await verification.save();
    res.json({ success: true, verification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/verification/skill/:skillId
// Get verification status for a skill
exports.getVerification = async (req, res) => {
  try {
    const verification = await SkillVerification.findOne({
      skillId: req.params.skillId,
      userId:  req.user.id,
    });
    res.json({ success: true, verification: verification || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/verification/:id/endorse  (called after session completion)
exports.endorseSkill = async (req, res) => {
  try {
    const { skillId, sessionId } = req.body;
    const verification = await SkillVerification.findOne({ skillId, userId: req.body.teacherId });

    if (!verification) return res.status(404).json({ success: false, message: 'No verification found for this skill.' });

    // Prevent duplicate endorsements from same session
    const alreadyEndorsed = verification.endorsements.some(e => e.sessionId === sessionId);
    if (alreadyEndorsed)  return res.status(400).json({ success: false, message: 'Already endorsed for this session.' });

    verification.endorsements.push({
      endorserId:   req.user.id,
      endorserName: req.user.name,
      sessionId,
    });
    verification.stepsCompleted.endorsement = verification.endorsements.length >= 1;
    await verification.save();

    await notify.skillEndorsed(verification.userId, req.user.name, verification.skillName);

    res.json({ success: true, endorsements: verification.endorsements.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin endpoints ───────────────────────────────────────────────────────────

// GET /api/verification/admin/pending
exports.adminGetPending = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });

    const verifications = await SkillVerification.find({ status: 'under_review' })
      .sort({ createdAt: 1 })
      .limit(50);

    res.json({ success: true, verifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/verification/admin/:id/review
exports.adminReview = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });

    const { decision, adminNote } = req.body; // decision: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision))
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected.' });

    const verification = await SkillVerification.findById(req.params.id);
    if (!verification) return res.status(404).json({ success: false, message: 'Verification not found.' });

    verification.status     = decision;
    verification.adminNote  = adminNote;
    verification.reviewedBy = req.user.id;
    verification.reviewedAt = new Date();
    await verification.save();

    // If approved — mark the skill as verified in MongoDB
    if (decision === 'approved') {
      await Skill.findByIdAndUpdate(verification.skillId, { isVerified: true });
      await notify.verificationApproved(verification.userId, verification.skillName);
    } else {
      await notify.verificationRejected(verification.userId, verification.skillName, adminNote);
    }

    res.json({ success: true, verification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/verification/admin/all  — all verifications with filters
exports.adminGetAll = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ success: false, message: 'Admin only.' });

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const verifications = await SkillVerification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, verifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
