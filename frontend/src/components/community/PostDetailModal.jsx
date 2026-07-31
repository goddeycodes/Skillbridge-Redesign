'use client';
import { useState, useEffect } from 'react';
import { ThumbsUp, Send, Loader2, User, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../shared/Modal';
import Badge from '../shared/Badge';
import { communityAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_COLOR = {
  Technology: 'blue', Design: 'violet', Business: 'green',
  Language: 'amber', Music: 'violet', Cooking: 'amber',
  Fitness: 'green', Academic: 'blue', General: 'slate',
};

function Avatar({ src, name, size = 8 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-brand-100 flex items-center justify-center overflow-hidden shrink-0`}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <User size={size * 1.8} className="text-brand-500" />}
    </div>
  );
}

export default function PostDetailModal({ open, onClose, postId }) {
  const { user } = useAuth();
  const [post,      setPost]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [reply,     setReply]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    setLoading(true);
    communityAPI.getPost(postId)
      .then(res => setPost(res.data.post))
      .catch(() => toast.error('Could not load post.'))
      .finally(() => setLoading(false));
  }, [open, postId]);

  const handleUpvotePost = async () => {
    try {
      const res = await communityAPI.upvotePost(postId);
      setPost(prev => ({
        ...prev,
        upvotes: res.data.upvoted
          ? [...(prev.upvotes || []), user.id]
          : (prev.upvotes || []).filter(id => id !== user.id),
      }));
    } catch { toast.error('Failed to upvote.'); }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const res = await communityAPI.addReply(postId, { content: reply.trim() });
      setPost(prev => ({ ...prev, replies: [...(prev.replies || []), res.data.reply] }));
      setReply('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvoteReply = async (replyId) => {
    try {
      const res = await communityAPI.upvoteReply(postId, replyId);
      setPost(prev => ({
        ...prev,
        replies: prev.replies.map(r =>
          r._id === replyId
            ? { ...r, upvotes: res.data.upvoted
                ? [...(r.upvotes || []), user.id]
                : (r.upvotes || []).filter(id => id !== user.id) }
            : r
        ),
      }));
    } catch { toast.error('Failed to upvote reply.'); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Discussion" maxWidth="max-w-2xl">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : !post ? (
        <p className="text-center text-slate-400 py-8">Post not found.</p>
      ) : (
        <div className="space-y-6">
          {/* Post header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge label={post.category} color={CATEGORY_COLOR[post.category] || 'slate'} />
              {post.tags?.map(t => (
                <span key={t} className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  #{t}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-snug">{post.title}</h2>

            <div className="flex items-center gap-3 mt-2">
              <Avatar src={post.userAvatar} name={post.userName} size={6} />
              <span className="text-sm font-medium text-slate-600">{post.userName}</span>
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                <Eye size={12} /> {post.views}
              </span>
            </div>
          </div>

          {/* Post content */}
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm border-b border-slate-100 pb-4">
            {post.content}
          </p>

          {/* Upvote post */}
          <button
            onClick={handleUpvotePost}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              post.upvotes?.includes(user?.id)
                ? 'bg-brand-50 text-brand-600 border border-brand-100'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            <ThumbsUp size={14} className={post.upvotes?.includes(user?.id) ? 'fill-brand-600' : ''} />
            {post.upvotes?.length ?? 0} upvote{post.upvotes?.length !== 1 ? 's' : ''}
          </button>

          {/* Replies */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {post.replies?.length ?? 0} {post.replies?.length === 1 ? 'reply' : 'replies'}
            </h3>

            {post.replies?.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No replies yet — be the first!
              </p>
            )}

            <div className="space-y-3">
              {post.replies?.map(r => (
                <div key={r._id} className="flex gap-3">
                  <Avatar src={r.userAvatar} name={r.userName} size={7} />
                  <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{r.userName}</span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{r.content}</p>
                    <button
                      onClick={() => handleUpvoteReply(r._id)}
                      className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                        r.upvotes?.includes(user?.id)
                          ? 'text-brand-600 font-medium'
                          : 'text-slate-400 hover:text-brand-500'
                      }`}
                    >
                      <ThumbsUp size={11} className={r.upvotes?.includes(user?.id) ? 'fill-brand-600' : ''} />
                      {r.upvotes?.length ?? 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply input */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Avatar src={user?.avatar} name={user?.name} size={8} />
            <div className="flex-1 flex gap-2">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
                placeholder="Write a reply…"
                className="sb-input flex-1"
              />
              <button
                onClick={handleReply}
                disabled={submitting || !reply.trim()}
                className="sb-btn-primary px-3 disabled:opacity-40"
              >
                {submitting
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
