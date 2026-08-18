'use client';

import { useEffect, useRef } from 'react';
import { pushAPI } from '../services/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(enabled = true) {
  const subscribed = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (subscribed.current) return;

    let cancelled = false;

    const setup = async () => {
      try {
        if (Notification.permission === 'denied') return;

        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted' || cancelled) return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const { data } = await pushAPI.getPublicKey();
        const publicKey = data?.publicKey;
        if (!publicKey || cancelled) return;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        await pushAPI.subscribe(subscription.toJSON());
        subscribed.current = true;
      } catch (err) {
        console.warn('Push notification setup skipped:', err.message);
      }
    };

    setup();

    return () => { cancelled = true; };
  }, [enabled]);
}
