"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import type { BudgetMap } from "../lib/transactionsLoader"
import { formatCurrency } from "../lib/transactionsLoader"

interface ChartBarBudgetProps {
  spendByCategory: Record<string, number>
  budgetMap: BudgetMap
  onCategoryClick: (category: string) => void
}

export function ChartBarBudget({ spendByCategory, budgetMap, onCategoryClick }: ChartBarBudgetProps) {
  // Calculate how far we are into the current month (as a percentage)
  const today = new Date()
  const currentDay = today.getDate()
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthProgress = currentDay / totalDaysInMonth

  const data = useMemo(() => {
    return Object.entries(spendByCategory)
      .map(([category, amount]) => {
        const budget = budgetMap[category] || 0

        // Calculate pro-rated budget based on how far we are into the month
        const proRatedBudget = budget * monthProgress

        // Calculate percentages
        const percentOfBudget = budget > 0 ? (amount / budget) * 100 : 0
        const percentOfProRatedBudget = proRatedBudget > 0 ? (amount / proRatedBudget) * 100 : 0

        const isOverBudget = amount > budget
        const isOverProRatedBudget = amount > proRatedBudget

        return {
          category,
          amount,
          budget,
          proRatedBudget,
          percentOfBudget,
          percentOfProRatedBudget,
          isOverBudget,
          isOverProRatedBudget,
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8) // Limit to top 8 categories for better visibility
  }, [spendByCategory, budgetMap, monthProgress])

  const formatYAxis = (value: number) => {
    return formatCurrency(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { category, amount, budget, proRatedBudget, percentOfBudget, percentOfProRatedBudget } = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
          <p className="font-semibold">{category}</p>
          <p className="text-sm">
            Spent: <span className="font-medium">{formatCurrency(amount)}</span>
          </p>
          <p className="text-sm">
            Monthly Budget: <span className="font-medium">{formatCurrency(budget)}</span>
          </p>
          <p className="text-sm">
            Pro-rated Budget: <span className="font-medium">{formatCurrency(proRatedBudget)}</span>
            <span className="text-xs ml-1">({(monthProgress * 100).toFixed(0)}% of month)</span>
          </p>
          <p className="text-sm">
            <span className={percentOfProRatedBudget > 100 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
              {percentOfProRatedBudget.toFixed(0)}% of pro-rated budget
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = () => {
    return (
      <div className="flex justify-center items-center gap-6 text-sm mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600"></div>
          <span>Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-300"></div>
          <span>Actual</span>
        </div>
      </div>
    )
  }

  // If there's no data, show a message
  if (data.length === 0) {
    return (
      <div className="h-80 w-full">
        <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">Budget vs. Actual by Category</h3>
        <div className="text-xs text-gray-500 mb-2">
          Showing budget comparison adjusted for {(monthProgress * 100).toFixed(0)}% of the month completed
        </div>
        <div className="h-[calc(100%-50px)] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-500">No spending data available for this time period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">Budget vs. Actual by Category</h3>
      <div className="text-xs text-gray-500 mb-2">
        Showing budget comparison adjusted for {(monthProgress * 100).toFixed(0)}% of the month completed
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          barSize={40}
          barGap={0}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
            tick={{ fontSize: 12 }}
            onClick={(data) => onCategoryClick(data.value)}
            style={{ cursor: "pointer" }}
          />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />

          {/* Budget bars */}
          <Bar
            dataKey="budget"
            name="Budget"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            onClick={(data) => onCategoryClick(data.category)}
            cursor="pointer"
          />

          {/* Actual spending bars */}
          <Bar
            dataKey="amount"
            name="Actual"
            fill="#93C5FD"
            radius={[4, 4, 0, 0]}
            onClick={(data) => onCategoryClick(data.category)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isOverProRatedBudget ? "#FCA5A5" : "#93C5FD"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
