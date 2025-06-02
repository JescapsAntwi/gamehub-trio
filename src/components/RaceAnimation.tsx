
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Animal } from '@/pages/Index';

interface RaceAnimationProps {
  animals: Animal[];
  isRacing: boolean;
  winner: Animal | null;
}

const RaceAnimation = ({ animals, isRacing, winner }: RaceAnimationProps) => {
  const [positions, setPositions] = useState<Record<number, number>>({});
  const [racePhase, setRacePhase] = useState<'ready' | 'racing' | 'finished'>('ready');

  useEffect(() => {
    if (isRacing) {
      setRacePhase('racing');
      // Reset positions
      setPositions({});
      
      // Animate the race
      const startTime = Date.now();
      const raceDuration = 3500; // 3.5 seconds
      
      const animateRace = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / raceDuration, 1);
        
        if (progress < 1) {
          // Update positions with some randomness for excitement
          const newPositions: Record<number, number> = {};
          animals.forEach(animal => {
            // Animals with higher probability tend to be ahead, but with randomness
            const baseProgress = progress * animal.probability * 1.5;
            const randomVariation = Math.sin(elapsed / 200 + animal.id) * 0.1;
            const finalProgress = Math.max(0, Math.min(1, baseProgress + randomVariation + Math.random() * 0.1));
            newPositions[animal.id] = finalProgress * 90; // 90% max position during race
          });
          setPositions(newPositions);
          requestAnimationFrame(animateRace);
        } else {
          // Race finished - winner takes the lead
          const finalPositions: Record<number, number> = {};
          animals.forEach(animal => {
            if (animal.id === winner?.id) {
              finalPositions[animal.id] = 95; // Winner crosses finish line
            } else {
              finalPositions[animal.id] = 75 + Math.random() * 15; // Others finish behind
            }
          });
          setPositions(finalPositions);
          setRacePhase('finished');
        }
      };
      
      animateRace();
    } else {
      setRacePhase('ready');
      setPositions({});
    }
  }, [isRacing, animals, winner]);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Track Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">🏁 Race Track</h2>
            {racePhase === 'racing' && (
              <Badge className="bg-red-500 text-white animate-pulse">
                🔴 LIVE RACE
              </Badge>
            )}
            {racePhase === 'finished' && winner && (
              <Badge className="bg-yellow-500 text-black font-semibold">
                🏆 {winner.emoji} {winner.name} WINS!
              </Badge>
            )}
          </div>

          {/* Race Track */}
          <div className="space-y-4 py-4">
            {animals.map((animal, index) => (
              <div key={animal.id} className="relative">
                {/* Track */}
                <div className="h-16 bg-gradient-to-r from-green-400 via-green-300 to-yellow-400 rounded-lg border-2 border-white/30 relative overflow-hidden">
                  {/* Track Lines */}
                  <div className="absolute inset-0 flex items-center">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-white/20 h-full"
                        style={{ background: i === 9 ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))' : 'transparent' }}
                      />
                    ))}
                  </div>
                  
                  {/* Finish Line */}
                  <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-white via-black to-white opacity-80" />
                  
                  {/* Animal */}
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 text-4xl transition-all duration-300 ${
                      racePhase === 'racing' ? 'animate-bounce' : ''
                    } ${
                      racePhase === 'finished' && animal.id === winner?.id ? 'animate-pulse scale-110' : ''
                    }`}
                    style={{
                      left: `${positions[animal.id] || 5}%`,
                      zIndex: animal.id === winner?.id ? 10 : 1,
                    }}
                  >
                    {animal.emoji}
                  </div>
                </div>

                {/* Animal Info */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{animal.name}</span>
                    <Badge 
                      variant="outline" 
                      className="border-white/30 text-white/70 text-xs"
                    >
                      {(animal.probability * 100).toFixed(0)}% chance
                    </Badge>
                  </div>
                  <div className="text-white/70 text-sm">
                    {animal.wins} wins
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Race Status */}
          <div className="text-center py-4">
            {racePhase === 'ready' && (
              <p className="text-white/70 text-lg">🏁 Ready for the next race! Place your bets above.</p>
            )}
            {racePhase === 'racing' && (
              <p className="text-yellow-400 text-lg font-semibold animate-pulse">
                🏃‍♂️ Race in progress... Who will win?
              </p>
            )}
            {racePhase === 'finished' && winner && (
              <div className="space-y-2">
                <p className="text-green-400 text-xl font-bold">
                  🎉 {winner.emoji} {winner.name} crosses the finish line first!
                </p>
                <p className="text-white/70">
                  Place another bet to start the next race!
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceAnimation;
