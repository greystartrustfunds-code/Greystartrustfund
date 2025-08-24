import React, { useState, useEffect } from "react";
import SimpleTradingChart from "../components/SimpleTradingChart";
import { userAPI, transactionAPI } from "../services/api";

const Dashboard = ({ setCurrentPage, setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    earnings: 0.0,
    activeDeposit: 0.0,
    totalDeposit: 0.0,
    totalWithdraws: 0.0,
  });
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositForm, setDepositForm] = useState({
    amount: '',
    selectedAccount: '',
    proofOfPayment: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Account details from the image
  const accountDetails = [
    {
      id: 'tron_trc20',
      network: 'TRC20',
      currency: 'Tron',
      address: 'TWAu9nifnWbNnrA2DuytcaqSf7zwpswDSX'
    },
    {
      id: 'usdt_trc20',
      network: 'TRC20', 
      currency: 'USDT',
      address: 'TWAu9nifnWbNnrA2DuytcaqSf7zwpswDSX'
    },
    {
      id: 'bnb_bep20',
      network: 'BEP20',
      currency: 'BNB',
      address: '0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79'
    },
    {
      id: 'btc_bitcoin',
      network: 'BTC',
      currency: 'Bitcoin',
      address: '15Q3iVisEVkAZig7pwcEhzCuiNdMgSxh3R'
    },
    {
      id: 'eth_ethereum',
      network: 'ETH',
      currency: 'Ethereum', 
      address: '0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79'
    }
  ];

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

  const handleDepositClick = () => {
    setShowDepositModal(true);
  };

  const handleDepositFormChange = (field, value) => {
    setDepositForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image (JPG, PNG, GIF) or PDF file');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setDepositForm(prev => ({
        ...prev,
        proofOfPayment: file
      }));
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    alert('Address copied to clipboard!');
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    if (!depositForm.amount || !depositForm.selectedAccount || !depositForm.proofOfPayment) {
      alert('Please fill all fields and upload proof of payment');
      return;
    }

    if (parseFloat(depositForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', depositForm.amount);
      formData.append('type', 'deposit');
      formData.append('selectedAccount', depositForm.selectedAccount);
      formData.append('proofOfPayment', depositForm.proofOfPayment);
      formData.append('status', 'pending');

      const response = await transactionAPI.createTransaction(formData);
      
      if (response.success) {
        alert('Deposit request submitted successfully! Admin will review your payment.');
        setShowDepositModal(false);
        setDepositForm({
          amount: '',
          selectedAccount: '',
          proofOfPayment: null
        });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        alert(response.message || 'Failed to submit deposit request');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert(error.response?.data?.message || 'Failed to submit deposit request');
    } finally {
      setSubmitLoading(false);
    }
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
          <button 
            onClick={handleDepositClick}
            className="flex-1 flex flex-col items-center p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-slate-700 text-red-400 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Deposit</span>
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Make Deposit</h2>
                </div>
                <button 
                  onClick={() => setShowDepositModal(false)}
                  className="w-8 h-8 bg-slate-600/50 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="10"
                      value={depositForm.amount}
                      onChange={(e) => handleDepositFormChange('amount', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Enter amount (min: $10)"
                      required
                    />
                  </div>
                </div>

                {/* Account Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid gap-3">
                    {accountDetails.map((account) => (
                      <div key={account.id} 
                           className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                             depositForm.selectedAccount === account.id 
                               ? 'border-green-500 bg-green-500/10' 
                               : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                           }`}
                           onClick={() => handleDepositFormChange('selectedAccount', account.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              depositForm.selectedAccount === account.id 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-400'
                            }`}>
                              {depositForm.selectedAccount === account.id && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{account.currency}</p>
                              <p className="text-gray-400 text-sm">{account.network}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAddress(account.address);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                          >
                            Copy Address
                          </button>
                        </div>
                        <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-gray-300 font-mono break-all">
                          {account.address}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {depositForm.selectedAccount && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-blue-300 font-medium mb-2">Payment Instructions:</h4>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>1. Copy the wallet address above</li>
                          <li>2. Send the exact amount to the copied address</li>
                          <li>3. Upload proof of payment below</li>
                          <li>4. Wait for admin confirmation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Proof of Payment
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="proofUpload"
                      required
                    />
                    <label
                      htmlFor="proofUpload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> payment proof
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF or PDF (MAX. 5MB)</p>
                      </div>
                    </label>
                  </div>
                  {depositForm.proofOfPayment && (
                    <p className="mt-2 text-sm text-green-400">
                      ✓ File uploaded: {depositForm.proofOfPayment.name}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600/50">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-600/50 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 text-white rounded-lg font-medium shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    {submitLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Submit Deposit</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
