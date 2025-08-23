import React, { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const plans = [
  {
    id: "starter",
    name: "Starter Plan",
    profit: 12,
    duration: "20 hours",
    minAmount: 25,
    maxAmount: 599,
    type: "profit",
  },
  {
    id: "basic",
    name: "Basic Plan",
    profit: 15,
    duration: "48 hours",
    minAmount: 600,
    maxAmount: 999,
    type: "profit",
  },
  {
    id: "professional",
    name: "Professional Plan",
    profit: 30,
    duration: "72 hours",
    minAmount: 1000,
    maxAmount: 9999,
    type: "profit",
  },
  {
    id: "vip",
    name: "Vip Plan",
    profit: 60,
    duration: "24 hours",
    minAmount: 10000,
    maxAmount: Infinity,
    type: "daily",
  },
];

const walletOptions = [
  { id: "bitcoin", label: "Deposit funds from Company Bitcoin wallet" },
  { id: "usdt", label: "Deposit funds from Company USDT wallet" },
  { id: "tron", label: "Deposit funds from Company Tron wallet" },
  { id: "usdc", label: "Deposit funds from Company USDC wallet" },
  { id: "bep20", label: "Deposit funds from Company bep20 wallet address" },
];

const Plans = ({ setCurrentPage, setIsAuthenticated }) => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("bitcoin");
  const [depositAmount, setDepositAmount] = useState("25.00");
  const [accountBalance, setAccountBalance] = useState(0);
  const [calculatedProfit, setCalculatedProfit] = useState(0);

  // using hoisted `plans` and `walletOptions` defined above

  useEffect(() => {
    fetchAccountBalance();
  }, []);

  useEffect(() => {
    if (selectedPlan && depositAmount) {
      const plan = plans.find((p) => p.id === selectedPlan);
      const amount = parseFloat(depositAmount);

      if (plan && amount >= plan.minAmount && amount <= plan.maxAmount) {
        const profit = (amount * plan.profit) / 100;
        setCalculatedProfit(profit);
      } else {
        setCalculatedProfit(0);
      }
    } else {
      setCalculatedProfit(0);
    }
  }, [selectedPlan, depositAmount]);

  const fetchAccountBalance = async () => {
    try {
      const response = await userAPI.getBalance();
      setAccountBalance(response.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setAccountBalance(0);
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setDepositAmount(plan.minAmount.toString());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentPage("home");
  };

  const handleDeposit = async () => {
    if (!selectedPlan || !depositAmount || !selectedWallet) {
      alert("Please select a plan, enter amount, and choose wallet");
      return;
    }

    const plan = plans.find((p) => p.id === selectedPlan);
    const amount = parseFloat(depositAmount);

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      alert(
        `Amount must be between $${plan.minAmount} and $${
          plan.maxAmount === Infinity ? "∞" : plan.maxAmount
        }`
      );
      return;
    }

    try {
      alert(
        `Deposit initiated: $${amount} via ${selectedWallet} wallet for ${plan.name}`
      );
    } catch (error) {
      console.error("Error processing deposit:", error);
      alert("Error processing deposit. Please try again.");
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
        <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
          <h1 className="text-xl font-bold text-white mb-6">Make a Deposit:</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">
              Select a plan:
            </h2>

            {plans.map((plan) => (
              <div
                key={plan.id}
                className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700"
              >
                <div className="flex items-center mb-3">
                  <input
                    type="radio"
                    id={plan.id}
                    name="plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={() => handlePlanSelect(plan.id)}
                    className="mr-3 text-red-400"
                  />
                  <label
                    htmlFor={plan.id}
                    className="text-lg font-medium text-white"
                  >
                    {plan.profit}% after {plan.duration}
                  </label>
                </div>

                <div className="overflow-x-auto mb-3">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 text-gray-300 text-sm">
                          Plan
                        </th>
                        <th className="text-left py-2 text-gray-300 text-sm">
                          Spent Amount ($)
                        </th>
                        <th className="text-left py-2 text-gray-300 text-sm">
                          {plan.type === "daily"
                            ? "Daily Profit (%)"
                            : "Profit (%)"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 text-white text-sm">{plan.name}</td>
                        <td className="py-2 text-white text-sm">
                          ${plan.minAmount.toFixed(2)} -{" "}
                          {plan.maxAmount === Infinity
                            ? "∞"
                            : `$${plan.maxAmount.toFixed(2)}`}
                        </td>
                        <td className="py-2 text-white text-sm">
                          {plan.profit.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button
                  className="text-red-400 hover:text-red-300 font-medium text-sm"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  Calculate your profit &gt;&gt;
                </button>

                {selectedPlan === plan.id && calculatedProfit > 0 && (
                  <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                    <p className="text-red-400 text-sm">
                      Expected profit:{" "}
                      <span className="font-bold text-white">
                        ${calculatedProfit.toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-xl p-4 space-y-4 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">
                Your account balance ($):
              </span>
              <span className="font-bold text-white">
                ${accountBalance.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <label htmlFor="depositAmount" className="text-gray-300 text-sm">
                Amount to Spend ($):
              </label>
              <input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-24 px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-slate-700 text-white"
                min="25"
                step="0.01"
              />
            </div>

            <div className="space-y-3">
              {walletOptions.map((wallet) => (
                <div key={wallet.id} className="flex items-center">
                  <input
                    type="radio"
                    id={wallet.id}
                    name="wallet"
                    value={wallet.id}
                    checked={selectedWallet === wallet.id}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="mr-3 text-red-400"
                  />
                  <label htmlFor={wallet.id} className="text-gray-300 text-sm">
                    {wallet.label}
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={handleDeposit}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="flex flex-col items-center p-2 text-gray-300"
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

          <button
            onClick={() => setCurrentPage("transactions")}
            className="flex flex-col items-center p-2 text-gray-300"
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

          <button className="flex flex-col items-center p-2 text-red-400">
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

          <button className="flex flex-col items-center p-2 text-gray-300">
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

export default Plans;
