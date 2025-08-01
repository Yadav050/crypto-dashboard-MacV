'use client';

import { useState, useEffect } from 'react';
import { getMarkets, searchCoins, Coin } from '@/lib/api';
import { CoinCard } from '@/components/coin-card';
import { SearchBar } from '@/components/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function MarketsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchCoins = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarkets(pageNum, 50);
      setCoins(data);
      setFilteredCoins(data);
    } catch (err) {
      setError('Failed to fetch cryptocurrency data. Please try again.');
      console.error('Error fetching coins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredCoins(coins);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await searchCoins(query);
      setFilteredCoins(searchResults);
    } catch (err) {
      console.error('Error searching coins:', err);
      setFilteredCoins([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = () => {
    fetchCoins(page);
  };

  useEffect(() => {
    fetchCoins(page);
  }, [page]);

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
            Cryptocurrency Markets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time cryptocurrency prices and market data
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="max-w-md">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
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
      ) : filteredCoins.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {isSearching ? 'Searching...' : 'No cryptocurrencies found'}
          </div>
          {searchQuery && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilteredCoins(coins);
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCoins.map((coin) => (
              <CoinCard 
                key={coin.id} 
                coin={coin}
                onWatchlistToggle={() => {
                  // Trigger a re-render if needed
                }}
              />
            ))}
          </div>

          {!searchQuery && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
