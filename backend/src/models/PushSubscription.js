const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId:       { type: String, required: true, index: true },
  subscription: { type: mongoose.Schema.Types.Mixed, required: true },
  endpoint:     { type: String, required: true },
}, { timestamps: true });

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
