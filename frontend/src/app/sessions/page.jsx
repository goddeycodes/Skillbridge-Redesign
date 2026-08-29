'use client';
import { BookOpen } from 'lucide-react';
import SessionsView from '../../components/sessions/SessionsView';

export default function MyLearningPage() {
  return (
    <SessionsView
      role="learner"
      title="My Learning"
      subtitle="Sessions where you're the learner — track requests, upcoming lessons, and history."
      icon={BookOpen}
    />
  );
}
