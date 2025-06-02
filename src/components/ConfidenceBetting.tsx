
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface ConfidenceBettingProps {
  tokens: number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  confidenceLevel: number;
  setConfidenceLevel: (level: number) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const ConfidenceBetting = ({
  tokens,
  betAmount,
  setBetAmount,
  confidenceLevel,
  setConfidenceLevel,
  onSubmit,
  disabled
}: ConfidenceBettingProps) => {
  const maxBet = Math.min(tokens, 500);
  const potentialWin = betAmount * confidenceLevel;
  
  const confidenceLevels = [
    { value: 1, label: 'Low Risk', color: 'bg-green-500', multiplier: '1x' },
    { value: 2, label: 'Medium Risk', color: 'bg-yellow-500', multiplier: '2x' },
    { value: 3, label: 'High Risk', color: 'bg-orange-500', multiplier: '3x' },
    { value: 5, label: 'Extreme Risk', color: 'bg-red-500', multiplier: '5x' }
  ];

  const quickBetAmounts = [50, 100, 200, Math.floor(maxBet / 2)];

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Confidence Betting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bet Amount */}
        <div className="space-y-3">
          <Label className="text-white">Bet Amount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.min(Math.max(0, parseInt(e.target.value) || 0), maxBet))}
              placeholder="Enter bet amount"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              max={maxBet}
              disabled={disabled}
            />
            <Button
              variant="outline"
              onClick={() => setBetAmount(maxBet)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={disabled}
            >
              Max
            </Button>
          </div>
          
          {/* Quick Bet Buttons */}
          <div className="flex gap-2">
            {quickBetAmounts.map(amount => (
              <Button
                key={amount}
                variant="ghost"
                size="sm"
                onClick={() => setBetAmount(Math.min(amount, maxBet))}
                className="bg-white/5 text-white hover:bg-white/15"
                disabled={disabled}
              >
                {amount} 🪙
              </Button>
            ))}
          </div>
        </div>

        {/* Confidence Level */}
        <div className="space-y-3">
          <Label className="text-white">Confidence Level</Label>
          <div className="grid grid-cols-2 gap-2">
            {confidenceLevels.map(level => (
              <Button
                key={level.value}
                variant={confidenceLevel === level.value ? "default" : "outline"}
                onClick={() => setConfidenceLevel(level.value)}
                className={`h-auto p-3 ${
                  confidenceLevel === level.value
                    ? `${level.color} text-white`
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                disabled={disabled}
              >
                <div className="text-center">
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm opacity-90">{level.multiplier}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Potential Winnings */}
        {betAmount > 0 && (
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Potential Win:</span>
              <span className="text-green-400 font-bold text-lg">
                +{potentialWin.toLocaleString()} 🪙
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Risk:</span>
              <span className="text-red-400 font-bold">
                -{betAmount.toLocaleString()} 🪙
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={disabled || betAmount === 0}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {disabled ? 'Choose Answer & Bet Amount' : 'Submit Answer'}
        </Button>

        {/* Warning */}
        {betAmount > tokens * 0.5 && (
          <div className="text-center">
            <Badge variant="destructive" className="bg-red-500/20 text-red-400">
              ⚠️ High Risk Bet
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfidenceBetting;
