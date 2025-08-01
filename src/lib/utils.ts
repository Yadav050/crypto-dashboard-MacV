import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Watchlist localStorage utilities
const WATCHLIST_KEY = 'crypto-watchlist';

export const getWatchlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading watchlist from localStorage:', error);
    return [];
  }
};

export const addToWatchlist = (coinId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const watchlist = getWatchlist();
    if (!watchlist.includes(coinId)) {
      const updatedWatchlist = [...watchlist, coinId];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
  }
};

export const removeFromWatchlist = (coinId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const watchlist = getWatchlist();
    const updatedWatchlist = watchlist.filter(id => id !== coinId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
};

export const isInWatchlist = (coinId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchlist = getWatchlist();
    return watchlist.includes(coinId);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

// Format currency
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format large numbers
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  if (value >= 1e12) {
    return (value / 1e12).toFixed(2) + 'T';
  } else if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + 'K';
  }
  return value.toFixed(2);
};

// Format percentage
export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Convert timestamp to readable date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 