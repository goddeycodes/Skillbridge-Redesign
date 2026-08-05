// components/shared/Avatar.jsx
//
// Single source of truth for the avatar-with-initials-fallback pattern that
// was previously duplicated (and slightly inconsistent) across AppShell,
// ProfileHeader, MatchCard, and PostCard.

export default function Avatar({
  user,
  size = 36,
  ring = false,
  bg = 'bg-brand-100',
  text = 'text-brand-700',
  className = '',
}) {
  const initials = (user?.name || 'SB')
    .split(' ')
    .map(x => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full flex items-center justify-center ${bg} ${ring ? 'ring-2 ring-white' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name || 'User avatar'} className="h-full w-full object-cover" />
      ) : (
        <span className={`font-bold ${text}`} style={{ fontSize: Math.round(size * 0.38) }}>
          {initials}
        </span>
      )}
    </div>
  );
}