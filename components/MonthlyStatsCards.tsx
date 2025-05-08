import React from "react"

// Simple tooltip component
const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <span className="relative group ml-1 cursor-pointer">
    <span className="text-gray-400">&#9432;</span>
    <span className="absolute left-1/2 z-10 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 -translate-x-1/2 mt-2 whitespace-pre max-w-xs w-max">
      {text}
    </span>
  </span>
)

interface MonthlyStatsCardsProps {
  monthlyCumulativeSpending: number
  rentAndUtilities: number
  theRest: number
  tentativeMonthlyBudget: number
  avgSpendPerDay: number
  targetSpendPerDay: number
  percentOverUnderTarget: number
  spendPerDayAllowed: number
}

export const MonthlyStatsCards: React.FC<MonthlyStatsCardsProps> = ({
  monthlyCumulativeSpending,
  rentAndUtilities,
  theRest,
  tentativeMonthlyBudget,
  avgSpendPerDay,
  targetSpendPerDay,
  percentOverUnderTarget,
  spendPerDayAllowed,
}) => {
  // Helper for formatting INR
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

  // Show as percent: ((avgSpendPerDay - targetSpendPerDay) / targetSpendPerDay) * 100
  const overUnderPercent = targetSpendPerDay === 0 ? 0 : ((avgSpendPerDay - targetSpendPerDay) / targetSpendPerDay) * 100;
  const overUnderColor = overUnderPercent > 1 ? "text-red-600" : "text-green-600";
  const overUnderLabel = `${overUnderPercent > 0 ? '+' : ''}${overUnderPercent.toFixed(2)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* First Row */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Monthly Cumulative Spending
          <Tooltip text={"Sum of all spending so far this month."} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(monthlyCumulativeSpending)}</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Rent & Utilities
          <Tooltip text={"Total of all 'Rent & Utilities' transactions for this month."} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(rentAndUtilities)}</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          The Rest
          <Tooltip text={"Monthly Cumulative Spending minus Rent & Utilities."} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(theRest)}</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Tentative Monthly Budget
          <Tooltip text={"Hardcoded to ₹50,000 for now."} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(tentativeMonthlyBudget)}</span>
      </div>

      {/* Second Row */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Avg Spend per Day
          <Tooltip text={"(Fixed Costs / Days in Month) + (Cumulative Spending - Fixed Costs) / Days Elapsed This Month"} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(avgSpendPerDay)}</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Target Spend per Day
          <Tooltip text={"Monthly Budget / Days in Month"} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(targetSpendPerDay)}</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Over / Under Target
          <Tooltip text={"Avg Spend/Day - Target Spend/Day"} />
        </span>
        <span className={`text-xl font-semibold ${overUnderColor}`}>{overUnderLabel}</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">
          Spend/Day Allowed to Reach Target
          <Tooltip text={"(Budget - Spending) / Days Left This Month (not including today)"} />
        </span>
        <span className="text-xl font-semibold">{formatCurrency(spendPerDayAllowed)}</span>
      </div>
    </div>
  )
}
