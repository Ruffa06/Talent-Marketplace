export default function MatchScoreCircle({ score }) {
  const s = Math.round(score)
  const color = s >= 75 ? '#1B7A43' : s >= 50 ? '#D97706' : '#C00000'
  const r = 28, circ = 2 * Math.PI * r
  const dash = (s / 100) * circ
  return (
    <div className="flex flex-col items-center justify-center w-20 h-20 shrink-0">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" />
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{s}</text>
      </svg>
      <span className="text-xs text-brand-muted mt-0.5">match</span>
    </div>
  )
}
