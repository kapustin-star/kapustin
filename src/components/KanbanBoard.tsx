import { useRef, useState } from 'react'
import { DEAL_STAGES, type Deal, type DealStage } from '../types'

const COLUMN_STYLES: Record<DealStage, string> = {
  lead: 'border-gray-200 bg-white',
  working: 'border-gray-200 bg-white',
  negotiation: 'border-gray-200 bg-white',
  success: 'border-green-200 bg-green-50',
  refused: 'border-red-200 bg-red-50',
}

interface KanbanBoardProps {
  deals: Deal[]
  onMoveDeal: (dealId: string, stage: DealStage) => Promise<void>
  onSelect: (deal: Deal) => void
}

function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function sumAmounts(deals: Deal[]): number {
  return deals.reduce<number>((sum, d) => sum + (d.amount ?? 0), 0)
}

const DRAG_THRESHOLD = 5

function Card({
  deal,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  deal: Deal
  onDragStart: () => void
  onDragEnd: () => void
  onClick: () => void
}) {
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation()
        if (moved.current) return
        onClick()
      }}
      onPointerDown={(e) => {
        moved.current = false
        startPos.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerMove={(e) => {
        if (!startPos.current) return
        const dx = e.clientX - startPos.current.x
        const dy = e.clientY - startPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          moved.current = true
        }
      }}
      onPointerUp={() => {
        startPos.current = null
      }}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing select-none hover:border-gray-300"
    >
      <p className="font-medium text-gray-900 truncate">{deal.client}</p>
      {deal.company && (
        <p className="text-sm text-gray-500 truncate">{deal.company}</p>
      )}
      <p className="mt-2 text-sm font-semibold text-gray-700">
        {formatAmount(deal.amount)}
      </p>
    </div>
  )
}

export default function KanbanBoard({
  deals,
  onMoveDeal,
  onSelect,
}: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleDrop(stage: DealStage) {
    if (!draggingId) return
    const deal = deals.find((d) => d.id === draggingId)
    if (!deal || deal.stage === stage) {
      setDraggingId(null)
      return
    }

    setDraggingId(null)
    setPendingId(deal.id)
    try {
      await onMoveDeal(deal.id, stage)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-6xl">
      {DEAL_STAGES.map(({ value, label }) => {
        const columnDeals = deals.filter((d) => d.stage === value)
        return (
          <div
            key={value}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(value)}
            className={`rounded-2xl border p-3 min-h-[200px] ${COLUMN_STYLES[value]}`}
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  {label}
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  {formatAmount(sumAmounts(columnDeals))}
                </p>
              </div>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                {columnDeals.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {columnDeals.map((deal) => (
                <Card
                  key={deal.id}
                  deal={deal}
                  onDragStart={() => setDraggingId(deal.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onClick={() => onSelect(deal)}
                />
              ))}
            </div>
          </div>
        )
      })}
      {pendingId && (
        <p className="text-sm text-gray-400 text-center">Сохранение...</p>
      )}
    </div>
  )
}
