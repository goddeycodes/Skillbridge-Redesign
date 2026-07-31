/**
 * Real-time chat via Socket.io
 * Rooms are named by sorted user IDs: `${[uid1,uid2].sort().join('-')}`
 *
 * Auth: client connects with `auth: { token }`; we verify the JWT before
 * allowing any events, so sockets can't impersonate other users.
 */
const { verifyToken } = require('../config/jwt');
const Message = require('../models/Message');

module.exports = (io) => {
  // ── Auth middleware for every connecting socket ──────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required.'));
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    // Join a private chat room — only allowed if the room ID includes this user
    socket.on('join_room', ({ roomId }) => {
      if (!roomId?.includes(socket.userId)) return; // can't join rooms you're not part of
      socket.join(roomId);
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
    });

    // Send + persist a message
    socket.on('send_message', async ({ roomId, content, senderName }) => {
      if (!roomId?.includes(socket.userId) || !content?.trim()) return;

      try {
        const message = await Message.create({
          roomId,
          senderId: socket.userId,
          senderName,
          content: content.trim().slice(0, 2000),
        });

        io.to(roomId).emit('receive_message', {
          _id:        message._id,
          roomId,
          senderId:   socket.userId,
          senderName,
          content:    message.content,
          createdAt:  message.createdAt,
        });
      } catch (err) {
        socket.emit('message_error', { message: 'Failed to send message.' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ roomId }) => {
      if (!roomId?.includes(socket.userId)) return;
      socket.to(roomId).emit('user_typing', { userId: socket.userId });
    });

    socket.on('stop_typing', ({ roomId }) => {
      if (!roomId?.includes(socket.userId)) return;
      socket.to(roomId).emit('user_stop_typing', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
