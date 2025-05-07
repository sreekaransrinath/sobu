import { formatCurrency } from "../lib/transactionsLoader"

interface NeedsWantsMeterProps {
  needs: number
  wants: number
}

export function NeedsWantsMeter({ needs, wants }: NeedsWantsMeterProps) {
  const total = needs + wants
  const needsPercentage = total > 0 ? (needs / total) * 100 : 0
  const wantsPercentage = total > 0 ? (wants / total) * 100 : 0

  // Warning threshold: wants > 30% of total
  const isWantsHigh = wantsPercentage > 30

  return (
    <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">Needs vs. Wants</h3>

      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-blue-600">Needs: {formatCurrency(needs)}</span>
        <span className="text-sm font-medium text-blue-600">{needsPercentage.toFixed(1)}%</span>
      </div>

      <div className="flex justify-between mb-1">
        <span className={`text-sm font-medium ${isWantsHigh ? "text-orange-600" : "text-orange-500"}`}>
          Wants: {formatCurrency(wants)}
        </span>
        <span className={`text-sm font-medium ${isWantsHigh ? "text-orange-600" : "text-orange-500"}`}>
          {wantsPercentage.toFixed(1)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <div className="bg-blue-500 h-4 rounded-l-full" style={{ width: `${needsPercentage}%` }}></div>
        <div
          className={`${isWantsHigh ? "bg-orange-600" : "bg-orange-500"} h-4 rounded-r-full`}
          style={{
            width: `${wantsPercentage}%`,
            marginLeft: `${needsPercentage}%`,
            marginTop: "-1rem",
          }}
        ></div>
      </div>

      {isWantsHigh && (
        <p className="text-xs text-orange-600 mt-2">Warning: 'Wants' spending is above 30% of your total spending.</p>
      )}
    </div>
  )
}
