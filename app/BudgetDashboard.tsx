"use client"

import { useState, useEffect } from "react"
import {
  type Transaction,
  budgetMap,
  needsVsWantsMap as needsVsWantsMapImport,
  getLastTwelveMonths,
} from "../lib/transactionsLoader"
import { useBudgetDashboard } from "../state/hooks"
import { KpiCards } from "../components/KpiCards"
import { MonthlyStatsCards } from "../components/MonthlyStatsCards"
import { StatsProgressMeters } from "../components/StatsProgressMeters"
import { ChartBarBudget } from "../components/ChartBarBudget"
import { ChartDonutCat } from "../components/ChartDonutCat"
import { ChartLineDaily } from "../components/ChartLineDaily"
import { NeedsWantsMeter } from "../components/NeedsWantsMeter"
import { TransactionsTable } from "../components/TransactionsTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Loader2 } from "lucide-react"
import confetti from "canvas-confetti"
import useSheetData from "@/hooks/useSheetData"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert } from "@/components/ui/alert"

export default function BudgetDashboard() {
  const { data: transactions, loading, error } = useSheetData()
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const {
    selectedMonth,
    timeGranularity,
    categoryFilter,
    searchText,
    txThisMonth,
    txToday,
    txYesterday,
    spendByCategory,
    categories,
    highestCategory,
    totalSpentThisMonth,
    totalSpentToday,
    totalSpentYesterday,
    totalBudget,
    surplusDeficit,
    needsVsWants,
    timeSeriesData,
    filteredTransactions,
    streak,
    handleMonthChange,
    handleGranularityChange,
    handleCategoryFilterChange,
    handleSearchChange,
    toggleCategoryFilter,
  } = useBudgetDashboard(transactions)

  // Set initial month to May 2023 to match our sample data
  useEffect(() => {
    // Only set once when transactions are loaded
    if (transactions.length > 0) {
      // Find a transaction with a date to determine the month
      const transactionWithDate = transactions.find((t) => t.date !== null)
      if (transactionWithDate && transactionWithDate.date) {
        handleMonthChange(transactionWithDate.date)
      }
    }
  }, [transactions, handleMonthChange])

  // Show confetti when surplus is positive
  useEffect(() => {
    if (surplusDeficit > 0 && !showConfetti) {
      setShowConfetti(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Reset after a delay to allow it to show again if the user changes months
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [surplusDeficit, showConfetti])

  // Get month options for the dropdown
  const monthOptions = getLastTwelveMonths()

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">Failed to load data</Alert>
      </div>
    )
  }

  // --- Monthly Metrics Calculation ---
  // Monthly Cumulative Spending
  const monthlyCumulativeSpending = totalSpentThisMonth

  // Rent & Utilities
  const rentAndUtilities = spendByCategory["Rent & Utilities"] || 0
  // The Rest
  const theRest = monthlyCumulativeSpending - rentAndUtilities

  // Tentative Monthly Budget (hardcoded)
  const tentativeMonthlyBudget = 50000

  // Days in month
  const today = new Date()
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()
  const isCurrentMonth = today.getMonth() === selectedMonth.getMonth() && today.getFullYear() === selectedMonth.getFullYear()
  const currentDay = isCurrentMonth ? today.getDate() : daysInMonth
  const daysElapsed = currentDay
  const daysLeft = daysInMonth - currentDay

  // Fixed costs for the month
  const fixedCosts = spendByCategory["Rent & Utilities"] || 0 // or sum fixed expenses if tracked separately

  // Avg Spend per Day (user formula)
  const avgSpendPerDay = daysInMonth > 0 && daysElapsed > 0
    ? (fixedCosts / daysInMonth) + ((monthlyCumulativeSpending - fixedCosts) / daysElapsed)
    : 0

  // Target Spend per Day (user formula)
  const targetSpendPerDay = tentativeMonthlyBudget / daysInMonth

  // % Over or Under Target (user formula)
  const percentOverUnderTarget = targetSpendPerDay > 0
    ? ((targetSpendPerDay - avgSpendPerDay) / targetSpendPerDay) * 100
    : 0

  // Spend/Day Allowed to Reach Target by EoM (user formula)
  const spendPerDayAllowed = daysLeft > 0
    ? (tentativeMonthlyBudget - monthlyCumulativeSpending) / daysLeft
    : 0

  return (
    <div className="min-h-screen bg-[#F9FAFC] p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-4 md:mb-0">Personal Budget Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Select
            onValueChange={(value) => {
              const [year, month] = value.split("-")
              handleMonthChange(new Date(Number.parseInt(year), Number.parseInt(month) - 1))
            }}
            defaultValue={`${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}`}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={timeGranularity}
            onValueChange={(value) => {
              if (value) handleGranularityChange(value as "day" | "week" | "month")
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="day" aria-label="Toggle daily view">
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Toggle weekly view">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Toggle monthly view">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>

      {/* Monthly Stats Section */}
      <MonthlyStatsCards
        monthlyCumulativeSpending={monthlyCumulativeSpending}
        rentAndUtilities={rentAndUtilities}
        theRest={theRest}
        tentativeMonthlyBudget={tentativeMonthlyBudget}
        avgSpendPerDay={avgSpendPerDay}
        targetSpendPerDay={targetSpendPerDay}
        percentOverUnderTarget={percentOverUnderTarget}
        spendPerDayAllowed={isFinite(spendPerDayAllowed) && spendPerDayAllowed > 0 ? spendPerDayAllowed : 0}
      />
      <StatsProgressMeters
        monthlyCumulativeSpending={monthlyCumulativeSpending}
        tentativeMonthlyBudget={tentativeMonthlyBudget}
        avgSpendPerDay={avgSpendPerDay}
        targetSpendPerDay={targetSpendPerDay}
      />

      {/* KPI Cards */}
      <KpiCards
        totalSpentThisMonth={totalSpentThisMonth}
        totalSpentToday={totalSpentToday}
        totalSpentYesterday={totalSpentYesterday}
        highestCategory={highestCategory}
        surplusDeficit={surplusDeficit}
        streak={streak}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
            <ChartBarBudget
              spendByCategory={spendByCategory}
              budgetMap={budgetMap}
              onCategoryClick={toggleCategoryFilter}
            />
          </div>

          <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
            <ChartLineDaily timeSeriesData={timeSeriesData} timeGranularity={timeGranularity} />
          </div>
        </div>

        {/* Right Column - Donut & Needs vs Wants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
            <ChartDonutCat
              spendByCategory={spendByCategory}
              needsWantsMap={needsVsWantsMapImport}
              onCategoryClick={toggleCategoryFilter}
            />
          </div>

          <NeedsWantsMeter needs={needsVsWants.needs} wants={needsVsWants.wants} />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsTable
        transactions={filteredTransactions}
        categories={categories}
        categoryFilter={categoryFilter}
        searchText={searchText}
        onCategoryFilterChange={handleCategoryFilterChange}
        onSearchChange={handleSearchChange}
      />
    </div>
  )
}
