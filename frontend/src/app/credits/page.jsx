'use client';
import { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { creditsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  earned:  { label: 'Earned',   color: 'text-success-600', bg: 'bg-success-50', icon: TrendingUp,  sign: '+' },
  spent:   { label: 'Spent',    color: 'text-red-500',     bg: 'bg-red-50',     icon: TrendingDown, sign: '-' },
  bonus:   { label: 'Bonus',    color: 'text-gold-600',    bg: 'bg-gold-50',    icon: Zap,          sign: '+' },
  refund:  { label: 'Refund',   color: 'text-brand-600',   bg: 'bg-brand-50',   icon: RefreshCw,    sign: '+' },
};

function SummaryCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="sb-card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function SkeletonSummaryCard() {
  return (
    <div className="sb-card p-5 flex items-center gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <li className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 bg-slate-100 rounded" />
        <div className="h-2.5 w-28 bg-slate-100 rounded" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-3.5 w-10 bg-slate-100 rounded ml-auto" />
        <div className="h-2.5 w-16 bg-slate-100 rounded ml-auto" />
      </div>
    </li>
  );
}

export default function CreditsPage() {
  const { user } = useAuth();
  const [ledger,   setLedger]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    creditsAPI.getLedger()
      .then(res => setLedger(res.data))
      .catch(() => toast.error('Failed to load credit history.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = ledger?.transactions?.filter(t =>
    filter === 'all' || t.type === filter
  ) ?? [];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Zap size={22} className="text-gold-500" /> Credit Ledger
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          A transparent record of every credit you've earned and spent.
        </p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SkeletonSummaryCard /><SkeletonSummaryCard /><SkeletonSummaryCard />
          </div>
          <div className="sb-card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard
              icon={Zap}        label="Current balance"
              value={ledger?.balance ?? 0}
              color="text-gold-600" bg="bg-gold-50"
            />
            <SummaryCard
              icon={TrendingUp} label="Total earned"
              value={`+${ledger?.summary?.earned ?? 0}`}
              color="text-success-600" bg="bg-success-50"
            />
            <SummaryCard
              icon={TrendingDown} label="Total spent"
              value={`-${ledger?.summary?.spent ?? 0}`}
              color="text-red-500" bg="bg-red-50"
            />
          </div>

          <div className="flex gap-1 border-b border-slate-200">
            {['all', 'earned', 'spent', 'refund', 'bonus'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${
                  filter === f
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="sb-card p-10 text-center text-slate-400">
              <Zap size={28} className="mb-2 mx-auto text-slate-200" />
              <p className="text-sm font-medium text-slate-500">No transactions yet</p>
              <p className="text-xs mt-1">Credits appear here after sessions are booked or completed.</p>
            </div>
          ) : (
            <div className="sb-card overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {filtered.map((t, i) => {
                  const cfg    = TYPE_CONFIG[t.type] || TYPE_CONFIG.earned;
                  const Icon   = cfg.icon;
                  const isPos  = t.amount > 0;

                  return (
                    <li key={t.id || i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon size={15} className={cfg.color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {t.reason || cfg.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {format(new Date(t.createdAt), 'MMM d, yyyy · h:mm a')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isPos ? 'text-success-600' : 'text-red-500'}`}>
                          {isPos ? '+' : ''}{t.amount}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Balance: {t.runningBalance}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}