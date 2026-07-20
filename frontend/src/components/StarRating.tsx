import { Star } from 'lucide-react'

export default function StarRating({ rating, onChange }: { rating: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={18}
          className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          onClick={() => onChange?.(n)}
          style={{ cursor: onChange ? 'pointer' : 'default' }} />
      ))}
    </div>
  )
}
