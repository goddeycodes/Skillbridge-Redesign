const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  category:    { type: String, required: true },
  tags:        [{ type: String }],
  type:        { type: String, enum: ['teach', 'learn'], required: true },
  proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  format:      { type: String, enum: ['one-on-one', 'group', 'both'], default: 'one-on-one' },
  language:    { type: String, default: 'English' },
  isActive:    { type: Boolean, default: true },
  isVerified:  { type: Boolean, default: false },
}, { timestamps: true });

skillSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
