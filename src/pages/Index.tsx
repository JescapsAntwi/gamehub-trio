import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RaceAnimation from '@/components/RaceAnimation';
import BettingPanel from '@/components/BettingPanel';
import BettingHistory from '@/components/BettingHistory';
import StatsPanel from '@/components/StatsPanel';
import GameStats from '@/components/GameStats';
import PowerUpPanel from '@/components/PowerUpPanel';
import ConfidenceBetting from '@/components/ConfidenceBetting';
import { useToast } from '@/hooks/use-toast';
import { House, Trophy, Zap, Clock, Calculator } from 'lucide-react';

export interface Animal {
  id: number;
  name: string;
  emoji: string;
  probability: number;
  wins: number;
  color: string;
}

export interface Bet {
  id: number;
  animal: Animal;
  amount: number;
  result: 'win' | 'lose';
  winnings: number;
  timestamp: Date;
  winner?: Animal;
}

const Index = () => {
  const [animals] = useState<Animal[]>([
    { id: 1, name: 'Lion', emoji: '🦁', probability: 0.5, wins: 0, color: 'from-yellow-500 to-orange-500' },
    { id: 2, name: 'Cheetah', emoji: '🐆', probability: 0.3, wins: 0, color: 'from-yellow-400 to-amber-500' },
    { id: 3, name: 'Wolf', emoji: '🐺', probability: 0.2, wins: 0, color: 'from-gray-500 to-gray-700' }
  ]);

  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [raceResult, setRaceResult] = useState<Animal | null>(null);
  const [updatedAnimals, setUpdatedAnimals] = useState<Animal[]>(animals);

  const { toast } = useToast();

  const selectWinner = () => {
    const random = Math.random();
    let cumulative = 0;
    
    for (const animal of animals) {
      cumulative += animal.probability;
      if (random <= cumulative) {
        return animal;
      }
    }
    return animals[0];
  };

  const placeBet = (animalId: number, amount: number) => {
    if (amount > balance) {
      toast({
        title: "Insufficient Balance! 💸",
        description: "You don't have enough tokens for this bet.",
        variant: "destructive"
      });
      return;
    }

    if (isRacing) {
      toast({
        title: "Race in Progress! 🏃‍♂️",
        description: "Wait for the current race to finish.",
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev - amount);
    
    setIsRacing(true);
    setRaceResult(null);

    // Simulate race duration
    setTimeout(() => {
      const winner = selectWinner();
      setRaceResult(winner);
      
      // Update animal wins
      setUpdatedAnimals(prev => 
        prev.map(animal => 
          animal.id === winner.id 
            ? { ...animal, wins: animal.wins + 1 }
            : animal
        )
      );

      const animal = animals.find(a => a.id === animalId)!;
      const isWin = winner.id === animalId;
      const winnings = isWin ? Math.floor(amount / animal.probability) : 0;
      
      if (isWin) {
        setBalance(prev => prev + winnings);
      }

      const bet: Bet = {
        id: Date.now(),
        animal,
        amount,
        result: isWin ? 'win' : 'lose',
        winnings: isWin ? winnings : 0,
        timestamp: new Date(),
        winner
      };

      setBets(prev => [bet, ...prev]);

      toast({
        title: isWin ? "Congratulations! 🎉" : "Better luck next time! 😔",
        description: isWin 
          ? `${winner.emoji} ${winner.name} won! You earned ${winnings.toLocaleString()} tokens!`
          : `${winner.emoji} ${winner.name} won! You lost ${amount.toLocaleString()} tokens.`,
        variant: isWin ? "default" : "destructive"
      });

      setIsRacing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🏇 Animal Racing Arena
          </h1>
          <p className="text-gray-300 text-lg">Place your bets and watch the excitement unfold!</p>
          
          {/* Navigation to other games */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/oddsmaster">
              <Button variant="outline" className="bg-emerald-600/20 border-emerald-400 text-emerald-400 hover:bg-emerald-600/30">
                <Zap className="w-4 h-4 mr-2" />
                Odds Master
              </Button>
            </Link>
            <Link to="/bankroll-manager">
              <Button variant="outline" className="bg-blue-600/20 border-blue-400 text-blue-400 hover:bg-blue-600/30">
                <Calculator className="w-4 h-4 mr-2" />
                Bankroll Manager
              </Button>
            </Link>
          </div>
        </div>

        {/* Balance Display */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-white/70 text-lg">Your Balance</p>
              <p className="text-4xl font-bold text-green-400">{balance.toLocaleString()} 🪙</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Race Animation */}
            <RaceAnimation 
              animals={updatedAnimals} 
              isRacing={isRacing} 
              winner={raceResult} 
            />

            {/* Betting Panel */}
            <BettingPanel 
              animals={updatedAnimals} 
              onPlaceBet={placeBet} 
              balance={balance}
              isRacing={isRacing}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Statistics */}
            <StatsPanel animals={updatedAnimals} />
            
            {/* Betting History */}
            <BettingHistory bets={bets} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
