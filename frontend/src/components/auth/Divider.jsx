export default function Divider({ label = 'or' }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-white text-xs text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
}
