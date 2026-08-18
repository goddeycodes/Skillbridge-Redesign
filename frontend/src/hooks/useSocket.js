'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function getOrCreateSocket() {
  if (typeof window === 'undefined') return null;

  // Return existing socket if already connected
  if (window.__sbSocket) return window.__sbSocket;

  const token = localStorage.getItem('sb_token');
  if (!token) return null;

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  const socket = io(SOCKET_URL, {
    auth:                { token },
    transports:          ['polling', 'websocket'],
    reconnection:        true,
    reconnectionAttempts: 10,
    reconnectionDelay:   1000,
    timeout:             20000,
  });

  socket.on('connect', () =>
    console.log('Socket connected:', socket.id)
  );
  socket.on('disconnect', (reason) =>
    console.log('Socket disconnected:', reason)
  );
  socket.on('connect_error', (err) =>
    console.warn('Socket connect error:', err.message)
  );

  // Expose on window so useNotifications can access it directly
  window.__sbSocket = socket;

  return socket;
}

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = getOrCreateSocket();
    if (!s) return;

    if (s.connected) {
      setSocket(s);
    } else {
      const onConnect = () => setSocket(s);
      s.on('connect', onConnect);
      return () => s.off('connect', onConnect);
    }
  }, []);

  return socket;
}

export function disconnectSocket() {
  if (window.__sbSocket) {
    window.__sbSocket.disconnect();
    window.__sbSocket = null;
  }
}