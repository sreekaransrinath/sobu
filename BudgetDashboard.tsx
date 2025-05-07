"use client"

import { useState, useEffect } from "react"
import {
  type Transaction,
  loadTransactions,
  budgetMap,
  needsVsWantsMap,
  getLastTwelveMonths,
} from "./lib/transactionsLoader"
import { useBudgetDashboard } from "./state/hooks"
import { KpiCards } from "./components/KpiCards"
import { ChartBarBudget } from "./components/ChartBarBudget"
import { ChartDonutCat } from "./components/ChartDonutCat"
import { ChartLineDaily } from "./components/ChartLineDaily"
import { NeedsWantsMeter } from "./components/NeedsWantsMeter"
import { TransactionsTable } from "./components/TransactionsTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Loader2 } from "lucide-react"
import confetti from "canvas-confetti"

// Sample CSV data for demonstration
const SAMPLE_CSV = `date,category,amount,description
2025-05-01,Housing,1200,Monthly rent
2025-05-02,Food,85.75,Grocery shopping
2025-05-03,Transportation,45.50,Gas
2025-05-05,Utilities,120,Electricity bill
2025-05-07,Entertainment,35.99,Movie tickets
2025-05-08,Food,65.25,Grocery shopping
2025-05-10,Shopping,120.50,New clothes
2025-05-12,Dining,78.50,Restaurant dinner
2025-05-15,Healthcare,200,Doctor visit
2025-05-16,Food,45.75,Grocery shopping
2025-05-18,Transportation,40,Gas
2025-05-20,Entertainment,15.99,Streaming subscription
2025-05-22,Food,95.25,Grocery shopping
2025-05-23,Personal,30,Haircut
2025-05-25,Dining,65.75,Restaurant lunch
2025-05-27,Utilities,80,Water bill
2025-05-28,Shopping,50.25,Home supplies
2025-05-30,Food,75.50,Grocery shopping
2025-05-31,Miscellaneous,25,Office supplies
2025-06-01,Housing,1200,Monthly rent
2025-06-02,Food,90.25,Grocery shopping
2025-06-03,Transportation,42.50,Gas
2025-06-05,Utilities,115,Electricity bill
2025-06-06,Entertainment,25.99,Concert tickets`

export default function BudgetDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
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

  // Load transactions from CSV
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // In a real app, you would fetch the CSV from an API or file
        const data = await loadTransactions(SAMPLE_CSV)
        setTransactions(data)
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFC]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          <p className="mt-2 text-[#111827]">Loading budget data...</p>
        </div>
      </div>
    )
  }

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
              needsWantsMap={needsVsWantsMap}
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
