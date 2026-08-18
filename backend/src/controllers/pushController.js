const pushService = require('../services/pushService');

// GET /api/push/vapid-public-key
exports.getPublicKey = (req, res) => {
  const publicKey = pushService.getPublicKey();
  if (!publicKey) {
    return res.status(503).json({ success: false, message: 'Push notifications are not configured.' });
  }
  res.json({ success: true, publicKey });
};

// POST /api/push/subscribe
exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ success: false, message: 'Invalid subscription.' });
    }

    await pushService.saveSubscription(req.user.id, subscription);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/push/unsubscribe
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: 'Endpoint is required.' });
    }

    await pushService.removeSubscription(req.user.id, endpoint);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
