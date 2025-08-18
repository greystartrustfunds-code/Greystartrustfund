import React from "react";

const Contact = () => {
  return (
    <div className="bg-slate-900 text-white py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-rubik mb-4">
            Contact <span className="text-orange-400">Us</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Want to consult about our services or having any troubles? Just chat
            us on live or leave an email about your queries to get instant
            solution. Our support team is always glad to resolve your queries as
            soon as they can.
          </p>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left Side: Information */}
          <div className="space-y-8">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-orange-400 mb-4">
                Get in Touch
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Do not hesitate to reach out. Just fill in the contact form here
                and we’ll be sure to reply as fast as possible.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold mb-2">Message us</h4>
              <a
                href="mailto:[email protected]"
                className="text-orange-400 hover:text-orange-500 transition-colors duration-200 text-lg"
              >
                [email protected]
              </a>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Your Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Your Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Message:
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
