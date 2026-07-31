'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { skillsAPI } from '../../services/api';
import ProfileHeader from '../../components/profile/ProfileHeader';
import SkillsSection from '../../components/skills/SkillsSection';
import RatingsSection from '../../components/profile/RatingsSection';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [ratings,     setRatings]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  const loadSkills = useCallback(async () => {
    try {
      const res = await skillsAPI.getMySkills();
      setTeachSkills(res.data.teach);
      setLearnSkills(res.data.learn);
    } catch {
      // silently fail — empty arrays stay
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-brand-500" />
    </div>
  );

  return (
    <div className="space-y-5">
      <ProfileHeader
        user={user}
        isOwner={true}
        stats={{ teachCount: teachSkills.length, learnCount: learnSkills.length }}
      />

      <SkillsSection
        teachSkills={teachSkills}
        learnSkills={learnSkills}
        isOwner={true}
        onRefresh={loadSkills}
      />

      {/* Ratings — only shown once user has some */}
      {ratings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 mb-2">Community ratings</h2>
          <RatingsSection ratings={ratings} />
        </div>
      )}
    </div>
  );
}
