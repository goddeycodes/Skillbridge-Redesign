const Message = require('../models/Message');

/** Build a deterministic room ID from two user IDs */
const roomIdFor = (a, b) => [a, b].sort().join('-');

// GET /api/messages/:otherUserId
const getHistory = async (req, res) => {
  try {
    const roomId = roomIdFor(req.user.id, req.params.otherUserId);

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({
      success: true,
      roomId,
      messages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  roomIdFor,
  getHistory,
};