'use client';
// components/sessions/VideoCallModal.jsx
//
// Full-screen in-app video call. Fetches a short-lived join token on open
// (never stored — minted fresh each time), then iframes Daily's prebuilt
// call UI. This is what makes the session feel hosted "on the platform"
// instead of redirecting out to a third-party Zoom/Meet link.

import { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { sessionsAPI } from '../../services/api';

export default function VideoCallModal({ open, onClose, session }) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (!open || !session?.id) return;
    setLoading(true);
    setError('');
    setJoinUrl('');

    sessionsAPI.getVideoAccess(session.id)
      .then(res => {
        const { roomUrl, token } = res.data;
        setJoinUrl(`${roomUrl}?t=${token}`);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Could not connect to the video room.');
      })
      .finally(() => setLoading(false));
  }, [open, session?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{session?.title || 'Session'}</p>
          <p className="text-xs text-slate-400 truncate">with {session?.otherUser?.name}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Leave call"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white gap-2">
            <Loader2 size={22} className="animate-spin" /> Connecting…
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 px-6 text-center">
            <AlertCircle size={28} className="text-accent-400" />
            <p className="font-medium">{error}</p>
            {session?.meetingLink && (
              <a
                href={session.meetingLink}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 text-sm font-semibold text-brand-300 hover:text-brand-200 underline"
              >
                Use the external meeting link instead
              </a>
            )}
          </div>
        )}

        {!loading && !error && joinUrl && (
          <iframe
            src={joinUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            title="Video session"
          />
        )}
      </div>
    </div>
  );
}