import React, { useState, useEffect, useRef } from "react";

export default function Feedback() {
  const [darkMode, setDarkMode] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupError, setPopupError] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", feedback: "" });
  const [loading, setLoading] = useState(false);

  const popupTimerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("dark-mode");
    if (savedTheme === "enabled") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) localStorage.setItem("dark-mode", "enabled");
    else localStorage.setItem("dark-mode", "disabled");
  }, [darkMode]);

  // cleanup popup timer on unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
        popupTimerRef.current = null;
      }
    };
  }, []);

  // auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [formData.feedback]);

  const toggleTheme = () => setDarkMode((v) => !v);

  const showPopup = (message, isError = false, ms = 2500) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    setPopupMessage(message);
    setPopupError(isError);
    setPopupVisible(true);

    popupTimerRef.current = setTimeout(() => {
      setPopupVisible(false);
      popupTimerRef.current = null;
    }, ms);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, feedback } = formData;

    if (!name.trim() || !email.trim() || !feedback.trim()) {
      showPopup("⚠ Please fill out all fields!", true);
      return;
    }

    // basic email validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      showPopup("⚠ Please enter a valid email address!", true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showPopup("✅ Feedback submitted successfully!");
        setFormData({ name: "", email: "", feedback: "" });
      } else {
        showPopup("❌ Failed to submit feedback.", true);
      }
    } catch (error) {
      showPopup("🚨 Error connecting to server!", true);
      // eslint-disable-next-line no-console
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex items-center justify-center p-4 sm:p-6 ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-200"
          : "bg-gradient-to-r from-blue-400 via-purple-200 to-indigo-300 text-gray-800"
      }`}
    >
      {/* Theme toggle: top-right on md+, centered above card on small screens */}
      <div className="absolute top-6 right-6 hidden sm:block">
        <button
          onClick={toggleTheme}
          aria-pressed={darkMode}
          className={`px-3 py-2 rounded-full font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
            darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"
          }`}
        >
          {darkMode ? "☀ Day Mode" : "🌙 Night Mode"}
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch shadow-2xl rounded-2xl overflow-hidden ${
            darkMode ? "bg-gray-900" : "bg-white"
          }`}
        >
          {/* Left: marketing / illustration (hidden on small screens) */}
          <div
            className={`hidden lg:flex flex-col justify-center items-center p-8 gap-4 ${
              darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" : "bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900"
            }`}
            aria-hidden
          >
            <img
              src="https://images.unsplash.com/photo-1554224154-22dec7ec8818?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=90a3d0a0f1f5b9b9a7e9ce2b8b3f9e1e"
              alt="Feedback illustration"
              className="w-full max-w-xs object-contain rounded-lg shadow"
              loading="lazy"
            />
            <div className="text-center px-4">
              <h2 className="text-xl font-extrabold">Share your thoughts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Your feedback helps us improve. Short and honest feedback is highly appreciated.
              </p>
            </div>
          </div>

          {/* Right / center: form */}
          <div className={`p-6 sm:p-8 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
            {/* Mobile theme toggle row */}
            <div className="flex items-center justify-between sm:justify-end mb-4 sm:hidden">
              <button
                onClick={toggleTheme}
                aria-pressed={darkMode}
                className={`px-3 py-2 rounded-full font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                  darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"
                }`}
              >
                {darkMode ? "☀ Day" : "🌙 Night"}
              </button>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              We Value Your Feedback 💬
            </h1>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Help us improve your experience by sharing your thoughts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`mt-1 block w-full rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 ${
                      darkMode ? "bg-gray-800 text-white border border-gray-700 focus:ring-blue-400" : "border border-gray-300 bg-white focus:ring-blue-600"
                    }`}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`mt-1 block w-full rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 ${
                      darkMode ? "bg-gray-800 text-white border border-gray-700 focus:ring-blue-400" : "border border-gray-300 bg-white focus:ring-blue-600"
                    }`}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-medium">
                  Your Feedback
                </label>
                <textarea
                  id="feedback"
                  ref={textareaRef}
                  rows={4}
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Write your feedback here..."
                  className={`mt-1 block w-full rounded-xl p-3 shadow-sm resize-none overflow-hidden focus:outline-none focus:ring-2 ${
                    darkMode ? "bg-gray-800 text-white border border-gray-700 focus:ring-blue-400" : "border border-gray-300 bg-white focus:ring-blue-600"
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                    loading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>

                <a
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition text-center"
                >
                  Back
                </a>
              </div>

              <p className="text-xs text-center text-gray-500 mt-2">
                By submitting, you agree to our <button type="button" className="underline">Privacy Policy</button>.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Toast / popup: bottom-center on small screens, bottom-right on md+ */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed z-50 px-4 py-2 rounded-xl shadow-lg font-semibold transition-all duration-300 transform ${
          popupVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
        } ${popupError ? "bg-red-500 text-white" : "bg-gradient-to-r from-blue-500 to-purple-600 text-white" } 
          ${/* responsive placement */""} bottom-6 left-1/2 -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0`}
      >
        {popupMessage}
      </div>
    </div>
  );
}
