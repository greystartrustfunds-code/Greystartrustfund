import React, { useState, useEffect } from "react";

const SimpleTradingChart = () => {
  const [currentPrice, setCurrentPrice] = useState(117863.95);
  const [priceChange] = useState(58366.46);
  const [percentChange] = useState(98.1);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1Y");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Generate sample chart data points
    const generateChartData = () => {
      const points = [];
      const numPoints = 50;
      const width = 100;

      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width;
        // Create a realistic Bitcoin-like chart pattern
        const baseY = 30 + Math.sin(i * 0.3) * 10 + Math.cos(i * 0.1) * 5;
        const noise = (Math.random() - 0.5) * 4;
        const trend = (i / numPoints) * 15; // Upward trend
        const y = Math.max(5, Math.min(55, baseY + noise + trend));
        points.push({ x, y });
      }
      return points;
    };

    setChartData(generateChartData());

    // Simulate price updates
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2000;
      setCurrentPrice((prev) => Math.max(20000, prev + change));
      setChartData(generateChartData()); // Regenerate chart
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const createPath = () => {
    if (chartData.length === 0) return "";

    let path = `M ${chartData[0].x} ${chartData[0].y}`;
    for (let i = 1; i < chartData.length; i++) {
      path += ` L ${chartData[i].x} ${chartData[i].y}`;
    }
    return path;
  };

  const createArea = () => {
    if (chartData.length === 0) return "";

    let path = `M ${chartData[0].x} ${chartData[0].y}`;
    for (let i = 1; i < chartData.length; i++) {
      path += ` L ${chartData[i].x} ${chartData[i].y}`;
    }
    path += ` L 100 60 L 0 60 Z`;
    return path;
  };

  const timeframes = ["1D", "1M", "3M", "1Y", "5Y", "All"];

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
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-baseline space-x-3">
          <span className="text-white text-2xl font-bold">
            {currentPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-xs text-gray-400">USD</span>
          <span className="text-green-400 text-sm">
            +
            {priceChange.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
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
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedTimeframe === timeframe
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-gray-900 h-80">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#374151"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Price chart */}
        <div className="absolute inset-4">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(67, 147, 252, 0.7)" />
                <stop offset="100%" stopColor="rgba(67, 147, 252, 0.1)" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={createArea()} fill="url(#areaGradient)" />

            {/* Price line */}
            <path
              d={createPath()}
              fill="none"
              stroke="rgba(67, 147, 252, 1)"
              strokeWidth="0.5"
              className="drop-shadow-sm"
            />
          </svg>
        </div>

        {/* Y-axis price labels */}
        <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-between text-gray-400 text-xs">
          <span>120,000</span>
          <span>110,000</span>
          <span>100,000</span>
          <span>90,000</span>
          <span>80,000</span>
        </div>

        {/* X-axis time labels */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-gray-400 text-xs">
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
        </div>
      </div>

      {/* TradingView Attribution */}
      <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">TV</span>
          </div>
          <span className="text-gray-400 text-xs">Powered by TradingView</span>
        </div>

        {/* Language Selector */}
        <select className="bg-gray-800 text-gray-300 text-xs border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500">
          <option>English</option>
          <option>Español</option>
          <option>Français</option>
          <option>Deutsch</option>
        </select>
      </div>
    </div>
  );
};

export default SimpleTradingChart;
