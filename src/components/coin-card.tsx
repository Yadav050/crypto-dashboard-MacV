'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Coin } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercentage, isInWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CoinCardProps {
  coin: Coin;
  onWatchlistToggle?: () => void;
}

export function CoinCard({ coin, onWatchlistToggle }: CoinCardProps) {
  const [isWatched, setIsWatched] = useState(isInWatchlist(coin.id));

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWatched) {
      removeFromWatchlist(coin.id);
      setIsWatched(false);
    } else {
      addToWatchlist(coin.id);
      setIsWatched(true);
    }
    onWatchlistToggle?.();
  };

  const priceChangeColor = coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Link href={`/coin/${coin.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img 
              src={coin.image} 
              alt={coin.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {coin.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                {coin.symbol}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWatchlistToggle}
            className="text-gray-400 hover:text-yellow-500"
          >
            <Star 
              className={`w-5 h-5 ${isWatched ? 'fill-yellow-400 text-yellow-400' : ''}`}
            />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(coin.current_price)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">24h Change</span>
            <span className={`font-semibold ${priceChangeColor}`}>
              {formatPercentage(coin.price_change_percentage_24h)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${formatNumber(coin.market_cap)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Volume</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${formatNumber(coin.total_volume)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Rank</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              #{coin.market_cap_rank}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 