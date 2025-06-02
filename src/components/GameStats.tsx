import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, TrendingUp, Target, Clock, Zap } from 'lucide-react';

interface MathProblem {
  id: number;
  question: string;
  options: number[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  operation: string;
}

interface GameSession {
  id: number;
  problem: MathProblem;
  betAmount: number;
  confidenceLevel: number;
  timeRemaining: number;
  result: 'correct' | 'incorrect' | 'timeout' | null;
  tokensWon: number;
  timestamp: Date;
}

interface GameStatsProps {
  gameHistory: GameSession[];
}

const GameStats = ({ gameHistory }: GameStatsProps) => {
  if (gameHistory.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-white/70">📊 Statistics will appear after playing!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalGames = gameHistory.length;
  const correctAnswers = gameHistory.filter(g => g.result === 'correct').length;
  const accuracyRate = (correctAnswers / totalGames) * 100;
  const totalTokensWon = gameHistory.reduce((sum, game) => sum + game.tokensWon, 0);
  const avgConfidence = gameHistory.reduce((sum, game) => sum + game.confidenceLevel, 0) / totalGames;
  const avgTimeUsed = gameHistory.reduce((sum, game) => sum + (15 - game.timeRemaining), 0) / totalGames;

  // Performance by difficulty
  const difficultyStats = ['easy', 'medium', 'hard'].map(diff => {
    const games = gameHistory.filter(g => g.problem.difficulty === diff);
    const correct = games.filter(g => g.result === 'correct').length;
    return {
      difficulty: diff,
      total: games.length,
      correct,
      accuracy: games.length > 0 ? (correct / games.length) * 100 : 0
    };
  });

  // Performance by operation
  const operationStats = ['+', '-', '×', '÷'].map(op => {
    const games = gameHistory.filter(g => g.problem.operation === op);
    const correct = games.filter(g => g.result === 'correct').length;
    return {
      operation: op,
      total: games.length,
      correct,
      accuracy: games.length > 0 ? (correct / games.length) * 100 : 0
    };
  });

  const formatTime = (seconds: number) => `${seconds.toFixed(1)}s`;

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Game Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Target className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-400">{accuracyRate.toFixed(1)}%</div>
            <div className="text-xs text-white/70">Accuracy</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-400">
              {totalTokensWon > 0 ? '+' : ''}{totalTokensWon.toLocaleString()}
            </div>
            <div className="text-xs text-white/70">Net Tokens</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Zap className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-400">{avgConfidence.toFixed(1)}x</div>
            <div className="text-xs text-white/70">Avg Confidence</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-orange-400">{formatTime(avgTimeUsed)}</div>
            <div className="text-xs text-white/70">Avg Time Used</div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm">Performance by Difficulty</h4>
          {difficultyStats.map(stat => (
            <div key={stat.difficulty} className="flex items-center justify-between bg-black/20 rounded p-2">
              <span className="text-white capitalize text-sm">{stat.difficulty}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-xs">{stat.correct}/{stat.total}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    stat.accuracy >= 70 ? 'bg-green-500' : 
                    stat.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white`}
                >
                  {stat.accuracy.toFixed(0)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Operation Breakdown */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm">Performance by Operation</h4>
          {operationStats.filter(stat => stat.total > 0).map(stat => (
            <div key={stat.operation} className="flex items-center justify-between bg-black/20 rounded p-2">
              <span className="text-white text-sm">{stat.operation}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-xs">{stat.correct}/{stat.total}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    stat.accuracy >= 70 ? 'bg-green-500' : 
                    stat.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white`}
                >
                  {stat.accuracy.toFixed(0)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Games */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm">Recent Games</h4>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {gameHistory.slice(0, 10).map(game => (
                <div 
                  key={game.id} 
                  className={`flex items-center justify-between p-2 rounded text-xs ${
                    game.result === 'correct' 
                      ? 'bg-green-500/20 border-green-400/30' 
                      : 'bg-red-500/20 border-red-400/30'
                  } border`}
                >
                  <span className="text-white">{game.problem.question}</span>
                  <Badge 
                    variant={game.result === 'correct' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {game.tokensWon > 0 ? '+' : ''}{game.tokensWon}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;
