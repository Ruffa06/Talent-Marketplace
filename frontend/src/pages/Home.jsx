import { Link } from 'react-router-dom'
import TypeBadge from '../components/TypeBadge'

const typeInfo = [
  { type: 'gig', icon: '⚡', title: 'Gig', desc: 'Short-term project, 1 day – 3 months. Work on real initiatives without changing roles. Examples: host the company anniversary celebration, or build the data-visualization dashboard for an ExCo priority project.' },
  { type: 'vacancy', icon: '🏢', title: 'Vacancy', desc: 'Open internal role, permanent. A formal internal move — like a People Analytics Specialist opening up in HR.' },
  { type: 'immersion', icon: '🌱', title: 'Developmental Job Immersion', desc: 'Developmental exposure, 1 week – 1 month. Shadow, learn, and contribute without changing roles. Example: spend a month inside Marketing to learn campaign planning and brand strategy.' },
]

const testimonials = [
  { quote: "I moved from Operations to Digital Products via a 2-month data gig. I didn't think I'd be considered — the match score convinced me to try.", name: 'Ana R.', dept: 'Digital Products' },
  { quote: "Posted a gig for a risk reporting dashboard. Got 4 strong internal matches in 2 days. Saved us an external hire.", name: 'Mark T.', dept: 'Risk' },
  { quote: "The immersion in Marketing changed how I think about our customers. I came back to Finance with a completely different lens.", name: 'Cris V.', dept: 'Finance' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: '#C00000' }} />
        <div className="px-12 py-16 max-w-3xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#C00000' }}>
            Home Credit Internal Opportunity Hub
          </p>
          <h1 className="text-4xl font-bold text-white mb-5 leading-tight">
            Find your next move — without leaving.
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Talent Marketplace lets you find gigs, projects, and roles across the company that match your skills and where you want to grow — and get matched to them automatically. Instead of waiting for a promotion, you can explore real opportunities happening inside Home Credit right now.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { icon: '🔍', title: 'Discover', sub: 'Internal moves you didn\'t know existed' },
              { icon: '🌱', title: 'Grow', sub: 'Without leaving Home Credit' },
              { icon: '🤝', title: 'Get matched', sub: 'AI suggests your best-fit opportunities' },
            ].map(b => (
              <div key={b.title} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3 min-w-[180px]">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{b.title}</p>
                  <p className="text-white/70 text-xs">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/profile" className="inline-block text-white font-semibold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: '#C00000' }}>
            Build my profile →
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Three ways to grow */}
        <h2 className="text-2xl font-bold text-brand-ink mb-2">Three ways to grow here</h2>
        <p className="text-brand-muted mb-6">Choose your path — or explore all three.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {typeInfo.map(t => (
            <div key={t.type} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="mb-2"><TypeBadge type={t.type} /></div>
              <h3 className="font-bold text-brand-ink text-base mb-2">{t.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <h2 className="text-2xl font-bold text-brand-ink mb-6">Stories from inside Home Credit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <p className="text-brand-ink text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#C00000' }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{t.name}</p>
                  <p className="text-xs text-brand-muted">{t.dept}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
