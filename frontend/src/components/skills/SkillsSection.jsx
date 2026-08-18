'use client';
import { useState } from 'react';
import { Plus, GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import SkillCard from './SkillCard';
import SkillFormModal from './SkillFormModal';
import VerificationModal from '../verification/VerificationModal';
import ConfirmModal from '../shared/ConfirmModal';
import { skillsAPI } from '../../services/api';

export default function SkillsSection({ teachSkills, learnSkills, isOwner, onRefresh }) {
  const [formOpen,        setFormOpen]        = useState(false);
  const [editingSkill,    setEditingSkill]    = useState(null);
  const [activeTab,       setActiveTab]       = useState('teach');
  const [formDefaultType, setFormDefaultType] = useState('teach');
  const [verifyOpen,      setVerifyOpen]      = useState(false);
  const [verifyingSkill,  setVerifyingSkill]  = useState(null);
  const [pendingDelete,   setPendingDelete]   = useState(null);
  const [deleting,        setDeleting]        = useState(false);

  const openAdd = (type) => {
    setEditingSkill(null);
    setFormDefaultType(type);
    setActiveTab(type);
    setFormOpen(true);
  };

  const openEdit = (skill) => {
    setEditingSkill(skill);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    const skill = [...teachSkills, ...learnSkills].find(s => s._id === id);
    if (skill) setPendingDelete(skill);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await skillsAPI.remove(pendingDelete._id);
      toast.success('Skill removed.');
      onRefresh();
      setPendingDelete(null);
    } catch {
      toast.error('Failed to remove skill.');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { key: 'teach', label: 'Skills I Teach', icon: GraduationCap, count: teachSkills.length, color: 'text-brand-600' },
    { key: 'learn', label: 'Skills I Want',  icon: BookOpen,      count: learnSkills.length, color: 'text-learn-600' },
  ];

  const shown = activeTab === 'teach' ? teachSkills : learnSkills;

  return (
    <div className="sb-card">
      <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-slate-100">
        <div className="flex">
          {tabs.map(({ key, label, icon: Icon, count, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? `${color} border-current`
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <Icon size={15} />
              {label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                activeTab === key ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {isOwner && (
          <button
            onClick={() => openAdd(activeTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mb-1"
          >
            <Plus size={14} /> Add skill
          </button>
        )}
      </div>

      <div className="p-5">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center text-slate-400">
            {activeTab === 'teach'
              ? <GraduationCap size={36} className="mb-3 text-slate-200" />
              : <BookOpen      size={36} className="mb-3 text-slate-200" />}
            <p className="text-sm font-medium text-slate-500">
              {isOwner
                ? `No ${activeTab === 'teach' ? 'teaching' : 'learning'} skills yet`
                : 'No skills listed here yet'}
            </p>
            {isOwner && (
              <button
                onClick={() => openAdd(activeTab)}
                className="mt-3 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
              >
                + Add your first {activeTab === 'teach' ? 'teaching' : 'learning'} skill
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {shown.map(skill => (
              <SkillCard
                key={skill._id}
                skill={skill}
                isOwner={isOwner}
                onEdit={openEdit}
                onDelete={handleDelete}
                onVerify={(s) => { setVerifyingSkill(s); setVerifyOpen(true); }}
              />
            ))}
            {isOwner && shown.length < 10 && (
              <button
                onClick={() => openAdd(activeTab)}
                className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 p-6 text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-all min-h-[140px]"
              >
                <Plus size={20} />
                <span className="text-sm font-medium">Add another</span>
              </button>
            )}
          </div>
        )}
      </div>

      <SkillFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingSkill(null); }}
        onSaved={onRefresh}
        skill={editingSkill}
        defaultType={formDefaultType}
      />

      <VerificationModal
        open={verifyOpen}
        onClose={() => { setVerifyOpen(false); setVerifyingSkill(null); }}
        skill={verifyingSkill}
        onVerified={onRefresh}
      />

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Remove this skill?"
        description={pendingDelete ? `"${pendingDelete.name}" will be removed from your ${pendingDelete.type === 'teach' ? 'teaching' : 'learning'} list. This can't be undone.` : ''}
        confirmLabel="Remove skill"
      />
    </div>
  );
}
