import { Badge } from '@/components/ui/badge'

const TYPE_LABELS: Record<string, string> = { gig: '⚡ Gig', vacancy: '💼 Vacancy', immersion: '🎓 Immersion' }

export default function OpportunityTypeBadge({ type }: { type: string }) {
  const variant = type as 'gig' | 'vacancy' | 'immersion'
  return <Badge variant={variant}>{TYPE_LABELS[type] || type}</Badge>
}
