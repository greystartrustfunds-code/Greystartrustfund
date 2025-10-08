import React, { useState, useEffect } from "react";
import SimpleTradingChart from "../components/SimpleTradingChart";
import { userAPI, transactionAPI, authAPI } from "../services/api";

const Dashboard = ({ setCurrentPage, setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    earnings: 0.0,
    activeDeposit: 0.0,
    totalDeposit: 0.0,
    totalWithdraws: 0.0,
  });
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    referralCode: "",
    joinedDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReinvestModal, setShowReinvestModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedReinvestPlan, setSelectedReinvestPlan] = useState(null);
  const [reinvestForm, setReinvestForm] = useState({
    amount: "",
    planId: "",
    planName: "",
  });
  const [depositForm, setDepositForm] = useState({
    amount: "",
    selectedAccount: "",
    proofOfPayment: null,
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    withdrawalSource: "balance", // Default to balance
    accountType: "",
    accountDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      routingNumber: "",
      swiftCode: "",
      walletAddress: "",
      network: "",
    },
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Account details from the image
  const accountDetails = [
    {
      id: "tron_trc20",
      network: "TRC20",
      currency: "Tron",
      address: "TWAu9nifnWbNnrA2DuytcaqSf7zwpswDSX",
    },
    {
      id: "usdt_trc20",
      network: "TRC20",
      currency: "USDT",
      address: "TWAu9nifnWbNnrA2DuytcaqSf7zwpswDSX",
    },
    {
      id: "bnb_bep20",
      network: "BEP20",
      currency: "BNB",
      address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    },
    {
      id: "btc_bitcoin",
      network: "BTC",
      currency: "Bitcoin",
      address: "15Q3iVisEVkAZig7pwcEhzCuiNdMgSxh3R",
    },
    {
      id: "eth_ethereum",
      network: "ETH",
      currency: "Ethereum",
      address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    },
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

  const fetchUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const response = await authAPI.getProfile();
      if (response.success) {
        const userData = {
          name: response.data.fullName || user.fullName || "User",
          email: response.data.email || user.email || "",
          username: response.data.username || user.username || "",
          phone: response.data.phone || "",
          referralCode: response.data.referralCode || user.referralCode || "",
          joinedDate:
            new Date(
              response.data.createdAt || user.createdAt
            ).toLocaleDateString() || "",
        };
        setUserData(userData);
      }
    } catch (error) {
      // Fallback to localStorage data if API fails
      const user = JSON.parse(localStorage.getItem("user")) || {};
      setUserData({
        name: user.fullName || "User",
        email: user.email || "",
        username: user.username || "",
        phone: "",
        referralCode: user.referralCode || "",
        joinedDate: new Date(user.createdAt).toLocaleDateString() || "",
      });
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  // Close profile modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileModal && !event.target.closest(".profile-dropdown")) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileModal]);

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

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleReinvestClick = (planId) => {
    const plans = {
      starter: {
        name: "Starter Plan",
        minAmount: 25,
        maxAmount: 599,
        profit: 12,
      },
      basic: { name: "Basic Plan", minAmount: 600, maxAmount: 999, profit: 15 },
      professional: {
        name: "Professional Plan",
        minAmount: 1000,
        maxAmount: 9999,
        profit: 30,
      },
      vip: {
        name: "VIP Plan",
        minAmount: 10000,
        maxAmount: Infinity,
        profit: 60,
      },
    };

    const plan = plans[planId];
    if (!plan) return;

    // Check if user has enough earnings for minimum plan amount
    if (dashboardData.earnings < plan.minAmount) {
      alert(
        `Minimum amount for ${plan.name} is $${plan.minAmount}. You need $${(
          plan.minAmount - dashboardData.earnings
        ).toFixed(2)} more earnings.`
      );
      return;
    }

    setSelectedReinvestPlan(plan);
    setReinvestForm({
      amount: plan.minAmount.toString(),
      planId: planId,
      planName: plan.name,
    });
    setShowReinvestModal(true);
  };

  const handleDepositFormChange = (field, value) => {
    setDepositForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWithdrawFormChange = (field, value) => {
    if (field.startsWith("accountDetails.")) {
      const detailField = field.split(".")[1];
      setWithdrawForm((prev) => ({
        ...prev,
        accountDetails: {
          ...prev.accountDetails,
          [detailField]: value,
        },
      }));
    } else {
      setWithdrawForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleReinvestFormChange = (field, value) => {
    setReinvestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReinvestSubmit = async (e) => {
    e.preventDefault();

    if (!reinvestForm.amount || !reinvestForm.planId) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(reinvestForm.amount);
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > dashboardData.earnings) {
      alert("Insufficient earnings for this investment amount");
      return;
    }

    if (selectedReinvestPlan) {
      if (amount < selectedReinvestPlan.minAmount) {
        alert(
          `Minimum amount for ${selectedReinvestPlan.name} is $${selectedReinvestPlan.minAmount}`
        );
        return;
      }
      if (amount > selectedReinvestPlan.maxAmount) {
        alert(
          `Maximum amount for ${selectedReinvestPlan.name} is $${selectedReinvestPlan.maxAmount}`
        );
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const response = await userAPI.reinvestEarnings({
        amount: amount,
        planId: reinvestForm.planId,
      });

      if (response.success) {
        alert(
          `Successfully reinvested $${amount} into ${reinvestForm.planName}!`
        );
        setShowReinvestModal(false);
        setReinvestForm({
          amount: "",
          planId: "",
          planName: "",
        });
        setSelectedReinvestPlan(null);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to process reinvestment");
      }
    } catch (error) {
      console.error("Reinvestment error:", error);
      alert(error.response?.data?.message || "Failed to process reinvestment");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload an image (JPG, PNG, GIF) or PDF file");
        return;
      }

      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      setDepositForm((prev) => ({
        ...prev,
        proofOfPayment: file,
      }));
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();

    if (
      !depositForm.amount ||
      !depositForm.selectedAccount ||
      !depositForm.proofOfPayment
    ) {
      alert("Please fill all fields and upload proof of payment");
      return;
    }

    if (parseFloat(depositForm.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount", depositForm.amount);
      formData.append("type", "deposit");
      formData.append("selectedAccount", depositForm.selectedAccount);
      formData.append("proofOfPayment", depositForm.proofOfPayment);
      formData.append("status", "pending");

      const response = await transactionAPI.createTransaction(formData);

      if (response.success) {
        alert(
          "Deposit request submitted successfully! Admin will review your payment."
        );
        setShowDepositModal(false);
        setDepositForm({
          amount: "",
          selectedAccount: "",
          proofOfPayment: null,
        });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to submit deposit request");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      alert(
        error.response?.data?.message || "Failed to submit deposit request"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();

    const { amount, withdrawalSource, accountType, accountDetails } =
      withdrawForm;

    if (!amount || !withdrawalSource || !accountType) {
      alert("Please fill in all required fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Check balance based on withdrawal source
    const maxAmount =
      withdrawalSource === "balance"
        ? dashboardData.balance
        : dashboardData.withdrawableEarnings;

    if (parseFloat(amount) > maxAmount) {
      const sourceName =
        withdrawalSource === "balance" ? "balance" : "withdrawable earnings";
      alert(`Insufficient ${sourceName} for withdrawal`);
      return;
    }

    if (
      withdrawalSource === "earnings" &&
      dashboardData.withdrawableEarnings <= 0
    ) {
      alert("No earnings are currently approved for withdrawal");
      return;
    }

    // Validate account details based on type
    if (accountType === "bank") {
      if (
        !accountDetails.bankName ||
        !accountDetails.accountNumber ||
        !accountDetails.accountName
      ) {
        alert("Please fill in all bank account details");
        return;
      }
    } else if (accountType === "crypto") {
      if (!accountDetails.walletAddress || !accountDetails.network) {
        alert("Please fill in wallet address and network");
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const response = await userAPI.withdraw({
        amount: parseFloat(amount),
        withdrawalSource,
        accountType,
        accountDetails,
      });

      if (response.success) {
        alert(
          "Withdrawal request submitted successfully! Admin will process your request."
        );
        setShowWithdrawModal(false);
        setWithdrawForm({
          amount: "",
          accountType: "",
          accountDetails: {
            bankName: "",
            accountNumber: "",
            accountName: "",
            routingNumber: "",
            swiftCode: "",
            walletAddress: "",
            network: "",
          },
        });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(
        error.response?.data?.message || "Failed to submit withdrawal request"
      );
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
          <span className="text-sm font-medium font-rubik">
            GREYSTAR TRUST FUND
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="p-2 flex items-center space-x-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userData.name.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {showProfileModal && (
            <div className="profile-dropdown absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50">
              <div className="p-4">
                {/* User Header */}
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-600">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {userData.name.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{userData.name}</h3>
                    <p className="text-gray-400 text-sm">{userData.email}</p>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-300">
                    Account Information
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Username:</span>
                      <span className="text-white text-sm">
                        {userData.username || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Email:</span>
                      <span className="text-white text-sm">
                        {userData.email || "N/A"}
                      </span>
                    </div>

                    {userData.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Phone:</span>
                        <span className="text-white text-sm">
                          {userData.phone}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">
                        Referral Code:
                      </span>
                      <span className="text-blue-400 text-sm font-mono">
                        {userData.referralCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">
                        Member Since:
                      </span>
                      <span className="text-white text-sm">
                        {userData.joinedDate || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">Balance</p>
                    <p className="text-white font-semibold">
                      ${dashboardData.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">Earnings</p>
                    <p className="text-green-400 font-semibold">
                      ${dashboardData.earnings.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-600">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                    <svg
                      className="w-4 h-4"
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
                    <span>Edit Profile</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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

          <button
            onClick={handleWithdrawClick}
            className="flex-1 flex flex-col items-center p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
          >
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

        {/* Reinvestment Section */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Reinvest Earnings</h2>
            <div className="text-sm text-gray-300">
              Available:{" "}
              <span className="text-green-400 font-semibold">
                ${dashboardData.earnings.toFixed(2)}
              </span>
            </div>
          </div>

          {dashboardData.earnings > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Reinvest your profits to compound your returns and grow your
                investment portfolio.
              </p>

              {/* Investment Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleReinvestClick("starter")}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">Starter Plan</h3>
                      <p className="text-sm text-gray-400">$25 - $599</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold">12%</p>
                      <p className="text-xs text-gray-400">every 3 days</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleReinvestClick("basic")}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">Basic Plan</h3>
                      <p className="text-sm text-gray-400">$600 - $999</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold">15%</p>
                      <p className="text-xs text-gray-400">every 3 days</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleReinvestClick("professional")}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">Professional</h3>
                      <p className="text-sm text-gray-400">$1,000 - $9,999</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold">30%</p>
                      <p className="text-xs text-gray-400">every 3 days</p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleReinvestClick("vip")}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">VIP Plan</h3>
                      <p className="text-sm text-gray-400">$10,000+</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold">60%</p>
                      <p className="text-xs text-gray-400">every 3 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-gray-400 font-medium mb-2">
                No Earnings Available
              </h3>
              <p className="text-gray-500 text-sm">
                Start investing to earn profits that you can reinvest
              </p>
            </div>
          )}
        </div>

        {/* Referral Section */}
        <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Referral Link</p>
              <p className="text-white text-sm font-medium">
                https://greystartrustfund.com/?ref=myname
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
                Click "Transaction" to see your profits paid every 3 days,
                interest will be added to your account balance in accordance
                with the chosen invest plan.
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

          <button
            onClick={() => setCurrentPage("chat")}
            className="flex flex-col items-center p-2 text-gray-400"
          >
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
        <button
          onClick={() => setCurrentPage("chat")}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
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

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Request Withdrawal
                  </h2>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-8 h-8 bg-slate-600/50 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                {/* Balance Info */}
                <div className="space-y-4">
                  {/* Available Balance */}
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-orange-300 font-medium">
                        Available Balance: ${dashboardData.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span className="text-green-300 font-medium">
                        Total Earnings: ${dashboardData.earnings.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Available Earnings for Withdrawal */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-blue-300 font-medium">
                        Available Earnings for Withdrawal:
                        {dashboardData.withdrawableEarnings > 0 ? (
                          <span className="text-blue-200 ml-1">
                            ${dashboardData.withdrawableEarnings.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 ml-1">
                            Earnings not yet eligible for withdrawal
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Source Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Withdrawal Source
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawFormChange("withdrawalSource", "balance")
                      }
                      className={`p-4 border-2 rounded-lg transition-all ${
                        withdrawForm.withdrawalSource === "balance"
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          className="w-8 h-8 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-white font-medium">
                          Account Balance
                        </span>
                        <span className="text-orange-300 text-sm">
                          ${dashboardData.balance.toFixed(2)} available
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawFormChange("withdrawalSource", "earnings")
                      }
                      disabled={dashboardData.withdrawableEarnings <= 0}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        withdrawForm.withdrawalSource === "earnings"
                          ? "border-blue-500 bg-blue-500/10"
                          : dashboardData.withdrawableEarnings <= 0
                          ? "border-gray-600 bg-gray-700/30 opacity-50 cursor-not-allowed"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          className="w-8 h-8 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <span className="text-white font-medium">
                          Approved Earnings
                        </span>
                        <span
                          className={`text-sm ${
                            dashboardData.withdrawableEarnings > 0
                              ? "text-blue-300"
                              : "text-gray-400"
                          }`}
                        >
                          {dashboardData.withdrawableEarnings > 0
                            ? `$${dashboardData.withdrawableEarnings.toFixed(
                                2
                              )} available`
                            : "Not eligible"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={
                        withdrawForm.withdrawalSource === "balance"
                          ? dashboardData.balance
                          : dashboardData.withdrawableEarnings
                      }
                      value={withdrawForm.amount}
                      onChange={(e) =>
                        handleWithdrawFormChange("amount", e.target.value)
                      }
                      className="w-full pl-8 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="Enter withdrawal amount"
                      required
                    />
                  </div>
                </div>

                {/* Account Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawFormChange("accountType", "bank")
                      }
                      className={`p-4 border-2 rounded-lg transition-all ${
                        withdrawForm.accountType === "bank"
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          className="w-8 h-8 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                          />
                        </svg>
                        <span className="text-white font-medium">
                          Bank Account
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawFormChange("accountType", "crypto")
                      }
                      className={`p-4 border-2 rounded-lg transition-all ${
                        withdrawForm.accountType === "crypto"
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          className="w-8 h-8 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-white font-medium">
                          Crypto Wallet
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bank Account Details */}
                {withdrawForm.accountType === "bank" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      Bank Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          value={withdrawForm.accountDetails.bankName}
                          onChange={(e) =>
                            handleWithdrawFormChange(
                              "accountDetails.bankName",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter bank name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          value={withdrawForm.accountDetails.accountName}
                          onChange={(e) =>
                            handleWithdrawFormChange(
                              "accountDetails.accountName",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Account holder name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          value={withdrawForm.accountDetails.accountNumber}
                          onChange={(e) =>
                            handleWithdrawFormChange(
                              "accountDetails.accountNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter account number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={withdrawForm.accountDetails.routingNumber}
                          onChange={(e) =>
                            handleWithdrawFormChange(
                              "accountDetails.routingNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Routing number (if applicable)"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SWIFT Code
                        </label>
                        <input
                          type="text"
                          value={withdrawForm.accountDetails.swiftCode}
                          onChange={(e) =>
                            handleWithdrawFormChange(
                              "accountDetails.swiftCode",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="SWIFT code (for international transfers)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Crypto Wallet Details */}
                {withdrawForm.accountType === "crypto" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      Crypto Wallet Details
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.accountDetails.walletAddress}
                        onChange={(e) =>
                          handleWithdrawFormChange(
                            "accountDetails.walletAddress",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your wallet address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Network *
                      </label>
                      <select
                        value={withdrawForm.accountDetails.network}
                        onChange={(e) =>
                          handleWithdrawFormChange(
                            "accountDetails.network",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Select Network</option>
                        <option value="TRC20">TRC20 (Tron)</option>
                        <option value="BEP20">BEP20 (BSC)</option>
                        <option value="ERC20">ERC20 (Ethereum)</option>
                        <option value="BTC">Bitcoin Network</option>
                        <option value="ETH">Ethereum Network</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p className="text-red-400 text-sm font-medium mb-2">
                        Important Notice:
                      </p>
                      <ul className="text-red-300 text-sm space-y-1">
                        <li>
                          • Double-check all account details before submitting
                        </li>
                        <li>• Withdrawals are processed within 24-48 hours</li>
                        <li>
                          • Ensure account details are accurate to avoid delays
                        </li>
                        <li>
                          • Contact support if you need to modify your request
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600/50">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-600/50 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitLoading ||
                      !withdrawForm.amount ||
                      !withdrawForm.accountType
                    }
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 disabled:opacity-50 text-white rounded-lg font-medium shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    {submitLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span>Submit Withdrawal Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reinvestment Modal */}
      {showReinvestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-lg">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Reinvest Earnings
                  </h2>
                </div>
                <button
                  onClick={() => setShowReinvestModal(false)}
                  className="w-8 h-8 bg-slate-600/50 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleReinvestSubmit} className="space-y-6">
                {/* Plan Info */}
                {selectedReinvestPlan && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-blue-300 font-medium">
                          {selectedReinvestPlan.name}
                        </h3>
                        <p className="text-blue-200 text-sm">
                          Range: ${selectedReinvestPlan.minAmount} -{" "}
                          {selectedReinvestPlan.maxAmount === Infinity
                            ? "∞"
                            : `$${selectedReinvestPlan.maxAmount}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold text-xl">
                          {selectedReinvestPlan.profit}%
                        </p>
                        <p className="text-blue-300 text-sm">every 3 days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Earnings Info */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-green-300 font-medium">
                      Available Earnings: ${dashboardData.earnings.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reinvestment Amount (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min={selectedReinvestPlan?.minAmount || 25}
                      max={Math.min(
                        dashboardData.earnings,
                        selectedReinvestPlan?.maxAmount || Infinity
                      )}
                      value={reinvestForm.amount}
                      onChange={(e) =>
                        handleReinvestFormChange("amount", e.target.value)
                      }
                      className="w-full pl-8 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter reinvestment amount"
                      required
                    />
                  </div>
                  {selectedReinvestPlan && (
                    <p className="mt-2 text-sm text-gray-400">
                      Minimum: ${selectedReinvestPlan.minAmount} | Maximum:{" "}
                      {selectedReinvestPlan.maxAmount === Infinity
                        ? "No limit"
                        : `$${selectedReinvestPlan.maxAmount}`}
                    </p>
                  )}
                </div>

                {/* Info Notice */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-yellow-400 text-sm font-medium mb-2">
                        Reinvestment Details:
                      </p>
                      <ul className="text-yellow-300 text-sm space-y-1">
                        <li>• Your earnings will be automatically invested</li>
                        <li>• New investment cycle starts immediately</li>
                        <li>• 30-day maturity period applies</li>
                        <li>• Profits paid every 3 days to your balance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600/50">
                  <button
                    type="button"
                    onClick={() => setShowReinvestModal(false)}
                    className="px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-600/50 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading || !reinvestForm.amount}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-lg font-medium shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    {submitLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Confirm Reinvestment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Make Deposit
                  </h2>
                </div>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="w-8 h-8 bg-slate-600/50 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
                      onChange={(e) =>
                        handleDepositFormChange("amount", e.target.value)
                      }
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
                      <div
                        key={account.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          depositForm.selectedAccount === account.id
                            ? "border-green-500 bg-green-500/10"
                            : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                        }`}
                        onClick={() =>
                          handleDepositFormChange("selectedAccount", account.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                depositForm.selectedAccount === account.id
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {depositForm.selectedAccount === account.id && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {account.currency}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {account.network}
                              </p>
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
                      <svg
                        className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-blue-300 font-medium mb-2">
                          Payment Instructions:
                        </h4>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>1. Copy the wallet address above</li>
                          <li>
                            2. Send the exact amount to the copied address
                          </li>
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
                        <svg
                          className="w-8 h-8 mb-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          payment proof
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF or PDF (MAX. 10MB)
                        </p>
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
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
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
