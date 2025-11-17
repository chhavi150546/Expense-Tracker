import React, { useState, useEffect, useRef } from "react";

export default function Feedback() {
  const [darkMode, setDarkMode] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupError, setPopupError] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", feedback: "" });
  const [loading, setLoading] = useState(false);

  const popupTimerRef = useRef(null);

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

    if (!name || !email || !feedback) {
      showPopup("⚠ Please fill out all fields!", true);
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
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen p-6 overflow-y-auto transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-200"
          : "bg-gradient-to-r from-blue-400 via-purple-200 to-indigo-300 text-gray-800"
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`absolute top-24 right-6 px-4 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition ${
          darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"
        }`}
      >
        {darkMode ? "☀ Day Mode" : "🌙 Night Mode"}
      </button>

      <div
        className={`shadow-2xl rounded-2xl p-8 w-full max-w-md relative ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <h1 className={`text-2xl font-bold text-center mb-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
          We Value Your Feedback 💬
        </h1>
        <p className={`text-center mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Help us improve your experience by sharing your thoughts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={`mt-1 block w-full rounded-xl shadow-lg p-2 outline-none focus:ring-2 ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700 focus:ring-blue-400"
                  : "border border-gray-300 focus:ring-blue-600"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`mt-1 block w-full rounded-xl shadow-lg p-2 outline-none focus:ring-2 ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700 focus:ring-blue-400"
                  : "border border-gray-300 focus:ring-blue-600"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="feedback"
              className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}
            >
              Your Feedback
            </label>
            <textarea
              id="feedback"
              rows="4"
              value={formData.feedback}
              onChange={handleChange}
              placeholder="Write your feedback here..."
              className={`mt-1 block w-full rounded-xl shadow-lg p-2 outline-none focus:ring-2 ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700 focus:ring-blue-400"
                  : "border border-gray-800 focus:ring-blue-600"
              }`}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-2 rounded-xl transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105"
            }`}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

          <a
            href="/"
            className="bg-blue-600 text-white rounded-xl px-8 py-3 font-semibold text-center hover:bg-blue-700 flex justify-center items-center mt-3"
          >
            Back
          </a>
        </form>
      </div>

      <div
        aria-live="polite"
        className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl shadow-lg font-semibold transition-all duration-300 transform ${
          popupVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
        } ${popupError ? "bg-red-500 text-white" : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"}`}
      >
        {popupMessage}
      </div>
    </div>
  );
}
