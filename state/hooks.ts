"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  type Transaction,
  getMonthStart,
  getMonthEnd,
  filterTransactionsByDateRange,
  filterTransactionsByDate,
  groupTransactionsByCategory,
  getUniqueCategories,
  getHighestCategory,
  calculateNeedsVsWants,
  groupTransactionsByTimeGranularity,
  getConsecutiveMonthsUnderBudget,
  getTotalBudget,
  budgetMap,
  needsVsWantsMap,
} from "../lib/transactionsLoader"

export type TimeGranularity = "day" | "week" | "month"

export function useBudgetDashboard(transactions: Transaction[]) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Global state
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("day")
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [searchText, setSearchText] = useState<string>("")

  // Derived data
  const monthStart = useMemo(() => getMonthStart(selectedMonth), [selectedMonth])
  const monthEnd = useMemo(() => getMonthEnd(selectedMonth), [selectedMonth])

  const txThisMonth = useMemo(
    () => filterTransactionsByDateRange(transactions, monthStart, monthEnd),
    [transactions, monthStart, monthEnd],
  )

  const txToday = useMemo(() => filterTransactionsByDate(transactions, today), [transactions, today])

  const txYesterday = useMemo(() => filterTransactionsByDate(transactions, yesterday), [transactions, yesterday])

  const spendByCategory = useMemo(() => groupTransactionsByCategory(txThisMonth), [txThisMonth])

  const categories = useMemo(() => getUniqueCategories(transactions), [transactions])

  const highestCategory = useMemo(() => getHighestCategory(spendByCategory), [spendByCategory])

  const totalSpentThisMonth = useMemo(() => txThisMonth.reduce((sum, t) => sum + t.amount, 0), [txThisMonth])

  const totalSpentToday = useMemo(() => txToday.reduce((sum, t) => sum + t.amount, 0), [txToday])

  const totalSpentYesterday = useMemo(() => txYesterday.reduce((sum, t) => sum + t.amount, 0), [txYesterday])

  const totalBudget = useMemo(() => getTotalBudget(budgetMap), [budgetMap])

  const surplusDeficit = useMemo(() => totalBudget - totalSpentThisMonth, [totalBudget, totalSpentThisMonth])

  const needsVsWants = useMemo(
    () => calculateNeedsVsWants(txThisMonth, needsVsWantsMap),
    [txThisMonth, needsVsWantsMap],
  )

  const timeSeriesData = useMemo(() => {
    const data = groupTransactionsByTimeGranularity(txThisMonth, timeGranularity)
    console.log("Generated time series data:", data)
    return data
  }, [txThisMonth, timeGranularity])

  const streak = useMemo(
    () => getConsecutiveMonthsUnderBudget(transactions, budgetMap, selectedMonth),
    [transactions, budgetMap, selectedMonth],
  )

  // Filtered transactions for the table
  const filteredTransactions = useMemo(() => {
    let filtered = txThisMonth

    if (categoryFilter.length > 0) {
      filtered = filtered.filter((t) => categoryFilter.includes(t.category))
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (t) => t.description.toLowerCase().includes(searchLower) || t.category.toLowerCase().includes(searchLower),
      )
    }

    // Sort by date descending, with fixed expenses at the top
    return [...filtered].sort((a, b) => {
      // Fixed expenses come first
      if (a.isFixedExpense && !b.isFixedExpense) return -1
      if (!a.isFixedExpense && b.isFixedExpense) return 1

      // If both are fixed expenses, sort by category and then description
      if (a.isFixedExpense && b.isFixedExpense) {
        if (a.category !== b.category) return a.category.localeCompare(b.category)
        return a.description.localeCompare(b.description)
      }

      // For regular transactions, sort by date descending
      return b.date!.getTime() - a.date!.getTime()
    })
  }, [txThisMonth, categoryFilter, searchText])

  // Debug: Log key state changes
  useEffect(() => {
    console.log("Selected month:", selectedMonth)
    console.log("Time granularity:", timeGranularity)
    console.log("Transactions this month:", txThisMonth.length)
  }, [selectedMonth, timeGranularity, txThisMonth])

  // Handlers
  const handleMonthChange = useCallback((date: Date) => {
    setSelectedMonth(date)
  }, [])

  const handleGranularityChange = useCallback((granularity: TimeGranularity) => {
    setTimeGranularity(granularity)
  }, [])

  const handleCategoryFilterChange = useCallback((categories: string[]) => {
    setCategoryFilter(categories)
  }, [])

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text)
  }, [])

  const toggleCategoryFilter = useCallback((category: string) => {
    setCategoryFilter((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }, [])

  return {
    // State
    selectedMonth,
    timeGranularity,
    categoryFilter,
    searchText,

    // Derived data
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

    // Handlers
    handleMonthChange,
    handleGranularityChange,
    handleCategoryFilterChange,
    handleSearchChange,
    toggleCategoryFilter,
  }
}
