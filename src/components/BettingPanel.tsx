
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Animal } from '@/pages/Index';

interface BettingPanelProps {
  animals: Animal[];
  onPlaceBet: (animalId: number, amount: number) => void;
  isRacing: boolean;
  balance: number;
}

const BettingPanel = ({ animals, onPlaceBet, isRacing, balance }: BettingPanelProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [betAmount, setBetAmount] = useState('');

  const quickBetAmounts = [10, 50, 100, 250];

  const handlePlaceBet = () => {
    if (!selectedAnimal || !betAmount) return;
    
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    onPlaceBet(selectedAnimal.id, amount);
    setBetAmount('');
    setSelectedAnimal(null);
  };

  const getOdds = (probability: number) => {
    return (1 / probability).toFixed(1);
  };

  const getPotentialWinnings = () => {
    if (!selectedAnimal || !betAmount) return 0;
    const amount = parseInt(betAmount);
    if (isNaN(amount)) return 0;
    return Math.round(amount / selectedAnimal.probability);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Place Your Bet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Animal Selection */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Choose Your Champion:</h3>
          <div className="grid gap-3">
            {animals.map(animal => (
              <button
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                disabled={isRacing}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  selectedAnimal?.id === animal.id
                    ? 'border-yellow-400 bg-white/20'
                    : 'border-white/30 bg-white/10 hover:bg-white/15'
                } ${isRacing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{animal.emoji}</span>
                    <div className="text-left">
                      <p className="text-white font-semibold text-lg">{animal.name}</p>
                      <p className="text-white/70 text-sm">
                        Win Rate: {(animal.probability * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary" 
                      className={`bg-gradient-to-r ${animal.color} text-white font-semibold`}
                    >
                      {getOdds(animal.probability)}x
                    </Badge>
                    <p className="text-white/70 text-xs mt-1">
                      {animal.wins} wins
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Betting Amount */}
        {selectedAnimal && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Bet Amount:</h3>
            
            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickBetAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount.toString())}
                  disabled={isRacing || amount > balance}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {amount}
                </Button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Enter bet amount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isRacing}
                min="1"
                max={balance}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
              />
              <div className="flex justify-between text-sm text-white/70">
                <span>Available: {balance.toLocaleString()} 🪙</span>
                <span>Max bet: {balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Potential Winnings */}
            {betAmount && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Potential Winnings:</span>
                  <span className="text-green-400 font-semibold text-lg">
                    {getPotentialWinnings().toLocaleString()} 🪙
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Odds:</span>
                  <span className="text-yellow-400">
                    {getOdds(selectedAnimal.probability)}x
                  </span>
                </div>
              </div>
            )}

            {/* Place Bet Button */}
            <Button
              onClick={handlePlaceBet}
              disabled={!betAmount || isRacing || parseInt(betAmount) > balance || parseInt(betAmount) <= 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 text-lg"
            >
              {isRacing ? '🏃‍♂️ Race in Progress...' : '🎯 Place Bet'}
            </Button>
          </div>
        )}

        {!selectedAnimal && !isRacing && (
          <div className="text-center py-8">
            <p className="text-white/70 text-lg">👆 Select an animal to start betting!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BettingPanel;
