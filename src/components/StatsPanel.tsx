
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Animal } from '@/pages/Index';

interface StatsPanelProps {
  animals: Animal[];
}

const StatsPanel = ({ animals }: StatsPanelProps) => {
  const totalRaces = animals.reduce((sum, animal) => sum + animal.wins, 0);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Animal Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {animals.map(animal => {
          const winPercentage = totalRaces > 0 ? (animal.wins / totalRaces) * 100 : 0;
          const expectedWinRate = animal.probability * 100;
          
          return (
            <div key={animal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{animal.emoji}</span>
                  <span className="text-white font-semibold">{animal.name}</span>
                </div>
                <Badge 
                  className={`bg-gradient-to-r ${animal.color} text-white font-semibold`}
                >
                  {(1 / animal.probability).toFixed(1)}x
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Expected Win Rate</span>
                  <span className="text-blue-400">{expectedWinRate.toFixed(0)}%</span>
                </div>
                <Progress value={expectedWinRate} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Actual Performance</span>
                  <span className="text-green-400">{winPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={winPercentage} className="h-2" />
                
                <div className="flex justify-between text-xs text-white/60">
                  <span>Wins: {animal.wins}</span>
                  <span>
                    {winPercentage > expectedWinRate ? '🔥 Hot' : 
                     winPercentage < expectedWinRate ? '❄️ Cold' : '🎯 On Track'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {totalRaces === 0 && (
          <div className="text-center py-8">
            <p className="text-white/70">📊 Statistics will appear after your first race!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsPanel;
