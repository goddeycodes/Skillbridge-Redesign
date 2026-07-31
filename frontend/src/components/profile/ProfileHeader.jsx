'use client';
import { useState } from 'react';
import { User, Edit2, MapPin, Clock, Star, Zap, CheckCircle } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

export default function ProfileHeader({ user, isOwner, stats }) {
  const [editing, setEditing] = useState(false);

  const TIMEZONES = {
    'Africa/Accra': 'GMT+0', 'Africa/Lagos': 'GMT+1', 'Europe/London': 'GMT+1',
    'America/New_York': 'EST', 'America/Los_Angeles': 'PST', 'Asia/Tokyo': 'JST',
    UTC: 'UTC',
  };

  return (
    <>
      <div className="sb-card overflow-hidden">
        {/* Cover banner */}
        <div className="h-28 bg-gradient-to-r from-brand-600 to-violet-600" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-brand-100 flex items-center justify-center overflow-hidden">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <User size={36} className="text-brand-400" />}
              </div>
              {user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <CheckCircle size={18} className="text-brand-500 fill-brand-50" />
                </div>
              )}
            </div>
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Edit2 size={13} /> Edit profile
              </button>
            )}
          </div>

          {/* Name + meta */}
          <h1 className="text-xl font-bold text-slate-800">{user?.name}</h1>
          {user?.bio && <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-xl">{user.bio}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
            {user?.timezone && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {TIMEZONES[user.timezone] || user.timezone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={12} /> Member since {new Date(user?.createdAt).getFullYear()}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-5 mt-5 pt-5 border-t border-slate-100">
            {[
              { icon: Zap,  label: 'Credits',      value: user?.credits ?? 0,                       color: 'text-amber-500' },
              { icon: Star, label: 'Reputation',    value: user?.reputation?.toFixed(1) ?? '0.0',    color: 'text-brand-500' },
              { icon: User, label: 'Skills taught', value: stats?.teachCount ?? 0,                   color: 'text-emerald-500' },
              { icon: User, label: 'Skills to learn',value: stats?.learnCount ?? 0,                  color: 'text-violet-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={15} className={color} />
                <span className="text-sm font-semibold text-slate-700">{value}</span>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </>
  );
}
