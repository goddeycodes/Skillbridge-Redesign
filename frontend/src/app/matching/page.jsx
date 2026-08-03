'use client';
import { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertCircle, RefreshCw, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { matchAPI } from '../../services/api';
import MatchCard from '../../components/matching/MatchCard';

function SkeletonCard() {
  return (
    <div className="sb-card p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="w-14 h-14 rounded-full bg-slate-100" />
      </div>
      <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
        <div className="h-3 w-40 bg-slate-100 rounded" />
        <div className="h-3 w-6  bg-slate-100 rounded mx-auto" />
        <div className="h-3 w-36 bg-slate-100 rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="h-9 bg-slate-100 rounded-xl" />
    </div>
  );
}

export default function MatchingPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchAPI.getMatches();
      setMatches(res.data.matches || []);
    } catch (err) {
      setError({
        message: err.response?.data?.message || 'Could not load matches. Please try again.',
        code:    err.response?.data?.code,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={22} className="text-brand-500" /> Skill Exchange Matches
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Find people whose learning goals complement what you can teach — and whose skills can help you grow.
          </p>
        </div>
        {!loading && !error && (
          <button
            onClick={loadMatches}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        )}
      </div>

      {loading && (
        <>
          <p className="text-sm text-slate-400 animate-pulse">
            Scanning the community for your best matches…
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        </>
      )}

      {!loading && error && (
        <div className="sb-card p-10 flex flex-col items-center text-center">
          {error.code === 'NO_SKILLS' || error.code === 'INCOMPLETE_SKILLS' ? (
            <>
              <div className="flex gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                  <GraduationCap size={22} className="text-brand-500" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-learn-50 flex items-center justify-center">
                  <BookOpen size={22} className="text-learn-500" />
                </div>
              </div>
              <p className="font-semibold text-slate-700">{error.message}</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Matching needs both sides of the exchange — list something you can teach
                and something you want to learn.
              </p>
              <Link href="/profile"
                className="mt-5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">
                Go to my profile
              </Link>
            </>
          ) : (
            <>
              <AlertCircle size={32} className="text-gold-400 mb-3" />
              <p className="font-semibold text-slate-700">{error.message}</p>
              <button onClick={loadMatches}
                className="mt-4 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                Try again
              </button>
            </>
          )}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="sb-card p-10 flex flex-col items-center text-center text-slate-400">
          <Sparkles size={32} className="mb-3 text-slate-200" />
          <p className="font-medium text-slate-600">No matches yet</p>
          <p className="text-sm mt-1 max-w-sm">
            We couldn't find anyone whose skills complement yours right now.
            Add more skills to widen your reach.
          </p>
          <Link href="/profile"
            className="mt-4 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
            Add more skills
          </Link>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <>
          <p className="text-sm text-slate-400">
            {matches.length} learning partner{matches.length !== 1 ? 'es' : ''} found
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {matches.map(m => <MatchCard key={m.candidateId} match={m} />)}
          </div>
        </>
      )}
    </div>
  );
}