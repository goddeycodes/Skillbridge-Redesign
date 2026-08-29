const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:       { type: DataTypes.STRING, allowNull: false },
  email:      {
    type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true },
    set(value) { this.setDataValue('email', value?.trim().toLowerCase()); },
  },
  password:   { type: DataTypes.STRING },
  avatar:     { type: DataTypes.STRING },
  bio:        { type: DataTypes.TEXT },
  timezone:   { type: DataTypes.STRING, defaultValue: 'UTC' },
  credits:    { type: DataTypes.INTEGER, defaultValue: 10 },
  reputation: { type: DataTypes.FLOAT, defaultValue: 0 },
  googleId:   { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isAdmin:    { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => { if (user.password) user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => { if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12); }
  }
});

User.prototype.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = User;
