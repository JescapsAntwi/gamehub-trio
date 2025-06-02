
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Coins, Dice1, RotateCcw, Brain, AlertTriangle } from 'lucide-react';

interface BankrollGameSelectorProps {
  onGameResult: (game: string, betAmount: number, result: 'win' | 'loss', payout: number, riskLevel: 'low' | 'medium' | 'high') => void;
  bankroll: number;
  selectedGame: string | null;
  setSelectedGame: (game: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const BankrollGameSelector: React.FC<BankrollGameSelectorProps> = ({
  onGameResult,
  bankroll,
  selectedGame,
  setSelectedGame,
  isPlaying,
  setIsPlaying
}) => {
  const [betAmount, setBetAmount] = useState(50);
  const [coinChoice, setCoinChoice] = useState<'heads' | 'tails'>('heads');
  const [rouletteChoice, setRouletteChoice] = useState<'red' | 'black' | 'green'>('red');
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const quizQuestions = [
    { question: "What is 15 × 8?", answer: "120", difficulty: "medium" },
    { question: "Capital of Australia?", answer: "canberra", difficulty: "medium" },
    { question: "What year did WWII end?", answer: "1945", difficulty: "easy" },
    { question: "Square root of 144?", answer: "12", difficulty: "easy" },
    { question: "Chemical symbol for gold?", answer: "au", difficulty: "hard" }
  ];

  const games = [
    {
      id: 'coinflip',
      name: 'Coin Flip',
      icon: Coins,
      description: 'Double or nothing - 50% chance to win',
      riskLevel: 'low' as const,
      multiplier: 2.0,
      winChance: 50
    },
    {
      id: 'roulette',
      name: 'Mini Roulette',
      icon: RotateCcw,
      description: 'Red/Black pays 2x, Green pays 10x',
      riskLevel: 'medium' as const,
      multiplier: 2.0,
      winChance: 45
    },
    {
      id: 'quiz',
      name: 'Knowledge Quiz',
      icon: Brain,
      description: 'Answer correctly for 3x payout',
      riskLevel: 'high' as const,
      multiplier: 3.0,
      winChance: 70
    }
  ];

  const playCoinFlip = () => {
    setIsPlaying(true);
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = result === coinChoice;
      onGameResult(
        'Coin Flip',
        betAmount,
        won ? 'win' : 'loss',
        won ? betAmount * 2 : 0,
        'low'
      );
    }, 1500);
  };

  const playRoulette = () => {
    setIsPlaying(true);
    setTimeout(() => {
      const outcomes = ['red', 'black', 'red', 'black', 'red', 'black', 'green'];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      const won = result === rouletteChoice;
      const multiplier = rouletteChoice === 'green' ? 10 : 2;
      
      onGameResult(
        'Mini Roulette',
        betAmount,
        won ? 'win' : 'loss',
        won ? betAmount * multiplier : 0,
        'medium'
      );
    }, 2000);
  };

  const playQuiz = () => {
    setIsPlaying(true);
    setTimeout(() => {
      const question = quizQuestions[currentQuestion];
      const won = quizAnswer.toLowerCase().trim() === question.answer.toLowerCase();
      
      onGameResult(
        'Knowledge Quiz',
        betAmount,
        won ? 'win' : 'loss',
        won ? betAmount * 3 : 0,
        'high'
      );
      
      setCurrentQuestion((prev) => (prev + 1) % quizQuestions.length);
      setQuizAnswer('');
    }, 1000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Bet Amount Selector */}
      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
        <label className="text-white font-medium">Bet Amount:</label>
        <Input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Math.max(1, Math.min(bankroll, parseInt(e.target.value) || 0)))}
          className="w-32 bg-black/20 border-gray-600 text-white"
          min={1}
          max={bankroll}
        />
        <div className="flex gap-2">
          {[25, 50, 100, 200].map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(Math.min(amount, bankroll))}
              disabled={amount > bankroll}
              className="text-xs"
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Card
              key={game.id}
              className={`cursor-pointer transition-all bg-black/20 border-gray-600 hover:border-blue-400 ${
                selectedGame === game.id ? 'border-blue-400 bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {game.name}
                </CardTitle>
                <Badge variant="outline" className={getRiskColor(game.riskLevel)}>
                  {game.riskLevel.toUpperCase()} RISK
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-2">{game.description}</p>
                <div className="text-xs text-gray-400">
                  <div>Win Chance: ~{game.winChance}%</div>
                  <div>Multiplier: {game.multiplier}x</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Game Interface */}
      {selectedGame && (
        <Card className="bg-black/30 border-blue-500">
          <CardHeader>
            <CardTitle className="text-white">
              {games.find(g => g.id === selectedGame)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedGame === 'coinflip' && (
              <div className="space-y-4">
                <div className="flex gap-4 justify-center">
                  <Button
                    variant={coinChoice === 'heads' ? 'default' : 'outline'}
                    onClick={() => setCoinChoice('heads')}
                    disabled={isPlaying}
                  >
                    Heads
                  </Button>
                  <Button
                    variant={coinChoice === 'tails' ? 'default' : 'outline'}
                    onClick={() => setCoinChoice('tails')}
                    disabled={isPlaying}
                  >
                    Tails
                  </Button>
                </div>
                <Button
                  onClick={playCoinFlip}
                  disabled={isPlaying || betAmount > bankroll}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? 'Flipping...' : `Bet ${betAmount} tokens on ${coinChoice}`}
                </Button>
              </div>
            )}

            {selectedGame === 'roulette' && (
              <div className="space-y-4">
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    variant={rouletteChoice === 'red' ? 'default' : 'outline'}
                    onClick={() => setRouletteChoice('red')}
                    disabled={isPlaying}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Red (2x)
                  </Button>
                  <Button
                    variant={rouletteChoice === 'black' ? 'default' : 'outline'}
                    onClick={() => setRouletteChoice('black')}
                    disabled={isPlaying}
                    className="bg-gray-800 hover:bg-gray-900"
                  >
                    Black (2x)
                  </Button>
                  <Button
                    variant={rouletteChoice === 'green' ? 'default' : 'outline'}
                    onClick={() => setRouletteChoice('green')}
                    disabled={isPlaying}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Green (10x)
                  </Button>
                </div>
                <Button
                  onClick={playRoulette}
                  disabled={isPlaying || betAmount > bankroll}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? 'Spinning...' : `Bet ${betAmount} tokens on ${rouletteChoice}`}
                </Button>
              </div>
            )}

            {selectedGame === 'quiz' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Question:</h3>
                  <p className="text-gray-300">{quizQuestions[currentQuestion].question}</p>
                </div>
                <Input
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  placeholder="Your answer..."
                  disabled={isPlaying}
                  className="bg-black/20 border-gray-600 text-white"
                />
                <Button
                  onClick={playQuiz}
                  disabled={isPlaying || !quizAnswer.trim() || betAmount > bankroll}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? 'Checking...' : `Submit Answer (Bet ${betAmount} tokens)`}
                </Button>
              </div>
            )}

            {betAmount > bankroll && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Insufficient funds
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankrollGameSelector;
