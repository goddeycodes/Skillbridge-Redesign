const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sessionId: { type: DataTypes.UUID, allowNull: false },
  raterId:   { type: DataTypes.UUID, allowNull: false },
  ratedId:   { type: DataTypes.UUID, allowNull: false },
  score:     { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  feedback:  { type: DataTypes.TEXT },
}, { timestamps: true });

module.exports = Rating;
