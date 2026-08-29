const Message = require('../models/Message');
const { roomIdFor, roomIdVariants } = require('../utils/roomId');

// GET /api/messages/:otherUserId
const getHistory = async (req, res) => {
  try {
    const ids = roomIdVariants(req.user.id, req.params.otherUserId);
    const roomId = roomIdFor(req.user.id, req.params.otherUserId);

    const messages = await Message.find({ roomId: { $in: ids } })
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
