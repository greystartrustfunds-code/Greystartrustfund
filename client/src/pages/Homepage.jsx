import React, { useState } from "react";
import AfterHeader from "../components/AfterHeader";
import MarketAnalysis from "../components/MarketAnalysis";

const Homepage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const tradingPlans = [
    {
      name: "STARTER PLAN",
      minFunding: "$25",
      minDeposit: "$25",
      maxDeposit: "$599",
      profit: "12%",
      duration: "12% after 20 hours",
      features: [
        "Instant Deposit and Withdrawal",
        "Industry-leading entry prices",
        "Basic trading signals",
        "Email support",
      ],
      bgColor: "bg-slate-800",
      textColor: "text-red-400",
      buttonColor: "bg-red-500",
      popular: false,
    },
    {
      name: "BASIC PLAN",
      minFunding: "$600",
      minDeposit: "$600",
      maxDeposit: "$999",
      profit: "15%",
      duration: "15% after 48 hours",
      features: [
        "Instant Deposit and Withdrawal",
        "Tighter spreads and commissions",
        "Advanced trading signals",
        "Priority support",
      ],
      bgColor: "bg-slate-800",
      textColor: "text-orange-400",
      buttonColor: "bg-orange-500",
      popular: false,
    },
    {
      name: "PROFESSIONAL PLAN",
      minFunding: "$1,000",
      minDeposit: "$1,000",
      maxDeposit: "$9,999",
      profit: "30%",
      duration: "30% after 72 hours",
      features: [
        "Instant Deposit and Withdrawal",
        "Premium market access",
        "Professional trading tools",
        "24/7 phone support",
      ],
      bgColor: "bg-slate-800",
      textColor: "text-yellow-400",
      buttonColor: "bg-yellow-500",
      popular: true,
    },
    {
      name: "VIP PLAN",
      minFunding: "$10,000",
      minDeposit: "$10,000",
      maxDeposit: "UNLIMITED",
      profit: "60%",
      duration: "60% after 24 hours",
      features: [
        "Instant Deposit and Withdrawal",
        "Exclusive VIP benefits",
        "Personal account manager",
        "White-glove service",
      ],
      bgColor: "bg-slate-800",
      textColor: "text-red-400",
      buttonColor: "bg-red-500",
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "RUKKY SANDERS",
      text: "GreyStar runs a quick and reliable system. It feels great to know that I can always trust their support system to come through for me. Their response speed is prompt and the delivery precise to the last detail.",
      rating: 5,
    },
    {
      name: "SCOTT SMITH",
      text: "Am an engineer in Washington DC when an account manager KLOE AURORA brought this opportunity to me I just said casually to invest with $500 but my story today is on a premium plan.",
      rating: 5,
    },
    {
      name: "ALEX GLYSON",
      text: "I have only been a member for a few months and i have already earned a decent amount of money. Finally a real and honest company that does what it says. Thank you so much for this great opportunity!",
      rating: 5,
    },
  ];

  const whyChooseUs = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "30 years",
      subtitle: "Experience",
      description: "Since 2015",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: "8 years",
      subtitle: "UK Regulated",
      description: "Since 2016",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "10+",
      subtitle: "Signal orders per day",
      description: "Fast execution after payment",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "24/7",
      subtitle: "Operational support",
      description: "High-quality and 24/7 support",
    },
  ];

  const tradingFeatures = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Wide Range of",
      subtitle: "Trading Instruments",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: "Experienced",
      subtitle: "Trading Conditions",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: "Engine License",
      subtitle: "& Regulated",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
      ),
      title: "Wide Range of",
      subtitle: "Trading Instruments",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Lightning",
      subtitle: "Trading Conditions",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
      title: "Globally Licensed",
      subtitle: "& Regulated",
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section id="home" className="py-20 lg:py-32 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://www.youstable.com/blog/wp-content/uploads/2023/03/forex-trading-2-scaled.jpg")',
          }}
        ></div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-900/70"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 border border-red-500 rounded-full"></div>
          <div className="absolute top-40 right-20 w-32 h-32 border border-orange-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-48 h-48 border border-red-500 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className=" items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-white font-rubik leading-tight mb-6">
                <span className="text-white">Trade Shares and Forex</span>
                <br />
                <span className="text-white">with Financial Thinking</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mb-8">
                Access 40,000+ instruments – across asset classes – to trade,
                hedge and invest from a single account. Track all markets on
                TradingView.
              </p>

              <div className="mb-8">
                <button className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors duration-200 mr-4">
                  Start Trade
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
                {tradingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="text-red-400 mb-2 flex justify-center">
                      {feature.icon}
                    </div>
                    <div className="text-sm font-medium text-white">
                      {feature.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {feature.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-slate-800 rounded-2xl p-8 text-white border border-slate-700">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                With the little you have you Trend. Join now!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-xl font-bold mb-2 text-red-400">
                    AWARD-WINNING SUPPORT
                  </div>
                  <div className="text-sm opacity-90">
                    24/7 professional assistance
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold mb-2 text-orange-400">
                    REGULATED BY THE UK
                  </div>
                  <div className="text-sm opacity-90">
                    Licensed and secure trading
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold mb-2 text-yellow-400">
                    30 YEARS EXPERIENCE
                  </div>
                  <div className="text-sm opacity-90">
                    Trusted by professionals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After Header Section */}
      <AfterHeader />

      {/* Market Analysis Section */}
      <MarketAnalysis />

      {/* Trading Instruments Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-rubik">
              Trading Instruments.
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Customer expectations have changed. Make sure your application
              delivers a seamless experience, every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Forex</h3>
                <p className="text-2xl font-bold text-red-400">
                  50 Pairs of FX
                </p>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Trade 182 FX spot pairs and 140 forwards across majors, minors,
                exotics and metals.
              </p>
            </div>

            <div className="bg-amber-900 text-white rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">CFD's</h3>
                <p className="text-2xl font-bold">50 Pairs of FX</p>
              </div>
              <p className="text-sm text-amber-100 mb-4">
                Trade and invest confidently in top performing CFDs with our
                timely Trading signals.
              </p>
            </div>

            <div className="bg-slate-700 text-white rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Metals</h3>
                <p className="text-2xl font-bold text-orange-400">
                  50 Pairs of FX
                </p>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Access 19,000+ stocks across core and emerging markets on 36
                exchanges worldwide.
              </p>
            </div>

            <div className="bg-blue-900 text-white rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Crypto</h3>
                <p className="text-2xl font-bold">50 Pairs of FX</p>
              </div>
              <p className="text-sm text-blue-100 mb-4">
                Simplified Crypto investment for relatively small amounts
                through our crowdfunding model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-rubik">
              Complete packages for{" "}
              <span className="text-red-600">every investor</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Get ultra-competitive spreads and commissions across all asset
              classes. Receive even better rates as your volume increases.
            </p>
          </div>

          {/* Asset Classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">0.2</div>
              <div className="text-sm text-gray-600 mb-2">pip</div>
              <div className="font-semibold text-gray-900 mb-2">FX</div>
              <div className="text-sm text-gray-600">Spread as low as</div>
              <p className="text-xs text-gray-500 mt-2">
                Trade 182 FX spot pairs and 140 forwards across majors, minors,
                exotics and metals.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">0.4</div>
              <div className="text-sm text-gray-600 mb-2">on £500</div>
              <div className="font-semibold text-gray-900 mb-2">crypto</div>
              <div className="text-sm text-gray-600">Trade from</div>
              <p className="text-xs text-gray-500 mt-2">
                Trade and invest confidently in top performing Cryptocurrencies
                with our timely Trading signals.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">£3</div>
              <div className="text-sm text-gray-600 mb-2">on US stocks</div>
              <div className="font-semibold text-gray-900 mb-2">stocks</div>
              <div className="text-sm text-gray-600">Commissions from</div>
              <p className="text-xs text-gray-500 mt-2">
                Access 19,000+ stocks across core and emerging markets on 36
                exchanges worldwide.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                £100
              </div>
              <div className="text-sm text-gray-600 mb-2">per slot</div>
              <div className="font-semibold text-gray-900 mb-2">
                real estate
              </div>
              <div className="text-sm text-gray-600">Procure for as low as</div>
              <p className="text-xs text-gray-500 mt-2">
                Simplified Real Estate investment for relatively small amounts
                through our crowdfunding model.
              </p>
            </div>
          </div>

          {/* Trading Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {tradingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 ${
                  plan.popular ? "ring-4 ring-red-500 transform scale-105" : ""
                } hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="bg-red-500 text-white text-center py-2 text-sm font-medium">
                    MOST POPULAR
                  </div>
                )}

                <div
                  className={`${plan.bgColor} p-6 border-b border-slate-600`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium mb-2 text-gray-300">
                      MINIMUM FUNDING
                    </div>
                    <div className={`text-3xl font-bold ${plan.textColor}`}>
                      {plan.minFunding}
                    </div>
                    <div
                      className={`text-xl font-semibold mt-2 ${plan.textColor}`}
                    >
                      {plan.name}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min. Deposit:</span>
                      <span className="font-semibold">{plan.minDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max. Deposit:</span>
                      <span className="font-semibold">{plan.maxDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected profit:</span>
                      <span className="font-semibold text-green-600">
                        {plan.profit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{plan.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center text-sm"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full ${plan.buttonColor} text-white py-3 rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium`}
                  >
                    Open an Account
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Trading Process */}
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                How to Get Started
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start trading with GreyStar in three simple steps and join over
                5 million investors worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "Register",
                  title: "Create Account",
                  description:
                    "Fill in your personal details in our secure online application.",
                  icon: (
                    <svg
                      className="w-8 h-8"
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
                  ),
                },
                {
                  step: "Deposit",
                  title: "Fund Account",
                  description:
                    "Make a deposit via several cryptocurrencies or traditional methods.",
                  icon: (
                    <svg
                      className="w-8 h-8"
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
                  ),
                },
                {
                  step: "Trading",
                  title: "Start Trading",
                  description:
                    "Once approved, you can trade on desktop and mobile platforms.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  ),
                },
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 text-red-400 rounded-full mb-4">
                    {process.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {process.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {process.description}
                  </p>
                  <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {process.step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Tools */}
          <div className="bg-slate-800 rounded-2xl p-8 text-white text-center border border-slate-700">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Trade on World Class Platform
            </h3>
            <p className="text-lg mb-8 opacity-90">
              MetaTrader 5 for mobile with real-time quotes, financial news, FX
              & stock charts, technical analysis and online trading.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-xl font-bold mb-2 text-red-400">
                  Download From
                </div>
                <div className="text-lg">Play Store</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold mb-2 text-orange-400">
                  Download From
                </div>
                <div className="text-lg">App Store</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold mb-2 text-yellow-400">
                  Download From
                </div>
                <div className="text-lg">Microsoft Store</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-rubik">
              About <span className="text-red-400">GreyStar</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Market analysis and trade inspiration. With a thriving network of
              experts, being a client of GreyStar opens doors to many
              opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                Financial Strength You Can Depend On
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We help your money grow by putting it to work. Not just by
                words. Our experts ensure not only that your funds are at work,
                but are put in carefully planned and strategically diversified
                trading and investment portfolio for risk management.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                GreyStar is an online Forex and cryptocurrency STP broker
                providing CFD trading on hundreds of assets and optimal trading
                conditions within the award-winning MT4 platform. We offer deep
                liquidity, generous leverage up to 1:500, and some of the best
                spreads in the industry.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">
                    Strategies & Discussions
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">
                    Forecasts & Education
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">7+</div>
                  <div className="text-sm text-gray-600">Years Trusted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">480K+</div>
                  <div className="text-sm text-gray-600">Investors Club</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">5M+</div>
                  <div className="text-sm text-gray-600">
                    Connected Worldwide
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-100 rounded-2xl p-8 h-96 border border-gray-200">
                <div className="text-center h-full flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    Multi-Award Winner
                  </h4>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="font-bold text-red-400">
                        Best CFD Broker
                      </div>
                      <div className="text-sm text-gray-600">
                        TradeON Summit 2020
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="font-bold text-orange-400">
                        Best Trading Experience
                      </div>
                      <div className="text-sm text-gray-600">
                        Jordan Forex EXPO 2015
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="font-bold text-yellow-400">
                        Best Execution Broker
                      </div>
                      <div className="text-sm text-gray-600">
                        Forex EXPO Dubai 2017
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gray-100 rounded-2xl p-8 text-gray-900 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold mb-2 text-red-400">
                  1000+
                </div>
                <div className="text-sm opacity-90">Daily trades</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold mb-2 text-red-400">
                  480K+
                </div>
                <div className="text-sm opacity-90">Clients</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold mb-2 text-red-400">
                  2.5B+
                </div>
                <div className="text-sm opacity-90">USD daily trade volume</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold mb-2 text-red-400">
                  5B+
                </div>
                <div className="text-sm opacity-90">
                  USD assets under management
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Why Investors Choose Us */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white font-rubik">
              Why Investors <span className="text-red-400">Choose Us</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-slate-800 hover:shadow-lg transition-shadow duration-200 border border-slate-700"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 text-red-400 rounded-full mb-4">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {item.title}
                </div>
                <div className="text-lg font-semibold text-white mb-2">
                  {item.subtitle}
                </div>
                <div className="text-sm text-gray-300">{item.description}</div>
              </div>
            ))}
          </div>

          {/* Testimonials Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                What Our Clients Say
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 border border-slate-700"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Confidence Section */}
          <div className="bg-slate-800 rounded-2xl p-8 lg:p-12 text-white mb-20 border border-slate-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Trade with Confidence
              </h3>
              <p className="text-lg opacity-90">
                New level of security and financial strength you can depend on
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold mb-4 text-red-400">
                  Regulations & Funds
                </h4>
                <p className="opacity-90 leading-relaxed">
                  Governments issue regulations related to environmental
                  practices, employee practices, advertising practices, and much
                  more. Furthermore, government regulations affect how companies
                  structure their businesses.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-4 text-orange-400">
                  Depth of Protection
                </h4>
                <p className="opacity-90 leading-relaxed">
                  Defense-in-depth is an information assurance strategy that
                  provides multiple, redundant defensive measures in case a
                  security control fails or a vulnerability is exploited.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <button className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors duration-200">
                OPEN YOUR ACCOUNT
              </button>
            </div>
          </div>

          {/* Contact Form & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">
                Get In Touch
              </h3>
              <p className="text-gray-300 mb-6">
                Connect with over 5 million investors in the world's leading
                social investment network
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="account">Account Opening</option>
                      <option value="trading">Trading Support</option>
                      <option value="withdrawal">Withdrawals</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none text-white"
                    placeholder="Tell us about your trading goals or questions..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-4 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold text-lg"
                >
                  Create Account
                </button>
              </form>
            </div>

            {/* Up to the Minute Analysis */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">
                Up to the Minute Analysis
              </h3>
              <p className="text-gray-300 mb-8">
                Inform your decisions with timely dispatches from our large team
                of global analysts.
              </p>

              {/* Trading Features */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 text-red-400 rounded-lg flex items-center justify-center">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Maximum Value</h4>
                    <p className="text-gray-300 text-sm">
                      Get the best value from your investments
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 text-green-400 rounded-lg flex items-center justify-center">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Fast Executions
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Lightning-fast order execution
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 text-orange-400 rounded-lg flex items-center justify-center">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Trading Tools</h4>
                    <p className="text-gray-300 text-sm">
                      Professional trading platforms
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 text-yellow-400 rounded-lg flex items-center justify-center">
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
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Guide & Support
                    </h4>
                    <p className="text-gray-300 text-sm">
                      24/7 expert guidance
                    </p>
                  </div>
                </div>
              </div>

              {/* MetaTrader Info */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h4 className="text-lg font-bold text-white mb-3">
                  MetaTrader 5 for Mobile
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Online trading with Forex & Stock quotes, charts, technical
                  analysis and news. Forex & Stock brokers offer investors
                  investing in shares and currency trading via MetaTrader 5.
                  Your MT5 features real-time quotes, financial news, FX & stock
                  charts, technical analysis and online trading. Free demo
                  accounts are available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
