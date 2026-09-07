import { DEAL_STAGES, type Deal } from '../types'

interface KanbanBoardProps {
  deals: Deal[]
}

function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function Card({ deal }: { deal: Deal }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
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

export default function KanbanBoard({ deals }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-6xl">
      {DEAL_STAGES.map(({ value, label }) => {
        const columnDeals = deals.filter((d) => d.stage === value)
        return (
          <div
            key={value}
            className="bg-gray-50 rounded-lg p-3 min-h-[200px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                {columnDeals.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {columnDeals.map((deal) => (
                <Card key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
