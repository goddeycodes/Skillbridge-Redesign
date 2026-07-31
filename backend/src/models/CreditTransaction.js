const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CreditTransaction = sequelize.define('CreditTransaction', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:    { type: DataTypes.UUID, allowNull: false },
  amount:    { type: DataTypes.INTEGER, allowNull: false },
  type:      { type: DataTypes.ENUM('earned','spent','bonus','refund'), allowNull: false },
  reason:    { type: DataTypes.STRING },
  sessionId: { type: DataTypes.UUID },
}, { timestamps: true });

module.exports = CreditTransaction;
