'use client';
import { useState } from 'react';
import { ThumbsUp, MessageCircle, Eye, Trash2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Badge from '../shared/Badge';
import { communityAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_COLOR = {
  Technology: 'blue', Design: 'violet', Business: 'green',
  Language: 'amber', Music: 'violet', Cooking: 'amber',
  Fitness: 'green', Academic: 'blue', General: 'slate',
  'Arts & Crafts': 'amber',
};

export default function PostCard({ post, onClick, onDeleted }) {
  const { user } = useAuth();
  const [upvotes,  setUpvotes]  = useState(post.upvotes?.length ?? 0);
  const [upvoted,  setUpvoted]  = useState(post.upvotes?.includes(user?.id));
  const [deleting, setDeleting] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    try {
      const res = await communityAPI.upvotePost(post._id);
      setUpvotes(res.data.upvotes);
      setUpvoted(res.data.upvoted);
    } catch {
      toast.error('Failed to upvote.');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await communityAPI.deletePost(post._id);
      toast.success('Post deleted.');
      onDeleted?.(post._id);
    } catch {
      toast.error('Failed to delete post.');
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={() => onClick(post)}
      className="sb-card p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
            {post.userAvatar
              ? <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
              : <User size={14} className="text-brand-500" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-600 truncate">{post.userName}</p>
            <p className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge label={post.category} color={CATEGORY_COLOR[post.category] || 'slate'} size="xs" />
          {user?.id === post.userId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 rounded text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title + preview */}
      <div>
        <h3 className="font-semibold text-slate-800 leading-snug line-clamp-2">{post.title}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 4).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1 transition-colors ${
            upvoted ? 'text-brand-600 font-medium' : 'hover:text-brand-500'
          }`}
        >
          <ThumbsUp size={13} className={upvoted ? 'fill-brand-600' : ''} />
          {upvotes}
        </button>
        <span className="flex items-center gap-1">
          <MessageCircle size={13} /> {post.replies?.length ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={13} /> {post.views ?? 0}
        </span>
      </div>
    </div>
  );
}
