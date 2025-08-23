import React, { useState, useEffect } from "react";
import SimpleTradingChart from "../components/SimpleTradingChart";
import { userAPI } from "../services/api";

const Dashboard = ({ setCurrentPage, setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    earnings: 0.0,
    activeDeposit: 0.0,
    totalDeposit: 0.0,
    totalWithdraws: 0.0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await userAPI.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentPage("home");
  };

  const copyReferralLink = () => {
    const referralLink = "https://GREYSTAR TRUST FUND-energy.com/?ref=tobi";
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-700">
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
          <span className="text-sm font-medium font-rubik">GreyStar</span>
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
      <div className="px-4 py-6 space-y-6">
        {/* Total Balance Card */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm mb-1">Total Balance</p>
              <h1 className="text-4xl font-bold text-white">
                {loading ? "..." : `$${dashboardData.balance}`}
              </h1>
            </div>
            <button className="p-3 bg-slate-700 rounded-lg text-red-400">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-4">
          <button className="flex-1 flex flex-col items-center p-4 bg-red-500 text-white rounded-xl">
            <div className="w-10 h-10 bg-slate-700 text-red-400 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Invest</span>
          </button>

          <button
            onClick={() => setCurrentPage("transactions")}
            className="flex-1 flex flex-col items-center p-4 bg-purple-600 text-white rounded-xl"
          >
            <div className="w-10 h-10 bg-slate-700 text-purple-400 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">My Transactions</span>
          </button>

          <button className="flex-1 flex flex-col items-center p-4 bg-orange-500 text-white rounded-xl">
            <div className="w-10 h-10 bg-slate-700 text-orange-400 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Withdraw</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
            <p className="text-gray-300 text-sm mb-1">Earnings</p>
            <p className="text-2xl font-bold text-green-400">
              {loading ? "..." : `$${dashboardData.earnings.toFixed(2)}`}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
            <p className="text-gray-300 text-sm mb-1">Active Deposit</p>
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : `$${dashboardData.activeDeposit.toFixed(2)}`}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
            <p className="text-gray-300 text-sm mb-1">Total Deposit</p>
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : `$${dashboardData.totalDeposit.toFixed(2)}`}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
            <p className="text-gray-300 text-sm mb-1">Total Withdraws</p>
            <p className="text-2xl font-bold text-pink-400">
              {loading ? "..." : `$${dashboardData.totalWithdraws.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Referral Link</p>
              <p className="text-white text-sm font-medium">
                https://greystartrustfund.com/?ref=tobi
              </p>
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium"
            >
              Copy Referral Link
            </button>
          </div>
        </div>

        {/* Start Earning Now Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Start Earning Now</h2>
            <button className="text-purple-600 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-2">
                Track Progress
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Click "Transaction" to see your daily profits, interest will be
                added to your account balance in accordance with the chosen
                invest plan.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-2">
                Career Opportunity
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                You can earn up to $500+ weekly just by sharing your referral
                link daily. Form an investment portfolio with a stable income.
              </p>
            </div>
          </div>
        </div>

        {/* My Live Trades Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">My Live Trades</h2>
            <button className="text-purple-600 text-sm font-medium">
              View All
            </button>
          </div>

          <SimpleTradingChart />
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center p-2 text-red-400">
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
            </svg>
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentPage("transactions")}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Transactions</span>
          </button>

          <button
            onClick={() => setCurrentPage("plans")}
            className="flex flex-col items-center p-2 text-gray-400"
          >
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

      {/* Chat Widget */}
      <div className="fixed bottom-20 right-4">
        <button className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full"></div>
      </div>
    </div>
  );
};

export default Dashboard;
