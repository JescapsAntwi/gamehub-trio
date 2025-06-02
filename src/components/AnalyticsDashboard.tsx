
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface Transaction {
  id: string;
  turn: number;
  game: string;
  betAmount: number;
  result: 'win' | 'loss';
  payout: number;
  balance: number;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AnalyticsDashboardProps {
  bankrollHistory: Array<{ turn: number; balance: number }>;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  transactions: Transaction[];
  chartConfig: any;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  bankrollHistory,
  riskDistribution,
  transactions,
  chartConfig
}) => {
  // Game performance data
  const gamePerformance = transactions.reduce((acc, t) => {
    if (!acc[t.game]) {
      acc[t.game] = { wins: 0, losses: 0, totalBet: 0, totalWon: 0 };
    }
    acc[t.game][t.result === 'win' ? 'wins' : 'losses']++;
    acc[t.game].totalBet += t.betAmount;
    if (t.result === 'win') acc[t.game].totalWon += t.payout;
    return acc;
  }, {} as Record<string, { wins: number; losses: number; totalBet: number; totalWon: number }>);

  const gamePerformanceData = Object.entries(gamePerformance).map(([game, stats]) => ({
    game,
    winRate: stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0,
    profit: stats.totalWon - stats.totalBet,
    games: stats.wins + stats.losses
  }));

  // Turn-by-turn P&L
  const pnlData = bankrollHistory.slice(1).map((point, index) => ({
    turn: point.turn,
    pnl: point.balance - 500,
    cumulative: point.balance,
    // Add color indicator for positive/negative
    color: point.balance - 500 >= 0 ? '#10b981' : '#ef4444'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bankroll History Chart */}
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Bankroll History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bankrollHistory}>
                <XAxis 
                  dataKey="turn" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Game Performance */}
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Game Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gamePerformanceData}>
                <XAxis 
                  dataKey="game" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="winRate" fill="#10b981" name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* P&L Chart */}
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profit & Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlData}>
                <XAxis 
                  dataKey="turn" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="pnl" 
                  fill="#10b981"
                  name="P&L"
                >
                  {/* Use Cell to apply different colors for positive/negative values */}
                  {pnlData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
