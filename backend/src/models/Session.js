const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  teacherId:     { type: DataTypes.UUID, allowNull: false },
  learnerId:     { type: DataTypes.UUID, allowNull: false },
  skillId:       { type: DataTypes.STRING, allowNull: false },
  title:         { type: DataTypes.STRING, allowNull: false },
  scheduledAt:   { type: DataTypes.DATE, allowNull: false },
  duration:      { type: DataTypes.INTEGER, defaultValue: 60 },
  status:        { type: DataTypes.ENUM('pending','confirmed','completed','cancelled'), defaultValue: 'pending' },
  meetingLink:   { type: DataTypes.STRING }, // optional external fallback (e.g. a teacher's own Zoom link) — the in-app Daily room is the default path, this stays as an override
  videoRoomName: { type: DataTypes.STRING }, // Daily.co room name, set when the session is accepted
  videoRoomUrl:  { type: DataTypes.STRING }, // Daily.co room URL, set when the session is accepted
  creditCost:    { type: DataTypes.INTEGER, defaultValue: 1 },
  notes:         { type: DataTypes.TEXT },
}, { timestamps: true });

module.exports = Session;