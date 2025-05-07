import { formatCurrency } from "../lib/transactionsLoader"
import { CheckCircle, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface KpiCardsProps {
  totalSpentThisMonth: number
  totalSpentToday: number
  totalSpentYesterday: number
  highestCategory: { category: string; amount: number }
  surplusDeficit: number
  streak: number
}

export function KpiCards({
  totalSpentThisMonth,
  totalSpentToday,
  totalSpentYesterday,
  highestCategory,
  surplusDeficit,
  streak,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Spent This Month */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Spent This Month</h3>
                  <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(totalSpentThisMonth)}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total of all transactions this month</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Card 2: Spent Today / Yesterday */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Recent Spending</h3>
                  <div className="mt-1">
                    <p className="text-lg font-semibold text-[#111827]">Today: {formatCurrency(totalSpentToday)}</p>
                    <p className="text-sm font-medium text-gray-500">
                      Yesterday: {formatCurrency(totalSpentYesterday)}
                    </p>
                    {totalSpentToday > 0 && (
                      <p className="text-xs text-gray-400 mt-1">*Today includes fixed expenses</p>
                    )}
                  </div>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Spending for today and yesterday. Fixed expenses are only included in today's total.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Card 3: Highest Category */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Highest Category</h3>
                  <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(highestCategory.amount)}</p>
                  <p className="text-sm font-medium text-gray-500">{highestCategory.category}</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Category with the highest spending this month</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Card 4: Surplus / Deficit */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget Status</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-2xl font-bold ${surplusDeficit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(Math.abs(surplusDeficit))}
                    </p>
                    {surplusDeficit >= 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {surplusDeficit >= 0 ? "Surplus" : "Deficit"}
                    {streak > 1 && surplusDeficit >= 0 && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        Streak: {streak}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`${surplusDeficit >= 0 ? "bg-green-100" : "bg-red-100"} p-2 rounded-full`}>
                  <DollarSign className={`h-5 w-5 ${surplusDeficit >= 0 ? "text-green-600" : "text-red-600"}`} />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total budget minus total spent this month</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
