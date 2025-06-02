
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Bet } from '@/pages/Index';

interface BettingHistoryProps {
  bets: Bet[];
}

const BettingHistory = ({ bets }: BettingHistoryProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (bets.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Betting History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-white/70 text-lg">📜 No bets placed yet!</p>
            <p className="text-white/50 text-sm mt-2">Your betting history will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Betting History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {bets.map(bet => (
              <div
                key={bet.id}
                className={`p-4 rounded-lg border-2 ${
                  bet.result === 'win' 
                    ? 'border-green-400/50 bg-green-500/10' 
                    : 'border-red-400/50 bg-red-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{bet.animal.emoji}</span>
                    <span className="text-white font-semibold">{bet.animal.name}</span>
                    <Badge 
                      variant={bet.result === 'win' ? 'default' : 'destructive'}
                      className={bet.result === 'win' ? 'bg-green-500' : 'bg-red-500'}
                    >
                      {bet.result === 'win' ? '🎉 WIN' : '😔 LOSE'}
                    </Badge>
                  </div>
                  <span className="text-white/70 text-sm">
                    {formatTime(bet.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/70">
                    Bet: <span className="text-white font-semibold">{bet.amount.toLocaleString()} 🪙</span>
                  </div>
                  {bet.result === 'win' ? (
                    <div className="text-green-400 font-semibold">
                      Won: +{bet.winnings.toLocaleString()} 🪙
                    </div>
                  ) : (
                    <div className="text-red-400 font-semibold">
                      Lost: -{bet.amount.toLocaleString()} 🪙
                    </div>
                  )}
                </div>
                
                {bet.winner && (
                  <div className="mt-2 text-xs text-white/60">
                    Winner: {bet.winner.emoji} {bet.winner.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BettingHistory;
