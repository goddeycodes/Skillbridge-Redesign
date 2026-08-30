'use client';
// components/shared/MaterialsModal.jsx
//
// One modal, used for both skill materials (teacher's reference material,
// visible to anyone browsing the skill) and session materials (recordings/
// notes shared between the two participants) — same UI, different
// parentType/parentId/access rules enforced server-side.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Loader2, FileText, Video, Image as ImageIcon, File, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { materialsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FILE_ICON = { video: Video, image: ImageIcon, document: FileText, other: File };

function formatBytes(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function MaterialsModal({ open, onClose, parentType, parentId, canUpload = false, title = 'Materials' }) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    if (!parentType || !parentId) return;
    setLoading(true);
    materialsAPI.list(parentType, parentId)
      .then(res => setMaterials(res.data.materials))
      .catch(() => toast.error('Failed to load materials.'))
      .finally(() => setLoading(false));
  }, [parentType, parentId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    try {
      const res = await materialsAPI.upload(parentType, parentId, file);
      setMaterials(prev => [res.data.material, ...prev]);
      toast.success('Uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await materialsAPI.remove(pendingDelete._id);
      setMaterials(prev => prev.filter(m => m._id !== pendingDelete._id));
      toast.success('Removed.');
      setPendingDelete(null);
    } catch {
      toast.error('Failed to remove.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-lg">
        {canUpload && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelected}
              className="hidden"
              accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading…' : 'Upload a file (video, image, or document)'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={22} className="animate-spin text-brand-400" />
          </div>
        ) : materials.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            {canUpload ? 'No materials yet — upload the first one.' : 'No materials shared here yet.'}
          </p>
        ) : (
          <ul className="space-y-2">
            {materials.map(m => {
              const Icon = FILE_ICON[m.fileType] || File;
              return (
                <li key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{m.title}</p>
                    <p className="text-xs text-slate-400">
                      {m.uploaderName} · {formatBytes(m.bytes)}
                    </p>
                  </div>
                  <a
                    href={m.url} target="_blank" rel="noopener noreferrer"
                    aria-label={`Open ${m.title}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white transition-colors"
                  >
                    <Download size={15} />
                  </a>
                  {(m.uploaderId === user?.id) && (
                    <button
                      onClick={() => setPendingDelete(m)}
                      aria-label={`Delete ${m.title}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Remove this file?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently deleted. This can't be undone.` : ''}
        confirmLabel="Remove"
      />
    </>
  );
}