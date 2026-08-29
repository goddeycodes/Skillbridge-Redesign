const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

let configured = false;

const init = () => {
  const publicKey  = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject    = process.env.VAPID_SUBJECT || 'mailto:support@skillbridge.app';

  if (!publicKey || !privateKey) {
    console.warn('Web push disabled — set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
};

const getPublicKey = () => process.env.VAPID_PUBLIC_KEY || null;

const saveSubscription = async (userId, subscription) => {
  await PushSubscription.findOneAndUpdate(
    { userId, endpoint: subscription.endpoint },
    { userId, subscription },
    { upsert: true, new: true }
  );
};

const removeSubscription = async (userId, endpoint) => {
  await PushSubscription.deleteOne({ userId, endpoint });
};

const sendToUser = async (userId, { title, body, link, tag }) => {
  if (!configured) return;

  const subs = await PushSubscription.find({ userId });
  if (!subs.length) return;

  const payload = JSON.stringify({ title, body, link, tag });

  await Promise.allSettled(
    subs.map(async (doc) => {
      try {
        await webpush.sendNotification(doc.subscription, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: doc._id });
        }
      }
    })
  );
};

module.exports = { init, getPublicKey, saveSubscription, removeSubscription, sendToUser };
