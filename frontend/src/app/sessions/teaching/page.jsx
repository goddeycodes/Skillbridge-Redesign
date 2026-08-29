'use client';
import { CalendarDays } from 'lucide-react';
import SessionsView from '../../../components/sessions/SessionsView';

export default function TeachingSessionsPage() {
  return (
    <SessionsView
      role="teacher"
      title="Teaching Sessions"
      subtitle="Sessions where you're the teacher — respond to requests and manage your schedule."
      icon={CalendarDays}
    />
  );
}
