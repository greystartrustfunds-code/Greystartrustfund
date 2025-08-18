import React from 'react'

const AfterHeader = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Free analysis tools"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Fast execution 0 commission"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
        </svg>
      ),
      title: "Low minimum deposit"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Over 2,100 assets to trade"
    }
  ]

  const pricingCards = [
    {
      category: "FX",
      description: "Spread as low as",
      price: "0.2",
      unit: "pip",
      details: "Trade 182 FX spot pairs and 140 forwards across majors, minors, exotics and metals."
    },
    {
      category: "Crypto",
      description: "Trade from",
      price: "0.4",
      unit: "on £500",
      details: "Trade and invest confidently in top performing Cryptocurrencies with our timely Trading signals that ensure your profitability from day one."
    },
    {
      category: "Stocks",
      description: "Commissions from",
      price: "£3",
      unit: "on US stocks",
      details: "Access 19,000+ stocks across core and emerging markets on 36 exchanges worldwide."
    },
    {
      category: "Real Estate",
      description: "Procure for as low as",
      price: "£100",
      unit: "per slot",
      details: "Simplified Real Estate investment for relatively small amounts through our crowdfunding model."
    }
  ]

  return (
    <section className=" py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-900 text-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-medium leading-tight">{feature.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Industry-leading prices section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Industry-leading prices
          </h2>
          <p className="text-lg text-slate-500 max-w-4xl mx-auto">
            Get ultra-competitive spreads and commissions across all asset classes. Receive even 
            better rates as your volume increases.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingCards.map((card, index) => (
            <div key={index} className="bg-slate-700 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{card.category}</h3>
                <p className="text-sm text-gray-300 mb-4">{card.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-red-400">{card.price}</span>
                  <div className="text-sm text-gray-300 mt-1">{card.unit}</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 leading-relaxed">
                {card.details}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-slate-700 border border-red-500 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-8 w-32 h-32 border border-red-500 rounded-full"></div>
              <div className="absolute bottom-4 left-8 w-24 h-24 border border-orange-500 rounded-full"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                With the little you have you Trend. Join now!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-xl font-bold mb-2 text-red-400">AWARD-WINNING SUPPORT</div>
                  <div className="text-sm opacity-90">24/7 professional assistance</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold mb-2 text-orange-400">REGULATED BY THE UK</div>
                  <div className="text-sm opacity-90">Licensed and secure trading</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold mb-2 text-yellow-400">30 YEARS EXPERIENCE</div>
                  <div className="text-sm opacity-90">Trusted by professionals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AfterHeader