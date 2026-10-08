import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  delta: number;
  trendData: number[];
  prefix?: string;
  suffix?: string;
  formatValue?: (val: number) => string;
}

export function KpiCard({ title, value, delta, trendData, prefix = "", suffix = "", formatValue }: KpiCardProps) {
  const isPositive = delta >= 0;
  const chartData = trendData.map((val, i) => ({ i, val }));
  
  const formattedValue = formatValue 
    ? formatValue(Number(value))
    : `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">{formattedValue}</div>
            <p className={cn("text-xs flex items-center mt-1", isPositive ? "text-green-600" : "text-red-600")}>
              {isPositive ? "+" : ""}{delta.toFixed(1)}% vs LY
            </p>
          </div>
          <div className="h-[40px] w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
