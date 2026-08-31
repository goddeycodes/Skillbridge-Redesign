const Material = require('../models/Material');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const cloudinaryService = require('../services/cloudinaryService');

const MAX_BYTES = 200 * 1024 * 1024; // 200MB — generous for a short recorded lesson, keeps abuse bounded

const inferFileType = (mimetype = '') => {
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  if (
    mimetype === 'application/pdf' ||
    mimetype.includes('document') ||
    mimetype.includes('presentation') ||
    mimetype.includes('sheet')
  ) return 'document';
  return 'other';
};

/**
 * Who's allowed to upload/manage materials on a given parent.
 * Skill: only the skill's owner (teacher curating their listing).
 * Session: either participant (teacher or learner) — either side might
 * want to share a recording or follow-up notes.
 */
const authoriseParent = async (parentType, parentId, userId) => {
  if (parentType === 'skill') {
    const skill = await Skill.findById(parentId);
    if (!skill) return { ok: false, status: 404, message: 'Skill not found.' };
    if (skill.userId !== userId) return { ok: false, status: 403, message: 'Only the skill owner can manage materials here.' };
    return { ok: true };
  }
  if (parentType === 'session') {
    const session = await Session.findByPk(parentId);
    if (!session) return { ok: false, status: 404, message: 'Session not found.' };
    if (session.teacherId !== userId && session.learnerId !== userId)
      return { ok: false, status: 403, message: 'Not authorised for this session.' };
    return { ok: true };
  }
  return { ok: false, status: 400, message: 'parentType must be "skill" or "session".' };
};

// POST /api/materials  (multipart/form-data: file, parentType, parentId, title?)
exports.upload = async (req, res) => {
  try {
    if (!cloudinaryService.isConfigured())
      return res.status(503).json({ success: false, message: 'File uploads are not configured on the server.' });

    const { parentType, parentId, title } = req.body;
    if (!parentType || !parentId)
      return res.status(400).json({ success: false, message: 'parentType and parentId are required.' });
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    if (req.file.size > MAX_BYTES)
      return res.status(400).json({ success: false, message: 'File is too large (200MB max).' });

    const auth = await authoriseParent(parentType, parentId, req.user.id);
    if (!auth.ok) return res.status(auth.status).json({ success: false, message: auth.message });

    const fileType = inferFileType(req.file.mimetype);
    const resourceType = fileType === 'video' ? 'video' : fileType === 'image' ? 'image' : 'raw';

    const result = await cloudinaryService.uploadBuffer(req.file.buffer, {
      folder: `skillbridge/${parentType}/${parentId}`,
      resourceType,
    });

    const material = await Material.create({
      parentType, parentId,
      uploaderId:   req.user.id,
      uploaderName: req.user.name,
      title:        title?.trim() || req.file.originalname,
      fileType,
      url:          result.secure_url,
      cloudinaryId: result.public_id,
      resourceType,
      bytes:        req.file.size,
    });

    res.status(201).json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/materials?parentType=skill|session&parentId=...
exports.list = async (req, res) => {
  try {
    const { parentType, parentId } = req.query;
    if (!parentType || !parentId)
      return res.status(400).json({ success: false, message: 'parentType and parentId are required.' });

    // Session materials are private to the two participants. Skill materials
    // are visible to any authenticated user browsing that skill — the whole
    // point is helping a learner decide whether to book.
    if (parentType === 'session') {
      const session = await Session.findByPk(parentId);
      if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
      if (session.teacherId !== req.user.id && session.learnerId !== req.user.id)
        return res.status(403).json({ success: false, message: 'Not authorised for this session.' });
    }

    const materials = await Material.find({ parentType, parentId }).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/materials/:id
exports.remove = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });
    if (material.uploaderId !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorised.' });

    await cloudinaryService.destroy(material.cloudinaryId, material.resourceType);
    await material.deleteOne();

    res.json({ success: true, message: 'Material removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};