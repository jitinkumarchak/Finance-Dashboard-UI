import { CAT_COLORS } from '../data/mockData'

export default function CatChip({ cat }) {
  const c = CAT_COLORS[cat] || CAT_COLORS['Other']
  return (
    <span
      className="tx-cat"
      style={{ background: c.bg, color: c.color }}
    >
      {cat}
    </span>
  )
}
