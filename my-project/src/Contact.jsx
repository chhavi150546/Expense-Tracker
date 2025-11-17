import React, { useState, useEffect } from "react";

export default function Contact() {
  const [darkMode, setDarkMode] = useState(false);
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Load theme preference
  useEffect(() => {
    if (localStorage.getItem("dark-mode") === "enabled") {
      setDarkMode(true);
    }
  }, []);

  // 🕒 Update live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🌤️ Greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12)
        setGreeting("🌅 Good Morning! Have a great day ahead!");
      else if (hour < 18)
        setGreeting("☀️ Good Afternoon! Keep going strong!");
      else if (hour < 21)
        setGreeting("🌇 Good Evening! Hope your day was productive!");
      else setGreeting("🌙 Good Night! Don't forget to rest well.");
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🌙 Toggle theme
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("dark-mode", newMode ? "enabled" : "disabled");
  };

  // 📋 Copy with toast
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-br from-blue-400 via-purple-200 to-pink-200 text-gray-900"
      }`}
    >
      {/* 🌙 Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-26 right-6 px-4 py-2 rounded-full shadow-lg text-sm font-semibold hover:scale-105 transition ${
          darkMode
            ? "bg-yellow-400 text-black"
            : "bg-black text-white"
        }`}
      >
        {darkMode ? "☀️ Day Mode" : "🌙 Night Mode"}
      </button>

      {/* Greeting + Clock */}
      <div className="text-center mb-4">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-blue-400" : "text-purple-700"
          }`}
        >
          {greeting}
        </h2>
        <p
          className={`text-xl font-semibold ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {time}
        </p>
      </div>

      {/* 📞 Contact Box */}
      <div
        className={`w-[700px] rounded-3xl p-10 shadow-2xl border transition-all ${
          darkMode
            ? "bg-gray-900 text-gray-200 border-gray-700"
            : "bg-white text-gray-800 border-white"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className={`text-4xl font-extrabold ${
              darkMode
                ? "text-white drop-shadow-[0_0_8px_#60a5fa]"
                : "text-gray-800"
            }`}
          >
            📞 Contact Us
          </h1>
          <p
            className={`text-lg mt-2 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We’d love to hear from you. Reach out anytime!
          </p>
        </div>

        {/* Info */}
        <div
          className={`text-lg text-center space-y-6 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <div>
            <p className="font-bold text-blue-600">Phone number:</p>
            <p
              onClick={() => copyToClipboard("+91 9805206581")}
              className="cursor-pointer hover:text-blue-800"
            >
              +91 9805206581 📋
            </p>
          </div>

          <div>
            <p className="font-bold text-blue-600">Email:</p>
            <p
              onClick={() => copyToClipboard("kashava595@gmail.com")}
              className="cursor-pointer hover:text-blue-800"
            >
              kashava595@gmail.com 📋
            </p>
          </div>

          <div>
            <p className="font-bold text-blue-600">Address:</p>
            <p>1002 West 5th Ave, Alaska</p>
            <p>New York</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-16 text-center">
          <a href="/">
            <button
              className="rounded-xl px-8 py-3 font-semibold shadow-lg hover:scale-105 transition bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              Back
            </button>
          </a>
        </div>

        {/* Footer */}
        <div
          className={`mt-8 text-center text-sm ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          © 2025 Expense Tracker | All Rights Reserved
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-8 right-8 px-5 py-3 rounded-xl font-semibold shadow-lg transition-all ${
          toastVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } ${
          darkMode ? "bg-black text-white" : "bg-gray-800 text-white"
        }`}
      >
        Copied to clipboard!
      </div>
    </div>
  );
}