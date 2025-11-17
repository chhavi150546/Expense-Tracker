import React, { useState, useEffect } from "react";

export default function About() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load saved mode
  useEffect(() => {
    if (localStorage.getItem("dark-mode") === "enabled") {
      setDarkMode(true);
    }
  }, []);

  // Toggle dark/light mode
  const handleToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("dark-mode", newMode ? "enabled" : "disabled");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-r from-blue-200 via-purple-100 to-indigo-200 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <header
        className={`w-full shadow-lg transition-colors ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-xl font-extrabold tracking-tight select-none"
                aria-label="Expense Tracker Home"
              >
                <span
                  className={`inline-block align-middle ${
                    darkMode ? "text-indigo-300" : "text-blue-700"
                  }`}
                >
                  Expense
                </span>{" "}
                <span className="inline-block align-middle text-sm font-medium text-gray-500">
                  Tracker
                </span>
              </a>
            </div>

            {/* Desktop nav (hidden on small) */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/"
                className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              >
                About
              </a>
              <a
                href="/feedback"
                className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              >
                Feedback
              </a>

              <button
                onClick={handleToggle}
                aria-pressed={darkMode}
                className={`ml-2 px-3 py-1 rounded-full text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </nav>

            {/* Mobile controls */}
            <div className="flex items-center md:hidden gap-2">
              <button
                onClick={handleToggle}
                aria-pressed={darkMode}
                className={`p-2 rounded-full text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                className="p-2 rounded-md inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-label="Open menu"
              >
                {/* simple hamburger */}
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {mobileMenuOpen ? (
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
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className={`md:hidden border-t transition-colors ${
              darkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
            }`}
          >
            <div className="px-4 pt-4 pb-4 space-y-2">
              <a
                href="/"
                className="block text-base font-medium px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Home
              </a>
              <a
                href="/about"
                className="block text-base font-medium px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                About
              </a>
              <a
                href="/feedback"
                className="block text-base font-medium px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Feedback
              </a>
            </div>
          </div>
        )}
      </header>

      {/* About Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src="https://static.thenounproject.com/png/about-us-icon-105359-512.png"
              alt="Illustration representing About Us"
              loading="lazy"
              className="w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl transform transition-transform hover:scale-105 object-contain"
            />
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight ${
                darkMode ? "text-blue-400" : "text-blue-700"
              }`}
            >
              About Us
            </h2>
            <p className="text-base sm:text-lg mb-4 leading-relaxed">
              Welcome to{" "}
              <span
                className={`font-semibold ${
                  darkMode ? "text-indigo-400" : "text-blue-600"
                }`}
              >
                Expense Tracker
              </span>
              — your smart and simple solution to manage daily expenses, set
              budgets, and gain financial insights.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mb-6">
              Whether you're a student, professional, or business owner, Expense
              Tracker helps you take control of your money and build better
              financial habits—effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 justify-center md:justify-start">
              <a href="/" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transition transform">
                  Get Started
                </button>
              </a>
              <a
                href="/features"
                className={`mt-3 sm:mt-0 inline-block text-sm font-medium hover:underline ${
                  darkMode ? "text-indigo-300" : "text-blue-700"
                }`}
              >
                See features →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section
        className={`py-8 text-center transition-colors ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-xl sm:text-2xl font-bold mb-3">
            Start managing your money better today!
          </h3>
          <a href="/">
            <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow hover:scale-105 transition transform">
              Get Started
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`text-center py-6 text-sm transition-colors ${
          darkMode ? "bg-gray-900 text-gray-400" : "bg-white text-gray-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          © 2025 Expense Tracker. Built to simplify your finances. <br />
          <a
            href="/feedback"
            className={`hover:underline inline-block mt-1 ${
              darkMode ? "text-indigo-400" : "text-blue-600"
            }`}
          >
            Give Feedback
          </a>
        </div>
      </footer>
    </div>
  );
}
