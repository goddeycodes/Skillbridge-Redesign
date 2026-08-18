const Notification = require('../models/Notification');

// GET /api/notifications?unreadOnly=true&page=1&limit=20
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (unreadOnly === 'true') where.read = false;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(where).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(where),
      Notification.countDocuments({ userId: req.user.id, read: false }),
    ]);

    res.json({ success: true, notifications, total, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const result = await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (!result.deletedCount)
      return res.status(404).json({ success: false, message: 'Notification not found.' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
