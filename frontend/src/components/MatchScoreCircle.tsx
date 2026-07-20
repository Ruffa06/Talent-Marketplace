export default function MatchScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#166534' : score >= 70 ? '#ca8a04' : '#C00000'
  return (
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 shrink-0" style={{ borderColor: color }}>
      <span className="text-base font-bold" style={{ color }}>{score}</span>
      <span className="text-[9px] text-muted-foreground">match</span>
    </div>
  )
}
