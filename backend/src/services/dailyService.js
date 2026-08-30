// services/dailyService.js
//
// Thin wrapper around the Daily.co REST API. Rooms are created when a
// session is accepted (that's the moment a session becomes real — no point
// provisioning a room for a request that might get declined) and deleted
// when a session is cancelled/completed, so you don't accumulate rooms.
//
// Requires DAILY_API_KEY in .env. Get one at https://dashboard.daily.co
// (Developers tab). No DAILY_DOMAIN needed — the API returns the full room
// URL directly.

const DAILY_API_BASE = 'https://api.daily.co/v1';

const configured = () => !!process.env.DAILY_API_KEY;

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
  'Content-Type': 'application/json',
});

/**
 * Create a room for a confirmed session.
 * Room expires a few hours after the scheduled end time so stale rooms
 * don't linger — Daily auto-deletes expired rooms on their end.
 */
const createRoomForSession = async (session) => {
  if (!configured()) {
    console.warn('dailyService: DAILY_API_KEY not set — skipping video room creation.');
    return null;
  }

  const scheduledEnd = new Date(session.scheduledAt).getTime() + (session.duration || 60) * 60 * 1000;
  const expiryBufferMs = 3 * 60 * 60 * 1000; // keep the room alive 3h past the session for overruns
  const exp = Math.floor((scheduledEnd + expiryBufferMs) / 1000); // Daily wants unix seconds

  const roomName = `sb-session-${session.id}`;

  try {
    const res = await fetch(`${DAILY_API_BASE}/rooms`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: roomName,
        privacy: 'private', // requires a meeting token to join — we mint one per-user below
        properties: {
          exp,
          enable_chat: true,
          enable_screenshare: true,
          max_participants: 4, // headroom above the 1-on-1 default without inviting a crowd
          eject_at_room_exp: true,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Daily room creation failed (${res.status}): ${body}`);
    }

    const room = await res.json();
    return { roomName: room.name, roomUrl: room.url };
  } catch (err) {
    console.error('dailyService.createRoomForSession failed:', err.message);
    return null; // caller decides whether this is fatal — see sessionController
  }
};

/**
 * Mint a short-lived meeting token for a specific user to join a private
 * room. Called on-demand when someone actually clicks "Join," not at room
 * creation time, so the token's short expiry doesn't matter.
 */
const createMeetingToken = async (roomName, userName) => {
  if (!configured()) return null;

  try {
    const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, // 4h — generous enough to cover a long overrunning session
        },
      }),
    });
    if (!res.ok) throw new Error(`Token creation failed (${res.status})`);
    const data = await res.json();
    return data.token;
  } catch (err) {
    console.error('dailyService.createMeetingToken failed:', err.message);
    return null;
  }
};

/** Best-effort cleanup — never throw, a failed delete shouldn't block a cancel/complete action. */
const deleteRoom = async (roomName) => {
  if (!configured() || !roomName) return;
  try {
    await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  } catch (err) {
    console.warn('dailyService.deleteRoom failed (non-fatal):', err.message);
  }
};

module.exports = { configured, createRoomForSession, createMeetingToken, deleteRoom };