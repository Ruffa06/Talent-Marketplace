import { useState } from 'react'

function Section({ title, items }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-brand-ink mb-4">{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} />)}
      </div>
    </div>
  )
}

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
        <span className="font-medium text-brand-ink text-sm">{q}</span>
        <span className="text-brand-muted text-lg shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-brand-muted leading-relaxed border-t border-gray-100 pt-3">{a}</div>}
    </div>
  )
}

const FOR_EMPLOYEES = [
  { q: 'Will joining a gig or immersion affect my KPIs or salary?', a: 'No. Participation is ad-hoc and voluntary; it doesn\'t change your role, reporting line, KPIs, or salary.' },
  { q: 'How does the time commitment work?', a: 'Gigs are usually light/part-time by agreement. A Developmental Job Immersion requires your manager\'s approval first; you, your manager, and the host team agree in advance on time spent and how your current workload is handled.' },
  { q: 'Who is eligible?', a: 'Most employees in good standing. Employees on a PIP, or with a most-recent performance rating of 2 or lower, are not eligible during the pilot.' },
  { q: 'What are the perks?', a: 'Learn new skills on real work; flexibility & variety; start a career pivot; visibility with new teams & leaders; build your internal network. A cross-functional move or high-visibility ExCo project is a rare, low-risk opportunity.' },
  { q: 'Will my manager see that I\'m exploring?', a: 'You control visibility. Gigs can be explored discreetly; immersions require manager approval by design.' },
  { q: 'What happens after I express interest?', a: 'The owner is notified, reviews everyone interested, and may invite/accept/decline. You\'re notified either way; immersions route through manager approval.' },
]

const FOR_MANAGERS = [
  { q: 'What\'s the difference between a gig, vacancy, and Developmental Job Immersion?', a: 'A Gig is a short-term project (1 day–3 months), often part-time. A Vacancy is an open internal role, permanent. A Developmental Job Immersion is developmental exposure (1 week–1 month) where someone shadows, learns, and contributes without changing roles.' },
  { q: 'How long does it take to post an opportunity?', a: 'Under 5 minutes. It then goes to the HR admin review queue before going live.' },
  { q: 'What happens after I submit?', a: 'It enters the HR admin review queue. Once approved it goes live and matching automatically surfaces best-fit employees.' },
  { q: 'Do I have to take whoever the system matches?', a: 'No — matching is a suggestion, not an assignment. You retain full discretion over who you accept.' },
  { q: 'What if a team member wants an opportunity elsewhere?', a: 'For gigs they can express interest themselves. For an immersion you\'re part of the approval process — you agree on time and workload coverage in advance.' },
  { q: 'What\'s expected after the exposure ends?', a: 'A short feedback form — a star rating and a comment — that takes a couple of minutes to complete.' },
]

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-ink mb-1">Frequently Asked Questions</h1>
      <p className="text-sm text-brand-muted mb-8">Everything you need to know about participating in the Talent Marketplace pilot.</p>
      <Section title="For Employees" items={FOR_EMPLOYEES} />
      <Section title="For Managers & HR Posting Opportunities" items={FOR_MANAGERS} />
    </div>
  )
}
