"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { TimeGranularity } from "../state/hooks"
import { formatCurrency } from "../lib/transactionsLoader"

interface ChartLineDailyProps {
  timeSeriesData: Record<string, number>
  timeGranularity: TimeGranularity
}

export function ChartLineDaily({ timeSeriesData, timeGranularity }: ChartLineDailyProps) {
  // Transform data for the chart
  const chartData = useMemo(() => {
    // Extract fixed expenses
    const fixedExpenses = timeSeriesData.fixed || 0
    delete timeSeriesData.fixed // Remove fixed from the data to process

    // Create sorted array of dates
    const sortedDates = Object.keys(timeSeriesData).sort()

    return sortedDates.map(date => {
      // Format the date label
      let label = date
      if (timeGranularity === "day" && date.includes("-")) {
        const [, month, day] = date.split("-")
        label = `${month}/${day}`
      } else if (timeGranularity === "week" && date.includes("-W")) {
        label = `Week ${date.split("-W")[1]}`
      } else if (timeGranularity === "month" && date.includes("-")) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = parseInt(date.split("-")[1]) - 1
        label = monthNames[month] || date
      }

      // Calculate fixed expenses per period
      let periodFixedExpenses = fixedExpenses
      if (timeGranularity === "day") {
        periodFixedExpenses = fixedExpenses / 30 // Distribute across month
      } else if (timeGranularity === "week") {
        periodFixedExpenses = fixedExpenses / 4 // Distribute across weeks
      }

      const dailySpending = timeSeriesData[date]
      const fixedSpending = periodFixedExpenses
      const totalSpending = dailySpending + fixedSpending

      return {
        date: label,
        dailySpending,
        fixedSpending,
        totalSpending
      }
    })
  }, [timeSeriesData, timeGranularity])

  if (chartData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-500">No spending data available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">
        Spending Trend ({timeGranularity === "day" ? "Daily" : timeGranularity === "week" ? "Weekly" : "Monthly"})
      </h3>
      <div className="h-[calc(100%-32px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              height={30}
              tickMargin={10}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="dailySpending"
              name="Daily Spending"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="fixedSpending"
              name="Fixed Expenses"
              stroke="#93C5FD"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="totalSpending"
              name="Total"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
