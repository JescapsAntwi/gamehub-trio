
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  turn: number;
  game: string;
  betAmount: number;
  result: 'win' | 'loss';
  payout: number;
  balance: number;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <Card className="bg-black/20 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No transactions yet. Start playing to see your history!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Turn</TableHead>
                  <TableHead className="text-gray-300">Game</TableHead>
                  <TableHead className="text-gray-300">Risk</TableHead>
                  <TableHead className="text-gray-300">Bet</TableHead>
                  <TableHead className="text-gray-300">Result</TableHead>
                  <TableHead className="text-gray-300">Payout</TableHead>
                  <TableHead className="text-gray-300">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice().reverse().map((transaction) => (
                  <TableRow key={transaction.id} className="border-gray-600">
                    <TableCell className="text-gray-300">#{transaction.turn}</TableCell>
                    <TableCell className="text-gray-300">{transaction.game}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRiskColor(transaction.riskLevel)}>
                        {transaction.riskLevel.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{transaction.betAmount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.result === 'win' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={transaction.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                          {transaction.result.toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={transaction.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                      {transaction.result === 'win' ? `+${transaction.payout}` : `-${transaction.betAmount}`}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono">{transaction.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
