import React, { useState } from "react";

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-6 px-4"
      >
        <span className="text-lg font-medium text-gray-200">{question}</span>
        <span className="text-orange-400">
          {isOpen ? (
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
                d="M18 12H6"
              />
            </svg>
          ) : (
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
          )}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-6">
          <p className="text-gray-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const Faq = () => {
  const faqData = [
    {
      question: "How can I purchase a package?",
      answer:
        "Buying a package is very simple. Just sign up and login. This will open your dashboard where you will find the option of PLANS. Click on this option and you’ll find all packages. You can click on the buy button there, make a payment and you’re good to go.",
    },
    {
      question: "How much can I earn?",
      answer:
        "You can earn more than 100% of your investment for the plans you choose. After completion of the STARTER PLAN, your package will expire. To continue to earn, you need to invest again.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer:
        "Request a withdrawal from your dashboard after login; make sure you have a valid Crypto Wallet Address.",
    },
    {
      question: "I sent the wrong amount when investing?",
      answer:
        "If you sent the wrong amount when investing, your account will not be activated automatically. Contact our support department on LIVE SUPPORT and include a screenshot of your payment, TX Hash, Username and the package you wanted to invest in.",
    },
    {
      question: "How does the platform generate profit?",
      answer:
        "GREYSTAR TRUST FUND-ENERGY COMPANY generates profit by trading in the Top 10 cryptocurrencies. Its AI trading bot generates profit via arbitrage trading.",
    },
  ];

  return (
    <div className="bg-slate-900 text-white py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-rubik mb-4">
            Frequently Asked <span className="text-orange-400">Questions</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Here we have provided some relevant information regarding the
            functionality of GREYSTAR TRUST FUND-ENERGY COMPANY. If you have any
            other questions, please get in touch using our contact details.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-slate-800 rounded-lg shadow-lg">
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
