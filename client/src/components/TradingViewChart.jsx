import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const TradingViewChart = () => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const [currentPrice, setCurrentPrice] = useState(117863.95);
  const [priceChange, setPriceChange] = useState(58366.46);
  const [percentChange, setPercentChange] = useState(98.10);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          backgroundColor: '#1a1a1a',
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        crosshair: {
          mode: 1,
        },
        priceScale: {
          borderColor: '#2a2a2a',
        },
        timeScale: {
          borderColor: '#2a2a2a',
          timeVisible: true,
        },
      });

      chartRef.current = chart;

      // Add area series
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(67, 147, 252, 0.7)',
        bottomColor: 'rgba(67, 147, 252, 0.1)',
        lineColor: 'rgba(67, 147, 252, 1)',
        lineWidth: 2,
      });

      seriesRef.current = areaSeries;

      // Generate sample Bitcoin price data
      const generateBitcoinData = () => {
        const data = [];
        const basePrice = 60000;
        let currentTime = new Date('2023-01-01').getTime() / 1000;
        let price = basePrice;

        for (let i = 0; i < 365; i++) {
          // Simulate realistic Bitcoin price movements
          const change = (Math.random() - 0.5) * 5000;
          price = Math.max(price + change, 20000); // Minimum price of $20k
          
          data.push({
            time: currentTime,
            value: price,
          });
          
          currentTime += 24 * 60 * 60; // Add one day
        }

        // Set the final price to match our current display
        if (data.length > 0) {
          data[data.length - 1].value = currentPrice;
        }

        return data;
      };

      const data = generateBitcoinData();
      areaSeries.setData(data);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // Simulate live price updates
      const interval = setInterval(() => {
        const randomChange = (Math.random() - 0.5) * 1000;
        const newPrice = Math.max(currentPrice + randomChange, 20000);
        setCurrentPrice(newPrice);
        
        const newData = {
          time: Math.floor(Date.now() / 1000),
          value: newPrice,
        };
        
        if (seriesRef.current) {
          seriesRef.current.update(newData);
        }
      }, 3000); // Update every 3 seconds

      return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(interval);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }, []);

  const timeframes = ['1D', '1M', '3M', '1Y', '5Y', 'All'];

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">₿</span>
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-semibold">Bitcoin / U.S. Dollar</h3>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex items-baseline space-x-3">
          <span className="text-white text-2xl font-bold">
            {currentPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <span className="text-xs text-gray-400">USD</span>
          <span className="text-green-400 text-sm">
            +{priceChange.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <span className="text-green-400 text-sm">+{percentChange}%</span>
          <span className="text-gray-400 text-xs">Past year</span>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex space-x-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 text-sm rounded ${
                selectedTimeframe === timeframe
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full" />
      
      {/* TradingView Attribution */}
      <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">TV</span>
          </div>
          <span className="text-gray-400 text-xs">Powered by TradingView</span>
        </div>
        
        {/* Language Selector */}
        <select className="bg-gray-800 text-gray-300 text-xs border border-gray-600 rounded px-2 py-1">
          <option>English</option>
          <option>Español</option>
          <option>Français</option>
          <option>Deutsch</option>
        </select>
      </div>
    </div>
  );
};

export default TradingViewChart;