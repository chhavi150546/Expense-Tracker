import React, { useState, useEffect } from "react";

export default function About() {
  const [darkMode, setDarkMode] = useState(false);

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
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-r from-blue-200 via-purple-100 to-indigo-200 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <header
        className={`flex justify-between items-center px-8 py-4 shadow-lg transition ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        
        <div className="flex items-center gap-6">
          
          <button
            onClick={handleToggle}
            className={`px-3 py-1 rounded-full text-lg font-semibold transition ${
              darkMode
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12 transition">
        {/* Image */}
        <div className="flex justify-center w-full md:w-1/2">
          <img
            src="https://static.thenounproject.com/png/about-us-icon-105359-512.png"
            alt="About us"
            className="w-[400px] rounded-2xl shadow-2xl hover:scale-105 transition-transform"
          />
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2
            className={`text-5xl font-extrabold mb-6 ${
              darkMode ? "text-blue-400" : "text-blue-700"
            }`}
          >
            About Us
          </h2>
          <p className="text-lg mb-6 leading-relaxed">
            Welcome to{" "}
            <span
              className={`font-semibold ${
                darkMode ? "text-indigo-400" : "text-blue-600"
              }`}
            >
              Expense Tracker
            </span>
            – your smart and simple solution to manage daily expenses, set
            budgets, and gain financial insights.
          </p>
          <p className="text-lg leading-relaxed">
            Whether you're a student, professional, or business owner, Expense
            Tracker helps you take control of your money and build better
            financial habits — effortlessly.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-12 text-center transition ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"
        }`}
      >
        <h3 className="text-2xl font-bold mb-4">
          Start managing your money better today!
        </h3>
        <a href="/">
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transition">
            Get Started
          </button>
        </a>
      </section>

      {/* Footer */}
      <footer
        className={`text-center py-4 text-sm shadow-inner transition ${
          darkMode ? "bg-gray-900 text-gray-400" : "bg-white text-gray-700"
        }`}
      >
        © 2025 Expense Tracker. Built to simplify your finances. <br />
        <a
          href="/feedback"
          className={`hover:underline ${
            darkMode ? "text-indigo-400" : "text-blue-600"
          }`}
        >
          Give Feedback
        </a>
      </footer>
    </div>
  );
}