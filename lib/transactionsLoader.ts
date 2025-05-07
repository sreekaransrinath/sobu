import { parse } from "csv-parse/sync"

export interface Transaction {
  date: Date | null // Allow null for fixed expenses
  category: string
  amount: number
  description: string
  isFixedExpense: boolean // Flag to identify fixed expenses
}

export interface BudgetMap {
  [category: string]: number
}

export interface NeedsWantsMap {
  [category: string]: "Need" | "Want"
}

// Sample budget data - in a real app, this could be stored in a database or config file
export const budgetMap: BudgetMap = {
  "Rent & Utilities": 3000,
  Subscriptions: 1500,
  "Eating Out": 1000,
  Groceries: 500,
  Transit: 300,
  Travel: 1000,
  Gifts: 200,
  Misc: 500,
}

// Sample needs vs wants categorization
export const needsVsWantsMap: NeedsWantsMap = {
  "Rent & Utilities": "Need",
  Groceries: "Need",
  Transit: "Need",
  Subscriptions: "Want",
  "Eating Out": "Want",
  Travel: "Want",
  Gifts: "Want",
  Misc: "Want",
}

export async function loadTransactions(csvContent: string): Promise<Transaction[]> {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true // Trim whitespace from all fields
    })

    // Filter out completely empty rows (where all fields are empty or just whitespace)
    const nonEmptyRecords = records.filter((record: any) => {
      return Object.values(record).some(value => 
        value !== undefined && value !== null && value.toString().trim() !== ""
      )
    })

    const currentYear = new Date().getFullYear()

    return nonEmptyRecords
      .filter((record: any) => {
        // Skip records with empty/zero amount or empty category
        const amount = parseFloat(record.Amount?.replace(/[^0-9.]/g, "") || "0")
        return amount > 0 && record.Category && record.Category.trim() !== ""
      })
      .map((record: any) => {
        // Check if this is a fixed expense (no date)
        const isFixedExpense = !record.Date || record.Date.trim() === ""

        // Parse date - handle "May X" format or null for fixed expenses
        let date: Date | null
        if (isFixedExpense) {
          // For fixed expenses, set date to null
          date = null
        } else if (record.Date.startsWith("May ")) {
          // Handle "May X" format
          const day = Number.parseInt(record.Date.replace("May ", ""))
          date = new Date(currentYear, 4, day) // May is month 4 (0-indexed)
        } else {
          // Try to parse as regular date
          date = new Date(record.Date)
          if (isNaN(date.getTime())) {
            // If parsing fails, set as fixed expense
            date = null
          }
        }

        // Parse amount - handle currency symbols and commas
        let amount = 0
        if (record.Amount) {
          // Remove any non-numeric characters except decimal point
          const cleanAmount = record.Amount.replace(/[^0-9.]/g, "")
          amount = Number.parseFloat(cleanAmount)
          if (isNaN(amount)) {
            return null // Skip invalid amounts
          }
        }

        return {
          date,
          category: record.Category,
          amount,
          description: record.Description || "No description",
          isFixedExpense: isFixedExpense,
        }
      })
  } catch (error) {
    console.error("Error parsing CSV:", error)
    return []
  }
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
): Transaction[] {
  return transactions.filter((t) => {
    // Include fixed expenses in all date ranges
    if (t.isFixedExpense) return true

    // For regular transactions, check if they fall within the date range
    return t.date !== null && t.date >= startDate && t.date <= endDate
  })
}

export function filterTransactionsByDate(transactions: Transaction[], date: Date): Transaction[] {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  // Get the current date for comparison
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  return transactions.filter((t) => {
    // For fixed expenses, we need a consistent approach
    // Include them only in the current day's total, not in historical days
    if (t.isFixedExpense) {
      // Only include fixed expenses if we're looking at the current day
      return date.getTime() === currentDate.getTime()
    }

    // For regular transactions, check if they fall within the specific date
    return t.date !== null && t.date >= targetDate && t.date < nextDay
  })
}

export function groupTransactionsByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce(
    (acc, transaction) => {
      const { category, amount } = transaction
      acc[category] = (acc[category] || 0) + amount
      return acc
    },
    {} as Record<string, number>,
  )
}

export function getUniqueCategories(transactions: Transaction[]): string[] {
  return [...new Set(transactions.map((t) => t.category))]
}

