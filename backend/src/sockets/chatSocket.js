const { verifyToken } = require('../config/jwt');
const Message = require('../models/Message');
const notify  = require('../services/notificationService');
const { otherUserInRoom } = require('../utils/roomId');

module.exports = (io) => {

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
    socket.join(`user:${socket.userId}`);
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on('join_room', ({ roomId }) => {
      if (!roomId?.includes(socket.userId)) return;
      socket.join(roomId);
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('typing', ({ roomId }) => {
      if (!roomId?.includes(socket.userId)) return;
      socket.to(roomId).emit('user_typing', { userId: socket.userId });
    });

    socket.on('stop_typing', ({ roomId }) => {
      if (!roomId?.includes(socket.userId)) return;
      socket.to(roomId).emit('user_stop_typing', { userId: socket.userId });
    });

    socket.on('send_message', async ({ roomId, content, senderName }) => {
      if (!roomId?.includes(socket.userId) || !content?.trim()) return;

      try {
        const message = await Message.create({
          roomId,
          senderId:   socket.userId,
          senderName,
          content:    content.trim().slice(0, 2000),
        });

        io.to(roomId).emit('receive_message', {
          _id:       message._id,
          roomId,
          senderId:  socket.userId,
          senderName,
          content:   message.content,
          createdAt: message.createdAt,
        });

        const recipientId = otherUserInRoom(roomId, socket.userId);

        if (recipientId) {
          const socketsInRoom   = await io.in(roomId).fetchSockets();
          const recipientInRoom = socketsInRoom.some(s => s.userId === recipientId);

          if (!recipientInRoom) {
            await notify.create({
              userId: recipientId,
              type:   'new_message',
              title:  `New message from ${senderName}`,
              body:   content.trim().length > 80
                ? content.trim().slice(0, 80) + '…'
                : content.trim(),
              link:   `/messages?user=${socket.userId}`,
              meta:   { senderId: socket.userId, roomId },
            });
          }
        }
      } catch (err) {
        console.error('send_message error:', err.message);
        socket.emit('message_error', { message: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
