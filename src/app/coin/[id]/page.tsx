'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCoinDetail, getMarketChart, CoinDetail, MarketChartData } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercentage, isInWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/utils';
import { PriceChart } from '@/components/price-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CoinDetailPage() {
  const params = useParams();
  const coinId = params.id as string;
  
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [chartData, setChartData] = useState<MarketChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatched, setIsWatched] = useState(false);

  const handleWatchlistToggle = () => {
    if (isWatched) {
      removeFromWatchlist(coinId);
      setIsWatched(false);
    } else {
      addToWatchlist(coinId);
      setIsWatched(true);
    }
  };

  useEffect(() => {
    if (coinId) {
      const fetchCoinData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const [coinData, chartData] = await Promise.all([
            getCoinDetail(coinId),
            getMarketChart(coinId, 7) // Default to 7 days
          ]);
          
          setCoin(coinData);
          setChartData(chartData);
          setIsWatched(isInWatchlist(coinId));
        } catch (err) {
          setError('Failed to fetch coin data. Please try again.');
          console.error('Error fetching coin data:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCoinData();
    }
  }, [coinId]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => {
          if (coinId) {
            setLoading(true);
            setError(null);
            Promise.all([
              getCoinDetail(coinId),
              getMarketChart(coinId, 7)
            ]).then(([coinData, chartData]) => {
              setCoin(coinData);
              setChartData(chartData);
              setIsWatched(isInWatchlist(coinId));
              setLoading(false);
            }).catch((err) => {
              setError('Failed to fetch coin data. Please try again.');
              console.error('Error fetching coin data:', err);
              setLoading(false);
            });
          }
        }}>Try Again</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">Coin not found</div>
        <Link href="/">
          <Button variant="outline">Back to Markets</Button>
        </Link>
      </div>
    );
  }

  const priceChangeColor = coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Image 
              src={coin.image} 
              alt={coin.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {coin.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 uppercase">
                {coin.symbol}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleWatchlistToggle}
          className={isWatched ? 'text-yellow-500 border-yellow-500' : ''}
        >
          <Star className={`w-4 h-4 mr-2 ${isWatched ? 'fill-yellow-400' : ''}`} />
          {isWatched ? 'Watched' : 'Watch'}
        </Button>
      </div>

      {/* Price and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Current Price</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(coin.current_price)}
          </p>
          <p className={`text-sm font-medium ${priceChangeColor}`}>
            {formatPercentage(coin.price_change_percentage_24h)} (24h)
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Market Cap</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${formatNumber(coin.market_cap)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rank #{coin.market_cap_rank}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">24h Volume</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${formatNumber(coin.total_volume)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Circulating Supply</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Chart and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData && (
          <PriceChart data={chartData} coinName={coin.name} />
        )}

        <div className="space-y-6">
          {/* Additional Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">All Time High</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(coin.ath)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">All Time Low</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(coin.atl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total Supply</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {coin.total_supply ? formatNumber(coin.total_supply) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Max Supply</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {coin.max_supply ? formatNumber(coin.max_supply) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          {coin.links.homepage && coin.links.homepage.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Links
              </h3>
              <div className="space-y-2">
                {coin.links.homepage.slice(0, 3).map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}