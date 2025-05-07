"use client"
import { type Transaction, formatCurrency, needsVsWantsMap, budgetMap } from "../lib/transactionsLoader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, RepeatIcon } from "lucide-react"

interface TransactionsTableProps {
  transactions: Transaction[]
  categories: string[]
  categoryFilter: string[]
  searchText: string
  onCategoryFilterChange: (categories: string[]) => void
  onSearchChange: (text: string) => void
}

export function TransactionsTable({
  transactions,
  categories,
  categoryFilter,
  searchText,
  onCategoryFilterChange,
  onSearchChange,
}: TransactionsTableProps) {
  // Function to determine if a transaction should be highlighted
  const shouldHighlight = (transaction: Transaction) => {
    const { category, amount } = transaction
    const type = needsVsWantsMap[category] || "Want"
    const budget = budgetMap[category] || 0

    // Highlight if it's a "Want" and amount > daily budget
    return type === "Want" && budget > 0 && amount > budget / 30
  }

  // Format date in a more readable way
  const formatDate = (transaction: Transaction) => {
    if (transaction.isFixedExpense) {
      return (
        <div className="flex items-center text-gray-500">
          <RepeatIcon className="h-4 w-4 mr-1" />
          <span>Fixed Expense</span>
        </div>
      )
    }

    if (!transaction.date) return "N/A"

    return (
      <div className="flex items-center">
        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
        {transaction.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Transactions</h3>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/3">
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                onCategoryFilterChange([])
              } else {
                onCategoryFilterChange([value])
              }
            }}
            value={categoryFilter.length === 1 ? categoryFilter[0] : "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter(category => category && category.trim() !== '') // Filter out empty categories
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search transactions..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => (
                <TableRow
                  key={index}
                  className={`${shouldHighlight(transaction) ? "bg-red-50" : ""} ${transaction.isFixedExpense ? "bg-gray-50" : ""}`}
                >
                  <TableCell>{formatDate(transaction)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center">
                      {transaction.category}
                      {needsVsWantsMap[transaction.category] === "Want" && (
                        <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          Want
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500 mt-2">
        <p>Rows highlighted in red are "Want" transactions that exceed the daily budget for that category.</p>
        <p>Gray rows are fixed expenses that are included in every month's calculations.</p>
      </div>
    </div>
  )
}
