import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_EMP = [
  { q: "Will joining a gig or immersion affect my KPIs or salary?", a: "No. Participation is ad-hoc and voluntary. Taking on a gig or immersion does not change your role, your reporting line, your KPIs, or your salary. It's about growth and exposure — not a performance obligation." },
  { q: "How does the time commitment work?", a: "For most gigs, you and the opportunity owner agree on a light commitment (often part-time, e.g. 30% bandwidth). For a Developmental Job Immersion, it requires your manager's approval first." },
  { q: "Who is eligible to participate?", a: "Most employees in good standing can take part. Employees currently on a Performance Improvement Plan (PIP), or with a most-recent performance rating of 2 or lower, are not eligible." },
  { q: "What do I actually get out of this?", a: "You get to: learn new skills on real work, gain flexibility & variety, start a career pivot, build visibility with new teams & leaders, and expand your internal network." },
  { q: "Will my manager see that I'm exploring opportunities?", a: "You control your visibility. For gigs you can explore and express interest discreetly. For a Developmental Job Immersion, manager approval is required by design." },
  { q: "What happens after I express interest?", a: "The opportunity owner is notified and reviews everyone who's interested. They may invite you to a quick chat, accept, or decline. You'll be notified of the outcome either way." },
]

const FAQ_POST = [
  { q: "What's the difference between a gig, a vacancy, and a Developmental Job Immersion?", a: "A Gig is a short-term project (1 day–3 months), often part-time. A Vacancy is a permanent open role. A Developmental Job Immersion is a guided learning experience (1 week–1 month) where someone shadows and contributes without changing roles." },
  { q: "How long does it take to post an opportunity?", a: "Under 5 minutes. Fill in the title, department, duration, skills needed, and a short description. It then goes to the admin review queue before going live." },
  { q: "What happens after I submit a posting?", a: "It enters the admin review queue. An admin checks it for appropriateness and clarity, then publishes it. Once live, the AI matching engine automatically surfaces best-fit employees." },
  { q: "Do I have to take whoever the system matches?", a: "No. Matching is a suggestion, not an assignment. You see the AI's recommended candidates with a fit score and reasoning, and you retain full discretion over whom you invite." },
]

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg overflow-hidden bg-white">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50 transition-colors">
            <span>{item.q}</span>
            <ChevronRight size={16} className={cn("shrink-0 text-muted-foreground transition-transform", open === i && "rotate-90")} />
          </button>
          {open === i && <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>}
        </div>
      ))}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Frequently Asked Questions</h1>
      <p className="text-muted-foreground text-sm mb-8">For employees exploring opportunities, and for managers posting them.</p>
      <h2 className="text-base font-semibold mb-3">For employees</h2>
      <div className="mb-8"><Accordion items={FAQ_EMP} /></div>
      <h2 className="text-base font-semibold mb-3">For managers & recruiters</h2>
      <Accordion items={FAQ_POST} />
    </div>
  )
}
