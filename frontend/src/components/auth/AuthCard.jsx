import Logo from '../shared/Logo';

export default function AuthCard({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center">
            <Logo />
          </div>
        </div>

        <div className="sb-card p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-slate-500 mt-5">{footer}</p>
        )}
      </div>
    </div>
  );
}