'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ClaimPieChartProps {
  claimType: 'sc' | 'bc'
  setClaimTypeAction: React.Dispatch<React.SetStateAction<'sc' | 'bc'>>
  selectedClaims: string[]
  setSelectedClaimsAction: React.Dispatch<React.SetStateAction<string[]>>
  availableClaims: string[]
  pieChartData: {
    name: string
    value: number
    color: string
  }[]
}

export function ClaimPieChart({
  claimType,
  setClaimTypeAction,
  selectedClaims,
  setSelectedClaimsAction,
  availableClaims,
  pieChartData
}: ClaimPieChartProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Type Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[140px] justify-between">
                {claimType === 'sc' ? 'Subclaims' : 'Broad Claims'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[140px] max-w-[100%]">
              <DropdownMenuItem onSelect={() => setClaimTypeAction('sc')}>
                Subclaims
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setClaimTypeAction('bc')}>
                Broad Claims
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Claims Filter Dropdown */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm font-medium">Claim:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[180px] max-w-full justify-between truncate"
              >
                {selectedClaims.length > 0
                  ? `${selectedClaims.length} selected`
                  : "Select Claims"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] max-w-[100%] max-h-60 overflow-auto">
              {availableClaims.map(claim => (
                <DropdownMenuItem
                  key={claim}
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={claim}
                    checked={selectedClaims.includes(claim)}
                    onCheckedChange={(checked) => {
                      setSelectedClaimsAction(prev =>
                        checked
                          ? [...prev, claim]
                          : prev.filter(c => c !== claim)
                      )
                    }}
                  />
                  <Label htmlFor={claim} className="capitalize truncate">
                    {claim.replace(/_/g, ' ')}
                  </Label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pie Chart */}
      {selectedClaims.length > 0 && pieChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              dataKey="value"
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ value }) => `${value}`}
              labelLine={false}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-muted-foreground text-center pt-6 text-sm break-words">
          Select claims to see data
        </div>
      )}
    </div>
  )
}
