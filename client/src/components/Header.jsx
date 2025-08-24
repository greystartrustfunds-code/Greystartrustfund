import React, { useState } from "react";

const Header = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "HOME", page: "home" },
    { name: "ABOUT US", page: "about" },
    { name: "CONTACT", page: "contact" },
    { name: "FAQS", page: "faqs" },
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/src/assets/logo.png"
              alt="GreyStar"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setCurrentPage(item.page)}
                className={`font-medium transition-colors duration-200 text-sm ${
                  currentPage === item.page
                    ? "text-orange-400"
                    : "text-gray-300 hover:text-orange-400"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage("admin-login")}
              className="text-red-400 hover:text-red-300 font-medium text-xs"
            >
              ADMIN
            </button>
            <button
              onClick={() => setCurrentPage("signup")}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              OPEN ACCOUNT
            </button>
            <button
              onClick={() => setCurrentPage("login")}
              className="text-gray-300 hover:text-white font-medium"
            >
              LOGIN
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-orange-400 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left font-medium transition-colors duration-200 ${
                    currentPage === item.page
                      ? "text-orange-400"
                      : "text-gray-300 hover:text-orange-400"
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    setCurrentPage("admin-login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-red-400 hover:text-red-300 font-medium text-xs"
                >
                  ADMIN
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("signup");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-orange-400 hover:text-orange-300 font-medium"
                >
                  OPEN ACCOUNT
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-white font-medium"
                >
                  LOGIN
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
