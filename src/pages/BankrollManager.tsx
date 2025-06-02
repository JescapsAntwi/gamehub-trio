
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Coins, TrendingUp, Target, Clock, DollarSign, BarChart3 } from 'lucide-react';
import BankrollGameSelector from '@/components/BankrollGameSelector';
import TransactionHistory from '@/components/TransactionHistory';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

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

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalBet: number;
  totalWon: number;
  winRate: number;
  averageRisk: number;
}

const BankrollManager = () => {
  const [bankroll, setBankroll] = useState(500);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxTurns = 10;
  const breakEvenTarget = 500;

  // Calculate game statistics
  const gameStats: GameStats = {
    totalGames: transactions.length,
    wins: transactions.filter(t => t.result === 'win').length,
    losses: transactions.filter(t => t.result === 'loss').length,
    totalBet: transactions.reduce((sum, t) => sum + t.betAmount, 0),
    totalWon: transactions.reduce((sum, t) => sum + (t.result === 'win' ? t.payout : 0), 0),
    winRate: transactions.length > 0 ? (transactions.filter(t => t.result === 'win').length / transactions.length) * 100 : 0,
    averageRisk: transactions.length > 0 ? transactions.reduce((sum, t) => {
      const riskValue = t.riskLevel === 'low' ? 1 : t.riskLevel === 'medium' ? 2 : 3;
      return sum + riskValue;
    }, 0) / transactions.length : 0
  };

  // Bankroll history for chart
  const bankrollHistory = [
    { turn: 0, balance: 500 },
    ...transactions.map(t => ({ turn: t.turn, balance: t.balance }))
  ];

  // Risk distribution for pie chart
  const riskDistribution = [
    { name: 'Low Risk', value: transactions.filter(t => t.riskLevel === 'low').length, color: '#10b981' },
    { name: 'Medium Risk', value: transactions.filter(t => t.riskLevel === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: transactions.filter(t => t.riskLevel === 'high').length, color: '#ef4444' }
  ];

  const handleGameResult = (game: string, betAmount: number, result: 'win' | 'loss', payout: number, riskLevel: 'low' | 'medium' | 'high') => {
    const newBalance = result === 'win' ? bankroll + payout : bankroll - betAmount;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      turn: currentTurn,
      game,
      betAmount,
      result,
      payout: result === 'win' ? payout : 0,
      balance: newBalance,
      timestamp: new Date(),
      riskLevel
    };

    setTransactions(prev => [...prev, transaction]);
    setBankroll(newBalance);
    setCurrentTurn(prev => prev + 1);
    setSelectedGame(null);
    setIsPlaying(false);

    // Check win/loss conditions
    if (currentTurn >= maxTurns) {
      setGameOver(true);
      setGameWon(newBalance >= breakEvenTarget);
    } else if (newBalance <= 0) {
      setGameOver(true);
      setGameWon(false);
    }
  };

  const resetGame = () => {
    setBankroll(500);
    setCurrentTurn(1);
    setTransactions([]);
    setGameOver(false);
    setGameWon(false);
    setSelectedGame(null);
    setIsPlaying(false);
  };

  const chartConfig = {
    balance: {
      label: "Balance",
      color: "#3b82f6",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            💰 Bankroll Manager
          </h1>
          <p className="text-gray-300 text-lg">Strategic Budgeting Challenge</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Coins className="w-4 h-4 mr-1" />
              Balance: {bankroll} tokens
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              <Clock className="w-4 h-4 mr-1" />
              Turn: {currentTurn}/{maxTurns}
            </Badge>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Target className="w-4 h-4 mr-1" />
              Target: {breakEvenTarget}+ tokens
            </Badge>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <Card className="bg-black/50 border-2 border-yellow-400">
            <CardContent className="text-center py-8">
              <h2 className="text-3xl font-bold mb-4 text-white">
                {gameWon ? '🎉 Victory!' : '💸 Game Over'}
              </h2>
              <p className="text-gray-300 mb-4">
                {gameWon 
                  ? `Congratulations! You finished with ${bankroll} tokens and stayed above break-even!`
                  : `You ended with ${bankroll} tokens. Better luck next time!`
                }
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-400">Final Stats:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>Win Rate: {gameStats.winRate.toFixed(1)}%</div>
                  <div>Total Bet: {gameStats.totalBet} tokens</div>
                  <div>Games Played: {gameStats.totalGames}</div>
                  <div>Net P&L: {bankroll - 500} tokens</div>
                </div>
              </div>
              <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}

        {!gameOver && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Selection Panel */}
            <div className="lg:col-span-2">
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Game Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BankrollGameSelector
                    onGameResult={handleGameResult}
                    bankroll={bankroll}
                    selectedGame={selectedGame}
                    setSelectedGame={setSelectedGame}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Bankroll Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(bankroll / breakEvenTarget) * 100} 
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-400">
                    {bankroll >= breakEvenTarget ? 'Above target!' : `${breakEvenTarget - bankroll} tokens to go`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400">{gameStats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Games:</span>
                    <span className="text-blue-400">{gameStats.totalGames}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Bet:</span>
                    <span className="text-purple-400">{gameStats.totalBet}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Net P&L:</span>
                    <span className={bankroll >= 500 ? 'text-green-400' : 'text-red-400'}>
                      {bankroll - 500 > 0 ? '+' : ''}{bankroll - 500}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20">
            <TabsTrigger value="history">Transaction History</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <TransactionHistory transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="charts">
            <AnalyticsDashboard 
              bankrollHistory={bankrollHistory}
              riskDistribution={riskDistribution}
              transactions={transactions}
              chartConfig={chartConfig}
            />
          </TabsContent>
          
          <TabsContent value="insights">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-900/20 rounded-lg">
                    <h3 className="text-blue-400 font-semibold mb-2">Risk Management</h3>
                    <p className="text-sm text-gray-300">
                      Average risk level: {gameStats.averageRisk.toFixed(1)}/3.0
                      {gameStats.averageRisk > 2.5 && " - Consider more conservative bets"}
                      {gameStats.averageRisk < 1.5 && " - You could take slightly more risk"}
                    </p>
                  </div>
                  <div className="p-4 bg-green-900/20 rounded-lg">
                    <h3 className="text-green-400 font-semibold mb-2">Performance</h3>
                    <p className="text-sm text-gray-300">
                      {gameStats.winRate > 60 ? "Excellent" : gameStats.winRate > 40 ? "Good" : "Needs improvement"} win rate
                      {gameStats.winRate < 40 && " - Focus on lower risk games"}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-900/20 rounded-lg">
                    <h3 className="text-purple-400 font-semibold mb-2">Bankroll Health</h3>
                    <p className="text-sm text-gray-300">
                      {bankroll > 600 ? "Strong position" : bankroll > 400 ? "Stable" : "Risky"} 
                      {bankroll < 300 && " - Consider smaller bets"}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <h3 className="text-yellow-400 font-semibold mb-2">Strategy Tip</h3>
                    <p className="text-sm text-gray-300">
                      {currentTurn <= 3 ? "Early game - establish momentum" : 
                       currentTurn <= 7 ? "Mid game - maintain balance" : 
                       "End game - secure your position"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BankrollManager;
