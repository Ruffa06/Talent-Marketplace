export default function TypeBadge({ type }) {
  const map = {
    gig: { label: 'Gig', bg: '#FFF0F0', color: '#C00000' },
    vacancy: { label: 'Vacancy', bg: '#EFF6FF', color: '#1D4ED8' },
    immersion: { label: 'Developmental Job Immersion', bg: '#F0FDF4', color: '#166534' },
  }
  const { label, bg, color } = map[type] || { label: type, bg: '#F4F4F6', color: '#2A2A33' }
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  )
}
