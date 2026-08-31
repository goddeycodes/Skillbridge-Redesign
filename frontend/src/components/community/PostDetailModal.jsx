'use client';
import { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, Send, Loader2, User, Eye, CornerDownRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../shared/Modal';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import { communityAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_COLOR = {
  Technology: 'blue', Design: 'violet', Business: 'green',
  Language: 'amber', Music: 'violet', Cooking: 'amber',
  Fitness: 'green', Academic: 'blue', General: 'slate',
};

// The backend already stores parentReplyId on every reply and returns a flat
// array — this builds the parent -> children tree the UI actually needs.
// Replies whose parent no longer exists (parent was somehow removed) fall
// back to top-level so nothing silently disappears.
function buildReplyTree(replies) {
  const byId = new Map(replies.map(r => [r._id, { ...r, children: [] }]));
  const roots = [];

  for (const reply of byId.values()) {
    if (reply.parentReplyId && byId.has(reply.parentReplyId)) {
      byId.get(reply.parentReplyId).children.push(reply);
    } else {
      roots.push(reply);
    }
  }
  return roots;
}

function ReplyThread({ reply, depth, user, onUpvote, onReplyTo }) {
  const isMaxDepth = depth >= 3; // cap nesting — beyond this, replies flatten to "reply to the thread" instead of visually indenting forever
  return (
    <div className={depth > 0 ? 'mt-3 pl-4 border-l-2 border-slate-100' : ''}>
      <div className="flex gap-3">
        <Avatar user={{ name: reply.userName, avatar: reply.userAvatar }} size={28} />
        <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-xs font-semibold text-slate-700 truncate">{reply.userName}</span>
            <span className="text-xs text-slate-400 shrink-0">
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed break-words">{reply.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onUpvote(reply._id)}
              aria-label={reply.upvotes?.includes(user?.id) ? 'Remove upvote' : 'Upvote reply'}
              className={`flex items-center gap-1 text-xs transition-colors ${
                reply.upvotes?.includes(user?.id)
                  ? 'text-brand-600 font-medium'
                  : 'text-slate-400 hover:text-brand-500'
              }`}
            >
              <ThumbsUp size={11} className={reply.upvotes?.includes(user?.id) ? 'fill-brand-600' : ''} />
              {reply.upvotes?.length ?? 0}
            </button>
            <button
              onClick={() => onReplyTo(isMaxDepth ? null : reply)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-500 transition-colors"
            >
              <CornerDownRight size={11} /> Reply
            </button>
          </div>
        </div>
      </div>

      {reply.children.map(child => (
        <ReplyThread
          key={child._id}
          reply={child}
          depth={isMaxDepth ? depth : depth + 1}
          user={user}
          onUpvote={onUpvote}
          onReplyTo={onReplyTo}
        />
      ))}
    </div>
  );
}

export default function PostDetailModal({ open, onClose, postId }) {
  const { user } = useAuth();
  const [post,      setPost]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [reply,     setReply]     = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { _id, userName } | null = replying to the post itself
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    setLoading(true);
    setReplyingTo(null);
    communityAPI.getPost(postId)
      .then(res => setPost(res.data.post))
      .catch(() => toast.error('Could not load post.'))
      .finally(() => setLoading(false));
  }, [open, postId]);

  const replyTree = useMemo(() => buildReplyTree(post?.replies || []), [post?.replies]);
  const totalReplies = post?.replyCount ?? post?.replies?.length ?? 0;

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
      const res = await communityAPI.addReply(postId, {
        content: reply.trim(),
        parentReplyId: replyingTo?._id || null,
      });
      setPost(prev => ({
        ...prev,
        replies: [...(prev.replies || []), res.data.reply],
        replyCount: (prev.replyCount ?? prev.replies?.length ?? 0) + 1,
      }));
      setReply('');
      setReplyingTo(null);
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
              <Avatar user={{ name: post.userName, avatar: post.userAvatar }} size={24} />
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
              {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
            </h3>

            {totalReplies === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No replies yet — be the first!
              </p>
            )}

            <div>
              {replyTree.map(root => (
                <ReplyThread
                  key={root._id}
                  reply={root}
                  depth={0}
                  user={user}
                  onUpvote={handleUpvoteReply}
                  onReplyTo={setReplyingTo}
                />
              ))}
            </div>
          </div>

          {/* Reply input */}
          <div className="pt-2 border-t border-slate-100">
            {replyingTo && (
              <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-brand-50 rounded-lg text-xs text-brand-700">
                <span>Replying to <strong>{replyingTo.userName}</strong></span>
                <button onClick={() => setReplyingTo(null)} aria-label="Cancel reply" className="p-0.5 hover:bg-brand-100 rounded">
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <Avatar user={user} size={32} />
              <div className="flex-1 flex gap-2">
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
                  placeholder={replyingTo ? `Reply to ${replyingTo.userName}…` : 'Write a reply…'}
                  aria-label="Write a reply"
                  className="sb-input flex-1"
                />
                <button
                  onClick={handleReply}
                  disabled={submitting || !reply.trim()}
                  aria-label="Post reply"
                  className="sb-btn-primary px-3 disabled:opacity-40"
                >
                  {submitting
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Send size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}