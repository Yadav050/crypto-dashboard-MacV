import axios from 'axios';

// CoinGecko API base URL
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Create axios instance
export const coingeckoApi = axios.create({
  baseURL: COINGECKO_API_BASE,
  timeout: 10000,
});

// Types for API responses
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    currency: string;
    percentage: number;
    times: number;
  };
  last_updated: string;
}

export interface CoinDetail extends Coin {
  links: {
    homepage: string[];
  };
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// Utility function to ensure numeric values
const ensureNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// API functions
export const getMarkets = async (page: number = 1, perPage: number = 50): Promise<Coin[]> => {
  try {
    const response = await coingeckoApi.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: false,
      },
    });
    
    // Ensure numeric values are valid
    return response.data.map((coin: any) => ({
      ...coin,
      current_price: ensureNumber(coin.current_price),
      market_cap: ensureNumber(coin.market_cap),
      total_volume: ensureNumber(coin.total_volume),
      high_24h: ensureNumber(coin.high_24h),
      low_24h: ensureNumber(coin.low_24h),
      price_change_24h: ensureNumber(coin.price_change_24h),
      price_change_percentage_24h: ensureNumber(coin.price_change_percentage_24h),
      market_cap_change_24h: ensureNumber(coin.market_cap_change_24h),
      market_cap_change_percentage_24h: ensureNumber(coin.market_cap_change_percentage_24h),
      circulating_supply: ensureNumber(coin.circulating_supply),
      total_supply: ensureNumber(coin.total_supply),
      max_supply: ensureNumber(coin.max_supply),
      ath: ensureNumber(coin.ath),
      atl: ensureNumber(coin.atl),
    }));
  } catch (error) {
    console.error('Error fetching markets:', error);
    throw error;
  }
};

export const getCoinDetail = async (coinId: string): Promise<CoinDetail> => {
  try {
    const response = await coingeckoApi.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });
    
    const data = response.data;
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image.large,
      current_price: ensureNumber(data.market_data.current_price.usd),
      market_cap: ensureNumber(data.market_data.market_cap.usd),
      market_cap_rank: ensureNumber(data.market_cap_rank),
      fully_diluted_valuation: ensureNumber(data.market_data.fully_diluted_valuation?.usd),
      total_volume: ensureNumber(data.market_data.total_volume.usd),
      high_24h: ensureNumber(data.market_data.high_24h.usd),
      low_24h: ensureNumber(data.market_data.low_24h.usd),
      price_change_24h: ensureNumber(data.market_data.price_change_24h),
      price_change_percentage_24h: ensureNumber(data.market_data.price_change_percentage_24h),
      market_cap_change_24h: ensureNumber(data.market_data.market_cap_change_24h),
      market_cap_change_percentage_24h: ensureNumber(data.market_data.market_cap_change_percentage_24h),
      circulating_supply: ensureNumber(data.market_data.circulating_supply),
      total_supply: ensureNumber(data.market_data.total_supply),
      max_supply: ensureNumber(data.market_data.max_supply),
      ath: ensureNumber(data.market_data.ath.usd),
      ath_change_percentage: ensureNumber(data.market_data.ath_change_percentage.usd),
      ath_date: data.market_data.ath_date.usd || '',
      atl: ensureNumber(data.market_data.atl.usd),
      atl_change_percentage: ensureNumber(data.market_data.atl_change_percentage.usd),
      atl_date: data.market_data.atl_date.usd || '',
      roi: null,
      links: {
        homepage: data.links.homepage || [],
      },
      last_updated: data.last_updated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching coin detail:', error);
    throw error;
  }
};

export const getMarketChart = async (
  id: string,
  days: number = 1,
  currency: string = 'usd'
): Promise<MarketChartData> => {
  try {
    const response = await coingeckoApi.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: currency,
        days: days,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market chart:', error);
    throw error;
  }
};

export const searchCoins = async (query: string): Promise<Coin[]> => {
  try {
    const response = await coingeckoApi.get('/search', {
      params: {
        query: query,
      },
    });
    
    // Get detailed data for the first 10 results
    const coinIds = response.data.coins.slice(0, 10).map((coin: { id: string }) => coin.id).join(',');
    if (coinIds) {
      const detailedResponse = await coingeckoApi.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: coinIds,
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      });
      return detailedResponse.data;
    }
    return [];
  } catch (error) {
    console.error('Error searching coins:', error);
    throw error;
  }
};