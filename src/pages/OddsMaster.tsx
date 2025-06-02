import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Timer, Brain, Zap, Shield, Eye, LucideIcon } from 'lucide-react';
import GameStats from '@/components/GameStats';
import PowerUpPanel from '@/components/PowerUpPanel';
import ConfidenceBetting from '@/components/ConfidenceBetting';

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

interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: LucideIcon;
  active: boolean;
  uses: number;
}

const OddsMaster = () => {
  const [tokens, setTokens] = useState(1000);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { id: 'freeze', name: 'Freeze Timer', description: 'Stop the timer for 5 seconds', cost: 50, icon: Timer, active: false, uses: 3 },
    { id: 'hint', name: 'Remove Wrong Answer', description: 'Eliminate one incorrect option', cost: 75, icon: Eye, active: false, uses: 2 },
    { id: 'shield', name: 'Safety Net', description: 'Protect against token loss', cost: 100, icon: Shield, active: false, uses: 1 },
    { id: 'boost', name: 'Confidence Boost', description: 'Double your winnings for this round', cost: 150, icon: Zap, active: false, uses: 1 }
  ]);

  const { toast } = useToast();

  const generateMathProblem = useCallback((): MathProblem => {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, correctAnswer: number;
    
    switch (difficulty) {
      case 'easy':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        break;
      case 'medium':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 30) + 5;
        break;
      case 'hard':
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * 50) + 10;
        break;
    }

    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '×':
        correctAnswer = num1 * num2;
        break;
      case '÷':
        correctAnswer = Math.floor(num1 / num2);
        num1 = correctAnswer * num2; // Ensure clean division
        break;
      default:
        correctAnswer = num1 + num2;
    }

    // Generate wrong options
    const wrongOptions: number[] = [];
    while (wrongOptions.length < 2) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer !== correctAnswer && !wrongOptions.includes(wrongAnswer) && wrongAnswer > 0) {
        wrongOptions.push(wrongAnswer);
      }
    }

    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

    return {
      id: Date.now(),
      question: `${num1} ${operation} ${num2} = ?`,
      options,
      correctAnswer,
      difficulty,
      operation
    };
  }, [difficulty]);

  const startNewRound = useCallback(() => {
    const problem = generateMathProblem();
    setCurrentProblem(problem);
    setTimeRemaining(15);
    setIsGameActive(true);
    setSelectedAnswer(null);
    setBetAmount(0);
    setShowResult(false);
    
    // Reset power-up states for new round
    setPowerUps(prev => prev.map(p => ({ ...p, active: false })));
  }, [generateMathProblem]);

  const usePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp || powerUp.uses <= 0 || tokens < powerUp.cost) return;

    setTokens(prev => prev - powerUp.cost);
    
    switch (powerUpId) {
      case 'freeze':
        setTimeRemaining(prev => Math.min(prev + 5, 20));
        toast({
          title: "Timer Frozen! ❄️",
          description: "Added 5 seconds to the timer",
        });
        break;
      case 'hint':
        if (currentProblem) {
          const wrongOption = currentProblem.options.find(opt => opt !== currentProblem.correctAnswer);
          if (wrongOption) {
            setCurrentProblem(prev => prev ? {
              ...prev,
              options: prev.options.filter(opt => opt === prev.correctAnswer || opt !== wrongOption)
            } : null);
          }
        }
        toast({
          title: "Hint Activated! 👁️",
          description: "Removed one wrong answer",
        });
        break;
      case 'shield':
      case 'boost':
        setPowerUps(prev => prev.map(p => 
          p.id === powerUpId ? { ...p, active: true } : p
        ));
        toast({
          title: `${powerUp.name} Activated! ⚡`,
          description: powerUp.description,
        });
        break;
    }

    setPowerUps(prev => prev.map(p => 
      p.id === powerUpId ? { ...p, uses: p.uses - 1 } : p
    ));
  };

  const submitAnswer = () => {
    if (!currentProblem || selectedAnswer === null || betAmount === 0) return;

    setIsGameActive(false);
    setShowResult(true);
    
    const isCorrect = selectedAnswer === currentProblem.correctAnswer;
    const hasShield = powerUps.find(p => p.id === 'shield')?.active;
    const hasBoost = powerUps.find(p => p.id === 'boost')?.active;
    
    let tokensChange = 0;
    
    if (isCorrect) {
      let multiplier = confidenceLevel;
      if (hasBoost) multiplier *= 2;
      tokensChange = betAmount * multiplier;
      setStreak(prev => prev + 1);
    } else {
      tokensChange = hasShield ? 0 : -betAmount;
      setStreak(0);
    }

    setTokens(prev => prev + tokensChange);

    const session: GameSession = {
      id: Date.now(),
      problem: currentProblem,
      betAmount,
      confidenceLevel,
      timeRemaining,
      result: isCorrect ? 'correct' : 'incorrect',
      tokensWon: tokensChange,
      timestamp: new Date()
    };

    setGameHistory(prev => [session, ...prev]);

    // Difficulty scaling based on performance
    if (streak >= 3 && difficulty === 'easy') {
      setDifficulty('medium');
      toast({ title: "Difficulty Increased! 📈", description: "Moving to Medium difficulty" });
    } else if (streak >= 6 && difficulty === 'medium') {
      setDifficulty('hard');
      toast({ title: "Difficulty Increased! 🔥", description: "Moving to Hard difficulty" });
    }

    toast({
      title: isCorrect ? "Correct! 🎉" : "Incorrect 😔",
      description: `${tokensChange > 0 ? 'Won' : tokensChange < 0 ? 'Lost' : 'Protected'} ${Math.abs(tokensChange)} tokens`,
      variant: isCorrect ? "default" : "destructive"
    });

    setTimeout(() => {
      setRound(prev => prev + 1);
      startNewRound();
    }, 3000);
  };

  const handleTimeout = useCallback(() => {
    if (!isGameActive) return;
    
    setIsGameActive(false);
    setShowResult(true);
    setStreak(0);
    
    const hasShield = powerUps.find(p => p.id === 'shield')?.active;
    const tokensChange = hasShield ? 0 : -betAmount;
    setTokens(prev => prev + tokensChange);

    if (currentProblem) {
      const session: GameSession = {
        id: Date.now(),
        problem: currentProblem,
        betAmount,
        confidenceLevel,
        timeRemaining: 0,
        result: 'timeout',
        tokensWon: tokensChange,
        timestamp: new Date()
      };
      setGameHistory(prev => [session, ...prev]);
    }

    toast({
      title: "Time's Up! ⏰",
      description: `${tokensChange < 0 ? 'Lost' : 'Protected'} ${Math.abs(tokensChange)} tokens`,
      variant: "destructive"
    });

    setTimeout(() => {
      setRound(prev => prev + 1);
      startNewRound();
    }, 3000);
  }, [isGameActive, betAmount, confidenceLevel, currentProblem, powerUps]);

  // Timer effect
  useEffect(() => {
    if (!isGameActive || timeRemaining <= 0) {
      if (timeRemaining <= 0 && isGameActive) {
        handleTimeout();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, isGameActive, handleTimeout]);

  // Initialize first problem
  useEffect(() => {
    startNewRound();
  }, []);

  const accuracyRate = gameHistory.length > 0 
    ? (gameHistory.filter(g => g.result === 'correct').length / gameHistory.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
            <Brain className="w-8 h-8" />
            OddsMaster
          </h1>
          <p className="text-purple-200">Math Puzzle Meets Strategic Betting</p>
        </div>

        {/* Game Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-white/70 text-sm">Tokens</p>
                <p className="text-2xl font-bold text-green-400">{tokens.toLocaleString()} 🪙</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-white/70 text-sm">Round</p>
                <p className="text-2xl font-bold text-blue-400">{round}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-white/70 text-sm">Streak</p>
                <p className="text-2xl font-bold text-orange-400">{streak} 🔥</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-white/70 text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-purple-400">{accuracyRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Problem */}
            {currentProblem && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Badge variant="secondary" className={`${
                        difficulty === 'easy' ? 'bg-green-500' : 
                        difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      } text-white`}>
                        {difficulty.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-white" />
                      <Badge variant={timeRemaining <= 5 ? "destructive" : "default"}>
                        {timeRemaining}s
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(timeRemaining / 15) * 100} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">{currentProblem.question}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {currentProblem.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={selectedAnswer === option ? "default" : "outline"}
                          className={`h-16 text-xl ${
                            selectedAnswer === option 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                          }`}
                          onClick={() => setSelectedAnswer(option)}
                          disabled={!isGameActive || showResult}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {showResult && (
                      <div className="text-center p-4 rounded-lg bg-black/20">
                        <p className="text-lg text-white">
                          Correct Answer: <span className="font-bold text-green-400">{currentProblem.correctAnswer}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Betting Panel */}
            <ConfidenceBetting
              tokens={tokens}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              confidenceLevel={confidenceLevel}
              setConfidenceLevel={setConfidenceLevel}
              onSubmit={submitAnswer}
              disabled={!isGameActive || selectedAnswer === null || showResult}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Power-ups */}
            <PowerUpPanel
              powerUps={powerUps}
              tokens={tokens}
              onUsePowerUp={usePowerUp}
              disabled={!isGameActive || showResult}
            />

            {/* Game Statistics */}
            <GameStats gameHistory={gameHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OddsMaster;
