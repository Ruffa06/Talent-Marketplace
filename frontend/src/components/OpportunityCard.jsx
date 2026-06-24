import { Link } from 'react-router-dom'
import TypeBadge from './TypeBadge'
import SkillChip from './SkillChip'

export default function OpportunityCard({ opp, matchScore }) {
  const pct = matchScore != null ? Math.round(matchScore) : null
  const barColor = pct >= 75 ? '#1B7A43' : pct >= 50 ? '#D97706' : '#C00000'
  return (
    <Link to={`/opportunities/${opp.id}`} className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <TypeBadge type={opp.type} />
        <span className="text-xs text-brand-muted shrink-0">
          {opp.duration_days ? `${opp.duration_days}d` : 'Permanent'}
        </span>
      </div>
      <h3 className="font-semibold text-brand-ink text-base mb-1 leading-snug">{opp.title}</h3>
      <p className="text-xs text-brand-muted mb-3">{opp.department} · {opp.bandwidth || 'Flexible'}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {(opp.skills_needed || []).slice(0, 4).map(s => <SkillChip key={s} skill={s} />)}
      </div>
      {pct != null && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-brand-muted">Match score</span>
            <span className="font-semibold" style={{ color: barColor }}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
          </div>
        </div>
      )}
    </Link>
  )
}
