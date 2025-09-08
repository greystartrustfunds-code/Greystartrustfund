import React, { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const PingModal = ({ setCurrentPage }) => {
  const [pingNotification, setPingNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    checkForPingNotification();
    
    // Check once more after 10 seconds, then stop
    const timeout = setTimeout(() => {
      checkForPingNotification();
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  const checkForPingNotification = async () => {
    try {
      const response = await userAPI.getPingNotification();
      if (response.success && response.data.isActive) {
        setPingNotification(response.data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Error checking ping notification:", error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleContactSupport = () => {
    setCurrentPage("chat");
    handleClose();
  };

  if (!isVisible || !pingNotification) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-md border border-red-500/30 shadow-2xl transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.098 21.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                🎉 Special Offer!
              </h3>
              <p className="text-red-400 text-sm">Limited Time Opportunity</p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
          {/* Animated notification icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-red-500/20">
            <p className="text-white text-center text-lg font-semibold leading-relaxed">
              {pingNotification.message}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContactSupport}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Contact Support Now</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Warning text */}
          <div className="mt-4 text-center">
            <p className="text-yellow-400 text-xs">
              ⚠️ This offer may expire soon. Contact support for more details.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-t-2xl"></div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-20 right-16 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-16 left-16 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default PingModal;
