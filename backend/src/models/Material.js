const mongoose = require('mongoose');

// Polymorphic on purpose — Skill lives in MongoDB (_id) and Session lives in
// Postgres (UUID). Rather than embedding materials in two different databases
// with two different implementations, one Material collection references
// either parent by a plain string ID and a discriminator. Reading materials
// for a skill or a session is the same query either way: find({ parentType,
// parentId }) — no cross-database join needed.
const materialSchema = new mongoose.Schema({
  parentType:   { type: String, enum: ['skill', 'session'], required: true },
  parentId:     { type: String, required: true, index: true },
  uploaderId:   { type: String, required: true },
  uploaderName: { type: String, required: true },
  title:        { type: String, trim: true, maxlength: 150 },
  fileType:     { type: String, enum: ['video', 'image', 'document', 'other'], required: true },
  url:          { type: String, required: true },
  cloudinaryId: { type: String, required: true }, // Cloudinary public_id — needed to delete the file later
  resourceType: { type: String, required: true }, // Cloudinary resource_type (video/image/raw) — deletion needs the right one
  bytes:        { type: Number },
}, { timestamps: true });

materialSchema.index({ parentType: 1, parentId: 1, createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);