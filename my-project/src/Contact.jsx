import React, { useEffect, useState } from "react";

export default function Contact() {
  const [darkMode, setDarkMode] = useState(false);
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastText, setToastText] = useState("");

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
      if (hour < 12) setGreeting("🌅 Good Morning! Have a great day ahead!");
      else if (hour < 18) setGreeting("☀️ Good Afternoon! Keep going strong!");
      else if (hour < 21) setGreeting("🌇 Good Evening! Hope your day was productive!");
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

  // 📋 Copy with toast (safe with fallback)
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setToastText(`Copied: ${text}`);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 1500);
    } catch (err) {
      setToastText("Could not copy");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 1500);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 sm:p-6 transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-br from-blue-400 via-purple-200 to-pink-200 text-gray-900"
      }`}
    >
      {/* Theme Toggle: top-right on larger screens, top-center on small */}
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="hidden sm:block" />
          <div className="sm:block">
            <button
              onClick={toggleTheme}
              aria-pressed={darkMode}
              className={`px-3 py-2 rounded-full shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"
              }`}
            >
              {darkMode ? "☀️ Day Mode" : "🌙 Night Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Content container */}
      <div className="w-full max-w-3xl mt-6">
        {/* Greeting + Clock */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-purple-700"}`}>
            {greeting}
          </h2>
          <p className={`text-xl font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {time}
          </p>
        </div>

        {/* Contact Card */}
        <div
          className={`mx-auto rounded-3xl p-6 sm:p-8 shadow-2xl border transition-colors ${
            darkMode ? "bg-gray-900 text-gray-200 border-gray-700" : "bg-white text-gray-800 border-transparent"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className={`text-3xl sm:text-4xl font-extrabold ${
                darkMode ? "text-white drop-shadow-[0_0_8px_#60a5fa]" : "text-gray-800"
              }`}
            >
              📞 Contact Us
            </h1>
            <p className={`text-sm sm:text-base mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              We’d love to hear from you. Reach out anytime!
            </p>
          </div>

          {/* Info grid - responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
            {/* Phone */}
            <div className="space-y-2">
              <p className="font-bold text-blue-600">Phone</p>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-lg font-medium">+91 9805206581</span>
                <button
                  onClick={() => copyToClipboard("+91 9805206581")}
                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm"
                  aria-label="Copy phone number"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <p className="font-bold text-blue-600">Email</p>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-lg font-medium">kashava595@gmail.com</span>
                <button
                  onClick={() => copyToClipboard("kashava595@gmail.com")}
                  className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm"
                  aria-label="Copy email"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <p className="font-bold text-blue-600 text-center sm:text-left">Address</p>
              <div className="mt-2 text-center sm:text-left">
                <p>1002 West 5th Ave</p>
                <p>Alaska, New York</p>
                <button
                  onClick={() => copyToClipboard("1002 West 5th Ave, Alaska, New York")}
                  className="mt-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm"
                  aria-label="Copy address"
                >
                  Copy address
                </button>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="mt-8 text-center">
            <a href="/" aria-label="Go back to home">
              <button
                className="rounded-xl px-6 py-2 font-semibold shadow-md hover:scale-105 transition bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                Back
              </button>
            </a>
          </div>

          {/* Footer */}
          <div className={`mt-6 text-center text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            © 2025 Expense Tracker | All Rights Reserved
          </div>
        </div>
      </div>

      {/* Toast - bottom center on mobile, bottom-right on larger screens */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed z-50 px-4 py-2 rounded-xl font-semibold shadow-lg transition-transform duration-200 ${
          toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        } ${darkMode ? "bg-black text-white" : "bg-gray-800 text-white" } 
          left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 md:bottom-6 bottom-6`}
      >
        {toastText || "Copied to clipboard!"}
      </div>
    </div>
  );
}