export function getTotalBudget(budgetMap: BudgetMap): number {
  return Object.values(budgetMap).reduce((sum, amount) => sum + amount, 0)
}

// Update the formatCurrency function to ensure it uses INR currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getHighestCategory(spendByCategory: Record<string, number>): { category: string; amount: number } {
  const entries = Object.entries(spendByCategory)
  if (entries.length === 0) return { category: "None", amount: 0 }

  const [category, amount] = entries.reduce((max, current) => (current[1] > max[1] ? current : max))

  return { category, amount }
}

export function calculateNeedsVsWants(
  transactions: Transaction[],
  needsWantsMap: NeedsWantsMap,
): { needs: number; wants: number } {
  return transactions.reduce(
    (acc, { category, amount }) => {
      const type = needsWantsMap[category] || "Want"
      if (type === "Need") {
        acc.needs += amount
      } else {
        acc.wants += amount
      }
      return acc
    },
    { needs: 0, wants: 0 },
  )
}

export function groupTransactionsByTimeGranularity(
  transactions: Transaction[],
  granularity: "day" | "week" | "month",
): Record<string, number> {
  // First, separate fixed expenses
  const fixedExpenses = transactions.filter((t) => t.isFixedExpense)
  const regularTransactions = transactions.filter((t) => !t.isFixedExpense)

  // Calculate total fixed expenses
  const totalFixedExpenses = fixedExpenses.reduce((sum, t) => sum + t.amount, 0)

  // Get the current month and year for generating dates
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Create a result object to store our data
  const result: Record<string, number> = {}

  // If we have fixed expenses, add a special key for them
  if (totalFixedExpenses > 0) {
    result["fixed"] = totalFixedExpenses
  }

  // Group regular transactions by time
  regularTransactions.forEach(({ date, amount }) => {
    if (!date) return

    let key: string

    switch (granularity) {
      case "day":
        // Create key in YYYY-MM-DD format that matches what we see in the data
        const year = date.getFullYear();
        // Months are 0-indexed in JS, but we need 1-indexed for the key
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        key = `${year}-${month}-${day}`;
        console.log(`Generated day key for ${date.toString()}: ${key}`);
        break
      case "week":
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        key = `${date.getFullYear()}-W${weekNumber}`
        break
      case "month":
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
        break
    }

    result[key] = (result[key] || 0) + amount
  })

  // For daily view, ensure we have entries for all days in the month
  if (granularity === "day") {
    // Get the selected month from the transactions
    let monthToUse = currentMonth
    let yearToUse = currentYear

    // Try to determine the month from the transactions
    if (regularTransactions.length > 0 && regularTransactions[0].date) {
      monthToUse = regularTransactions[0].date.getMonth()
      yearToUse = regularTransactions[0].date.getFullYear()
    }

    // Get the number of days in the month
    const daysInMonth = new Date(yearToUse, monthToUse + 1, 0).getDate()

    // Create entries for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = day.toString().padStart(2, "0")
      const formattedMonth = (monthToUse + 1).toString().padStart(2, "0")
      const key = `${yearToUse}-${formattedMonth}-${formattedDay}`

      // Only add if it doesn't exist
      if (!(key in result)) {
        result[key] = 0
      }
    }
  }

  console.log("Time series data:", result)
  return result
}

export function getConsecutiveMonthsUnderBudget(
  transactions: Transaction[],
  budgetMap: BudgetMap,
  currentDate: Date,
): number {
  let streak = 0
  const currentMonth = new Date(currentDate)

  // Check up to 12 months back
  for (let i = 0; i < 12; i++) {
    const monthStart = getMonthStart(currentMonth)
    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)

    const monthTransactions = filterTransactionsByDateRange(transactions, monthStart, monthEnd)

    const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalBudget = getTotalBudget(budgetMap)

    if (totalSpent <= totalBudget) {
      streak++
      // Move to previous month
      currentMonth.setMonth(currentMonth.getMonth() - 1)
    } else {
      break
    }
  }

  return streak
}

// Generate last 12 months options for the dropdown
export function getLastTwelveMonths(currentDate: Date = new Date()): { value: string; label: string }[] {
  const months = []
  const current = new Date(currentDate)

  for (let i = 0; i < 12; i++) {
    const year = current.getFullYear()
    const month = current.getMonth()
    const value = `${year}-${month + 1}`
    const label = current.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    months.push({ value, label })
    current.setMonth(month - 1)
  }

  return months
}
