import React, { useState, useEffect, useCallback } from "react";
import { adminUserAPI } from "../services/adminApi";

const AdminUsers = ({ setCurrentPage, setIsAdminAuthenticated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPingModal, setShowPingModal] = useState(false);
  const [selectedPingUser, setSelectedPingUser] = useState(null);
  const [selectedPingMessage, setSelectedPingMessage] = useState("");

  const pingMessages = [
    "UPGRADE YOUR ACCOUNT TO BASIC PLAN TO ACTIVATE VOUCHER OF $2000",
    "UPGRADE YOUR ACCOUNT TO PROFESSIONAL TO ACTIVATE VOUCHER OF $5500",
    "GET UP TO $3500 IN BONUS CREDIT BY ADDING $550 FOR ACTIVATION",
    "CONGRATULATIONS YOU ARE ALMOST AT THE VIP PLAN UPGRADE YOUR ACCOUNT TO CLAIM VOUCHER OF $30000",
    "A MINING BONUS OF $90624 HAVE BEEN ADDED TO YOUR ACCOUNT CONTACT THE SUPPORT FOR GUIDANCE ON HOW TO CLAIM IT",
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUserAPI.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });

      if (response.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        console.error("Failed to fetch users:", response.message);
        setUsers([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Users fetch error:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setIsAdminAuthenticated(false);
        setCurrentPage("admin-login");
      } else {
        // Show user-friendly error message
        alert(
          error.response?.data?.message ||
            "Failed to load users. Please try again."
        );
      }
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    setIsAdminAuthenticated,
    setCurrentPage,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPageState(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPageState(1);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      isVerified: user.isVerified || false,
      balance: user.balance || 0,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminUserAPI.updateUser(
        selectedUser._id,
        editForm
      );
      if (response.success) {
        // Update the user in the local state
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data : user
          )
        );
        setShowEditModal(false);
        setSelectedUser(null);
        alert("User updated successfully!");
      } else {
        alert(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("User update error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((u) => u._id === userId);
    const userName = user?.name || "this user";

    if (
      window.confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone and will remove all associated data.`
      )
    ) {
      try {
        const response = await adminUserAPI.deleteUser(userId);
        if (response.success) {
          setUsers(users.filter((user) => user._id !== userId));
          alert("User deleted successfully!");
        } else {
          alert(response.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("User delete error:", error);
        alert(
          error.response?.data?.message ||
            "Failed to delete user. Please try again."
        );
      }
    }
  };

  const handlePingUser = (user) => {
    setSelectedPingUser(user);
    setShowPingModal(true);
  };

  const handleSendPing = async () => {
    if (!selectedPingMessage) {
      alert("Please select a message to send");
      return;
    }

    try {
      const response = await adminUserAPI.pingUser(selectedPingUser._id, {
        message: selectedPingMessage,
      });

      if (response.success) {
        alert(
          `Ping notification sent to ${
            selectedPingUser.fullName || selectedPingUser.name
          }`
        );
        setShowPingModal(false);
        setSelectedPingMessage("");
        // Refresh users to show updated ping status
        fetchUsers();
      } else {
        alert(response.message || "Failed to send ping notification");
      }
    } catch (error) {
      console.error("Ping user error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send ping notification. Please try again."
      );
    }
  };

  const handleUnpingUser = async (userId) => {
    const user = users.find((u) => u._id === userId);
    const userName = user?.fullName || user?.name || "this user";

    if (window.confirm(`Remove ping notification from ${userName}?`)) {
      try {
        const response = await adminUserAPI.unpingUser(userId);
        if (response.success) {
          alert("Ping notification removed successfully!");
          // Refresh users to show updated ping status
          fetchUsers();
        } else {
          alert(response.message || "Failed to remove ping notification");
        }
      } catch (error) {
        console.error("Unping user error:", error);
        alert(
          error.response?.data?.message ||
            "Failed to remove ping notification. Please try again."
        );
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setIsAdminAuthenticated(false);
    setCurrentPage("admin-login");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg">
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                GreyStar Admin
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1 ml-8 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setCurrentPage("admin-dashboard")}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all text-sm"
              >
                Dashboard
              </button>
              <button className="px-4 py-2 rounded-md bg-red-500/80 text-white font-medium shadow-sm transition-all text-sm">
                Users
              </button>
              <button
                onClick={() => setCurrentPage("admin-transactions")}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all text-sm"
              >
                Transactions
              </button>
              <button
                onClick={() => setCurrentPage("admin-chats")}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all text-sm"
              >
                Chats
              </button>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg transition-all transform hover:scale-105 flex items-center space-x-1 md:space-x-2"
          >
            <svg
              className="w-3 h-3 md:w-4 md:h-4"
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
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden mt-4 flex space-x-1 bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setCurrentPage("admin-dashboard")}
            className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all text-xs whitespace-nowrap"
          >
            Dashboard
          </button>
          <button className="px-3 py-2 rounded-md bg-red-500/80 text-white font-medium shadow-sm transition-all text-xs whitespace-nowrap">
            Users
          </button>
          <button
            onClick={() => setCurrentPage("admin-transactions")}
            className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all text-xs whitespace-nowrap"
          >
            Transactions
          </button>
          <button
            onClick={() => setCurrentPage("admin-chats")}
            className="px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all text-xs whitespace-nowrap"
          >
            Chats
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                User Management
              </h2>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="appearance-none px-4 py-3 pr-10 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  <option value="">All Users</option>
                  <option value="verified">Verified Users</option>
                  <option value="unverified">Unverified Users</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
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
                      <span>User</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Balance</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Joined</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
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
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/30">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                        <span className="text-gray-400">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-400 font-medium">
                          No users found
                        </span>
                        <span className="text-gray-500 text-sm mt-1">
                          Try adjusting your search criteria
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-700/30 transition-all group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                            user.isVerified
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {user.isVerified ? (
                            <div className="flex items-center space-x-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <svg
                                className="w-3 h-3"
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
                              <span>Unverified</span>
                            </div>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                        ${(user.balance || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>

                          {/* Ping notification buttons */}
                          {user.pingNotification?.isActive ? (
                            <button
                              onClick={() => handleUnpingUser(user._id)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all"
                              title="Remove ping notification"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                                />
                              </svg>
                              Unping
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePingUser(user)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all"
                              title="Send ping notification"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 17h5l-5 5v-5zM11 13H6l5-5v5z"
                                />
                              </svg>
                              Ping
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-lg border border-slate-600/50 p-2 shadow-lg">
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPageState(page)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        page === currentPage
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105"
                          : "text-gray-300 hover:text-white hover:bg-slate-600/50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-6">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Edit User
              </h3>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Enter user's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Balance
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.balance}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={editForm.isVerified}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isVerified: e.target.checked })
                  }
                  className="w-5 h-5 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <label
                  htmlFor="isVerified"
                  className="ml-3 text-sm font-medium text-gray-300"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-400"
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
                    <span>Mark user as verified</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-600/50 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white rounded-lg font-medium shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  {loading ? (
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
                      <span>Updating...</span>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Update User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ping Modal */}
      {showPingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-red-500/30 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
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
                      d="M15 17h5l-5 5v-5zM11 13H6l5-5v5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Send Ping Notification
                  </h3>
                  <p className="text-gray-400 text-sm">
                    To: {selectedPingUser?.fullName || selectedPingUser?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPingModal(false);
                  setSelectedPingMessage("");
                }}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  Select promotional message:
                </label>
                <div className="space-y-3">
                  {pingMessages.map((message, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <input
                        type="radio"
                        name="pingMessage"
                        value={message}
                        checked={selectedPingMessage === message}
                        onChange={(e) => setSelectedPingMessage(e.target.value)}
                        className="mt-1 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-gray-200 text-sm leading-relaxed">
                        {message}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPingModal(false);
                    setSelectedPingMessage("");
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPing}
                  disabled={!selectedPingMessage}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span>Send Ping</span>
                </button>
              </div>

              {/* Warning */}
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-xs">
                  ⚠️ This will show a persistent promotional modal to the user
                  until they dismiss it. The modal will reappear on page reload.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
