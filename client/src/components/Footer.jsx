import React from "react";

const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "Home", href: "#home" },
        { name: "About Us", href: "#about" },
        { name: "Contact Us", href: "#contact" },
        { name: "FAQs", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Certificate of Incorporation", href: "#" },
        { name: "Privacy Policy", href: "#" },
      ],
    },
    {
      title: "Trading",
      links: [
        { name: "Forex Trading", href: "#services" },
        { name: "Cryptocurrency", href: "#services" },
        { name: "Stock Trading", href: "#services" },
        { name: "Real Estate", href: "#services" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Trading Signals", href: "#" },
        { name: "MetaTrader 5", href: "#" },
        { name: "Account Management", href: "#" },
        { name: "24/7 Support", href: "#contact" },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: "#",
    },
    {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      href: "#",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      href: "#",
    },
    {
      name: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.533l1.784-1.784c.455.684 1.236 1.138 2.134 1.138.684 0 1.297-.342 1.663-.855l1.784 1.784c-.787 1.297-2.192 2.25-3.876 2.25h-.284zm7.875-1.533c-.758.937-1.908 1.533-3.205 1.533h-.284c-1.684 0-3.089-.953-3.876-2.25l1.784-1.784c.366.513.979.855 1.663.855.898 0 1.679-.454 2.134-1.138l1.784 1.784z" />
        </svg>
      ),
      href: "#",
    },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="text-2xl font-bold text-orange-400 font-rubik flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-400 rounded mr-2 flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-sm">B</span>
                  </div>
                  GreyStar
                </div>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Founded and managed by leading industry professionals,
                  GreyStar was established with a clear vision: To provide
                  unrivaled trading solutions to investors from all over the
                  world with a stellar client centered culture.
                </p>
              </div>

              {/* Partner Info */}
              <div className="space-y-3 mb-6">
                <p className="text-gray-400 text-sm leading-relaxed">
                  A partner invested in your success. Trade with confidence and
                  benefit from the reliability of a trusted broker with a proven
                  record of stability, security and strength.
                </p>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors duration-200"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted Since Section */}
        <div className="border-t border-slate-700 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-400 max-w-4xl mx-auto leading-relaxed">
              GreyStar is an online Forex and cryptocurrency STP broker
              providing CFD trading on hundreds of assets and optimal trading
              conditions within the award-winning MT4 platform. GreyStar offers
              deep liquidity, generous leverage up to 1:500, and some of the
              best spreads in the industry. As part of our commitment to our
              client's satisfaction, we offer 24/7 live customer service, charge
              no deposit or withdrawal fees, and process withdrawals within
              30-minutes or less.
            </p>
          </div>

          {/* As Seen On */}
          <div className="text-center mb-8">
            <h5 className="text-lg font-semibold mb-4">As seen on</h5>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-gray-500">BBC</div>
              <div className="text-gray-500">CNN</div>
              <div className="text-gray-500">Reuters</div>
              <div className="text-gray-500">Bloomberg</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-slate-700 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-4">
              This GreyStar can be accessed worldwide however the information on
              the website is related to GreyStar and is not specific to another
              entity of GreyStar. All clients will directly engage with GreyStar
              A/S and all client agreements will be entered into with GreyStar
              A/S and thus governed by UK Law.
            </p>
            <p className="mb-4">
              Apple and the Apple logo are trademarks of Apple Inc, registered
              in the US and other countries and regions. App Store is a service
              mark of Apple Inc. Google Play and the Google Play logo are
              trademarks of Google LLC.
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 GreyStar. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Risk Disclaimer
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
