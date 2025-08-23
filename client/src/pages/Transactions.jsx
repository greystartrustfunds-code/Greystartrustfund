import React, { useState, useEffect } from "react";
import { transactionAPI } from "../services/api";

const Transactions = ({ setCurrentPage, setIsAuthenticated }) => {
  const [transactionType, setTransactionType] = useState("All transactions");
  const [eCurrencyType, setECurrencyType] = useState("All eCurrencies");
  const [fromMonth, setFromMonth] = useState("Aug");
  const [fromDay, setFromDay] = useState("14");
  const [fromYear, setFromYear] = useState("2025");
  const [toMonth, setToMonth] = useState("Aug");
  const [toDay, setToDay] = useState("22");
  const [toYear, setToYear] = useState("2025");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentPage("home");
  };

  const fetchTransactions = async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await transactionAPI.getTransactions(filters);
      setTransactions(response.data || []);
    } catch (error) {
      setError("Failed to fetch transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoFilter = () => {
    const filters = {
      type:
        transactionType === "All transactions"
          ? undefined
          : transactionType.toLowerCase(),
      currency: eCurrencyType === "All eCurrencies" ? undefined : eCurrencyType,
      fromDate: `${fromYear}-${fromMonth}-${fromDay}`,
      toDate: `${toYear}-${toMonth}-${toDay}`,
    };
    fetchTransactions(filters);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <button className="p-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium">GreyStartTrust Fund</span>
        </div>

        <button onClick={handleLogout} className="p-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* History Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-6">History</h1>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Transaction Type and eCurrency Filters */}
          <div className="space-y-4 mb-6">
            <div>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All transactions</option>
                <option>Deposits</option>
                <option>Withdrawals</option>
                <option>Profits</option>
              </select>
            </div>

            <div>
              <select
                value={eCurrencyType}
                onChange={(e) => setECurrencyType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>All eCurrencies</option>
                <option>USD</option>
                <option>BTC</option>
                <option>ETH</option>
              </select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From:
              </label>
              <div className="flex space-x-2">
                <select
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Jan">Jan</option>
                  <option value="Feb">Feb</option>
                  <option value="Mar">Mar</option>
                  <option value="Apr">Apr</option>
                  <option value="May">May</option>
                  <option value="Jun">Jun</option>
                  <option value="Jul">Jul</option>
                  <option value="Aug">Aug</option>
                  <option value="Sep">Sep</option>
                  <option value="Oct">Oct</option>
                  <option value="Nov">Nov</option>
                  <option value="Dec">Dec</option>
                </select>

                <select
                  value={fromDay}
                  onChange={(e) => setFromDay(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <select
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To:
              </label>
              <div className="flex space-x-2">
                <select
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Jan">Jan</option>
                  <option value="Feb">Feb</option>
                  <option value="Mar">Mar</option>
                  <option value="Apr">Apr</option>
                  <option value="May">May</option>
                  <option value="Jun">Jun</option>
                  <option value="Jul">Jul</option>
                  <option value="Aug">Aug</option>
                  <option value="Sep">Sep</option>
                  <option value="Oct">Oct</option>
                  <option value="Nov">Nov</option>
                  <option value="Dec">Dec</option>
                </select>

                <select
                  value={toDay}
                  onChange={(e) => setToDay(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <select
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Go Button */}
          <div className="mt-6">
            <button
              onClick={handleGoFilter}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Go
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* History Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">History</h2>
          </div>

          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-700">Type</div>
              <div className="text-sm font-medium text-gray-700 text-right">
                Amount
              </div>
              <div className="text-sm font-medium text-gray-700 text-right">
                Date
              </div>
            </div>
          </div>

          {/* Transaction Data */}
          <div>
            {loading && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            )}

            {error && (
              <div className="px-6 py-12 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}

            {!loading && !error && transactions.length > 0 && (
              <div>
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-sm text-gray-900 capitalize">
                        {transaction.type}
                      </div>
                      <div className="text-sm text-gray-900 text-right">
                        ${transaction.amount?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-sm text-gray-900 text-right">
                        {transaction.date
                          ? new Date(transaction.date).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-6 space-x-2">
          <button className="px-3 py-2 text-gray-400 hover:text-gray-600">
            &laquo;
          </button>
          <button className="px-3 py-2 bg-purple-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-2 text-gray-400 hover:text-gray-600">
            &raquo;
          </button>
        </div>

        {/* Language Selector */}
        <div className="mt-8">
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Select Language</option>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Copyright © GreyStartTrust Fund-energy.com 2024. All Rights
            Reserved.
          </p>
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
            </svg>
            <span className="text-xs">Dashboard</span>
          </button>

          <button className="flex flex-col items-center p-2 text-purple-600">
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Transactions</span>
          </button>

          <button className="flex flex-col items-center p-2 text-gray-400">
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Plans</span>
          </button>

          <button className="flex flex-col items-center p-2 text-gray-400">
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Chat Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
