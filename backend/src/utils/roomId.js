const SEP = '::';

/** Build a deterministic room ID from two user IDs */
const roomIdFor = (a, b) => [a, b].sort().join(SEP);

/** Legacy format used before UUID-safe separator */
const legacyRoomIdFor = (a, b) => [a, b].sort().join('-');

/** Return both current and legacy room IDs for DB lookups */
const roomIdVariants = (a, b) => {
  const current = roomIdFor(a, b);
  const legacy  = legacyRoomIdFor(a, b);
  return current === legacy ? [current] : [current, legacy];
};

/** Extract the other participant from a room ID */
const otherUserInRoom = (roomId, userId) => {
  if (roomId.includes(SEP)) {
    return roomId.split(SEP).find(id => id !== userId) || null;
  }
  // Legacy: two UUIDs joined by '-'
  const idx = roomId.indexOf(userId);
  if (idx === -1) return null;
  const rest = roomId.slice(idx + userId.length + 1);
  if (rest.length === 36) return rest;
  return roomId.slice(0, idx - 1) || null;
};

module.exports = { SEP, roomIdFor, legacyRoomIdFor, roomIdVariants, otherUserInRoom };
