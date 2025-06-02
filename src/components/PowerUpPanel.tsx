
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, LucideIcon } from 'lucide-react';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: LucideIcon;
  active: boolean;
  uses: number;
}

interface PowerUpPanelProps {
  powerUps: PowerUp[];
  tokens: number;
  onUsePowerUp: (powerUpId: string) => void;
  disabled: boolean;
}

const PowerUpPanel = ({ powerUps, tokens, onUsePowerUp, disabled }: PowerUpPanelProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Power-Ups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {powerUps.map(powerUp => {
          const IconComponent = powerUp.icon;
          const canAfford = tokens >= powerUp.cost;
          const hasUses = powerUp.uses > 0;
          const canUse = canAfford && hasUses && !disabled;

          return (
            <div
              key={powerUp.id}
              className={`p-3 rounded-lg border ${
                powerUp.active 
                  ? 'border-green-400 bg-green-500/20' 
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">{powerUp.name}</span>
                  {powerUp.active && (
                    <Badge className="bg-green-500 text-white text-xs">ACTIVE</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-sm font-semibold">{powerUp.cost} 🪙</div>
                  <div className="text-white/60 text-xs">{powerUp.uses} uses</div>
                </div>
              </div>
              
              <p className="text-white/70 text-xs mb-3">{powerUp.description}</p>
              
              <Button
                onClick={() => onUsePowerUp(powerUp.id)}
                disabled={!canUse}
                size="sm"
                className={`w-full ${
                  canUse
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {!hasUses ? 'No Uses Left' : !canAfford ? 'Can\'t Afford' : 'Use Power-Up'}
              </Button>
            </div>
          );
        })}
        
        <div className="text-center pt-2">
          <p className="text-white/50 text-xs">💡 Power-ups reset each round</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerUpPanel;
