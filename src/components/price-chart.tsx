'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketChartData } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PriceChartProps {
  data: MarketChartData;
  coinName: string;
}

const timeRanges = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export function PriceChart({ data, coinName }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState(1);

  // Transform data for chart
  const chartData = data.prices.map(([timestamp, price]) => ({
    time: timestamp,
    price: price,
    date: formatDate(timestamp),
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { date: string; price: number; time: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{coinName} Price Chart</CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
            </div>
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <Button
                  key={range.days}
                  variant={selectedRange === range.days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRange(range.days)}
                  className="h-8"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#3B82F6"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#3B82F6"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                className="dark:stroke-slate-700"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280' }}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280' }}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 