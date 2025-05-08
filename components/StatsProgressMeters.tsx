import React from "react"

interface StatsProgressMetersProps {
  monthlyCumulativeSpending: number
  tentativeMonthlyBudget: number
  avgSpendPerDay: number
  targetSpendPerDay: number
}

export const StatsProgressMeters: React.FC<StatsProgressMetersProps> = ({
  monthlyCumulativeSpending,
  tentativeMonthlyBudget,
  avgSpendPerDay,
  targetSpendPerDay,
}) => {
  // Helper for formatting INR
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

  const budgetPercent = Math.min((monthlyCumulativeSpending / tentativeMonthlyBudget) * 100, 100)
  // Updated formula: avgSpendPerDay - targetSpendPerDay
  const dailyPercent = avgSpendPerDay - targetSpendPerDay;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Monthly Budget Progress */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">Monthly Budget Progress</span>
          <span className="text-xs text-gray-500">{budgetPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${budgetPercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${budgetPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatCurrency(monthlyCumulativeSpending)}</span>
          <span>{formatCurrency(tentativeMonthlyBudget)}</span>
        </div>
      </div>
      {/* Daily Spend Progress */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">Avg Daily Spend vs Target</span>
          <span className={`text-xs ${dailyPercent > 0 ? 'text-red-600' : 'text-green-600'}`}>{dailyPercent.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${dailyPercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${dailyPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatCurrency(avgSpendPerDay)}</span>
          <span>{formatCurrency(targetSpendPerDay)}</span>
        </div>
      </div>
    </div>
  )
}
