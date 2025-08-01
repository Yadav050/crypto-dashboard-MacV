'use client';

import { useState, useEffect } from 'react';
import { getMarkets, Coin } from '@/lib/api';
import { getWatchlist } from '@/lib/utils';
import { CoinCard } from '@/components/coin-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Star } from 'lucide-react';

export default function WatchlistPage() {
  const [watchlistCoins, setWatchlistCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchWatchlistCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ids = getWatchlist();
      
      if (ids.length === 0) {
        setWatchlistCoins([]);
        return;
      }

      // Fetch all coins and filter by watchlist
      const allCoins = await getMarkets(1, 250); // Get more coins to increase chances of finding watchlist items
      const filteredCoins = allCoins.filter(coin => ids.includes(coin.id));
      
      setWatchlistCoins(filteredCoins);
    } catch (err) {
      setError('Failed to fetch watchlist data. Please try again.');
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWatchlistCoins();
  };

  useEffect(() => {
    fetchWatchlistCoins();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Watchlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your saved cryptocurrencies
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : watchlistCoins.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">Your watchlist is empty</p>
            <p className="text-sm">
              Start adding cryptocurrencies to your watchlist by clicking the star icon on any coin.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlistCoins.map((coin) => (
            <CoinCard 
              key={coin.id} 
              coin={coin}
              onWatchlistToggle={() => {
                // Refresh the watchlist when a coin is removed
                fetchWatchlistCoins();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 