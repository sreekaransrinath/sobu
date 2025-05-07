"use client"

import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label, Sector } from "recharts"
import type { NeedsWantsMap } from "../lib/transactionsLoader"
import { formatCurrency } from "../lib/transactionsLoader"

interface ChartDonutCatProps {
  spendByCategory: Record<string, number>
  needsWantsMap: NeedsWantsMap
  onCategoryClick: (category: string) => void
}

export function ChartDonutCat({ spendByCategory, needsWantsMap, onCategoryClick }: ChartDonutCatProps) {
  // Color palettes
  const NEED_COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"]
  const WANT_COLORS = ["#F97316", "#FB923C", "#FDBA74", "#FED7AA", "#FFEDD5"]

  // Fix: Use useState directly instead of useMemo for activeIndex
  const [activeIndex, setActiveIndex] = useState(-1)

  const data = useMemo(() => {
    const total = Object.values(spendByCategory).reduce((sum, amount) => sum + amount, 0)

    return Object.entries(spendByCategory)
      .map(([category, amount]) => {
        const type = needsWantsMap[category] || "Want"
        const percentage = total > 0 ? (amount / total) * 100 : 0

        return {
          category,
          amount,
          percentage,
          type,
          formattedAmount: formatCurrency(amount),
          formattedPercentage: `${percentage.toFixed(1)}%`,
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7) // Limit to top 7 categories for better visibility
  }, [spendByCategory, needsWantsMap])

  // Calculate total for center label
  const total = useMemo(() => {
    return Object.values(spendByCategory).reduce((sum, amount) => sum + amount, 0)
  }, [spendByCategory])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { category, amount, percentage, type } = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
          <p className="font-semibold">{category}</p>
          <p className="text-sm">
            <span className={`font-medium ${type === "Need" ? "text-blue-500" : "text-orange-500"}`}>{type}</span>
          </p>
          <p className="text-sm">
            Amount: <span className="font-medium">{formatCurrency(amount)}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-medium">{percentage.toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    if (!payload || !Array.isArray(payload)) {
      return null
    }

    return (
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-1 text-xs cursor-pointer"
            onClick={() => onCategoryClick(entry.payload.category)}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.payload.category}</span>
            <span className="text-gray-500">({entry.payload.formattedPercentage})</span>
          </div>
        ))}
      </div>
    )
  }

  // Custom active shape for hover effect
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  // If there's no data, show a message
  if (data.length === 0) {
    return (
      <div className="h-[350px] w-full">
        <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">Spending by Category</h3>
        <div className="h-[calc(100%-30px)] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-500">No spending data available for this time period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <h3 className="text-lg font-semibold mb-2 text-[#0F172A]">Spending by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 20, bottom: 30, left: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="amount"
            nameKey="category"
            onClick={(_, index) => {
              onCategoryClick(data[index].category)
            }}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            cursor="pointer"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage, index }) => {
              // Only show labels for segments with percentage > 8%
              if (percentage < 8) return null

              const RADIAN = Math.PI / 180
              const radius = outerRadius + 12
              const x = cx + radius * Math.cos(-midAngle * RADIAN)
              const y = cy + radius * Math.sin(-midAngle * RADIAN)

              return (
                <text
                  x={x}
                  y={y}
                  fill="#374151"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  fontSize="10"
                >
                  {data[index].formattedPercentage}
                </text>
              )
            }}
            labelLine={(props) => {
              const { cx, cy, midAngle, outerRadius, percentage } = props
              // Only show label lines for segments with percentage > 8%
              if (percentage < 8) return <></>  // Return empty fragment instead of null

              const RADIAN = Math.PI / 180
              const radius1 = outerRadius + 3
              const radius2 = outerRadius + 10
              const x1 = cx + radius1 * Math.cos(-midAngle * RADIAN)
              const y1 = cy + radius1 * Math.sin(-midAngle * RADIAN)
              const x2 = cx + radius2 * Math.cos(-midAngle * RADIAN)
              const y2 = cy + radius2 * Math.sin(-midAngle * RADIAN)

              return <path d={`M${x1},${y1}L${x2},${y2}`} stroke="#9CA3AF" fill="none" />
            }}
          >
            {data.map((entry, index) => {
              const colorArray = entry.type === "Need" ? NEED_COLORS : WANT_COLORS
              const colorIndex = index % colorArray.length
              return <Cell key={`cell-${index}`} fill={colorArray[colorIndex]} stroke="#fff" strokeWidth={1} />
            })}

            {/* Center label showing total */}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as { cx: number; cy: number }
                return (
                  <g>
                    <text x={cx} y={cy - 5} textAnchor="middle" fill="#111827" fontSize="14" fontWeight="bold">
                      Total
                    </text>
                    <text x={cx} y={cy + 15} textAnchor="middle" fill="#111827" fontSize="12">
                      {formatCurrency(total)}
                    </text>
                  </g>
                )
              }}
              position="center"
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
