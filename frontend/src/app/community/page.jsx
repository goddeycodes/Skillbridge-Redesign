'use client';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityAPI } from '../../services/api';
import PostCard from '../../components/community/PostCard';
import NewPostModal from '../../components/community/NewPostModal';
import PostDetailModal from '../../components/community/PostDetailModal';

const CATEGORIES = [
  'All', 'Technology', 'Design', 'Business', 'Language', 'Music',
  'Arts & Crafts', 'Cooking', 'Fitness', 'Academic', 'General',
];

export default function CommunityPage() {
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [category,    setCategory]    = useState('All');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [activePost,  setActivePost]  = useState(null);

  const loadPosts = useCallback(async (cat, q, pg) => {
    setLoading(true);
    try {
      const params = { page: pg };
      if (cat && cat !== 'All') params.category = cat;
      if (q) params.q = q;

      const res = await communityAPI.getPosts(params);
      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
    } catch {
      toast.error('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(category, search, page); }, [category, page, loadPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPosts(category, search, 1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    setSearch('');
  };

  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleDeleted = (id) => {
    setPosts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen size={22} className="text-brand-500" /> Learning Community
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Ask questions. Share knowledge. Help someone learn.
          </p>
        </div>
        <button
          onClick={() => setNewPostOpen(true)}
          className="sb-btn-primary flex items-center gap-2"
        >
          <Plus size={15} /> New post
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions…"
            className="sb-input pl-9"
          />
        </div>
        <button type="submit" className="sb-btn-outline flex items-center gap-1.5">
          <RefreshCw size={13} /> Search
        </button>
      </form>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              category === cat
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="sb-card p-12 flex flex-col items-center text-center text-slate-400">
          <BookOpen size={32} className="mb-3 text-slate-200" />
          <p className="font-medium text-slate-600">No posts yet</p>
          <p className="text-sm mt-1">Be the first to start a discussion in this category.</p>
          <button
            onClick={() => setNewPostOpen(true)}
            className="mt-4 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            Start a discussion
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onClick={p => setActivePost(p._id)}
                onDeleted={handleDeleted}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="sb-btn-outline disabled:opacity-40"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="sb-btn-outline disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <NewPostModal
        open={newPostOpen}
        onClose={() => setNewPostOpen(false)}
        onCreated={handleNewPost}
      />

      <PostDetailModal
        open={!!activePost}
        onClose={() => setActivePost(null)}
        postId={activePost}
      />
    </div>
  );
}
