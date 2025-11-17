import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function SignUp() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("dark-mode");
    if (savedTheme === "enabled") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) localStorage.setItem("dark-mode", "enabled");
    else localStorage.setItem("dark-mode", "disabled");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((v) => !v);
  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.id]: e.target.value }));

  // helper: read/write accounts (canonical local account store)
  function readAccounts() {
    const raw = localStorage.getItem("accounts");
    return raw ? JSON.parse(raw) : [];
  }
  function writeAccounts(arr) {
    localStorage.setItem("accounts", JSON.stringify(arr));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, name } = formData;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim() || "User";
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword || !confirmPassword) {
      return alert("⚠️ Please fill all fields!");
    }
    if (cleanPassword !== confirmPassword) {
      return alert("❌ Passwords do not match!");
    }

    setSaving(true);

    try {
      // migrate old single-user keys into accounts if present
      const oldEmail = localStorage.getItem("user-email");
      const oldPass = localStorage.getItem("user-password");
      const oldUser = localStorage.getItem("user");
      if (oldEmail) {
        const accs = readAccounts();
        const already = accs.find((a) => a.email === oldEmail);
        if (!already) {
          accs.push({
            id: oldUser ? (JSON.parse(oldUser).id || Date.now()) : Date.now(),
            name: oldUser ? (JSON.parse(oldUser).name || oldEmail.split("@")[0]) : oldEmail.split("@")[0],
            email: oldEmail,
            password: oldPass || ""
          });
          writeAccounts(accs);
        }
      }

      // check if email already exists in local accounts
      const accounts = readAccounts();
      if (accounts.find((a) => a.email === cleanEmail)) {
        alert("An account with this email already exists. Please sign in instead.");
        setSaving(false);
        return;
      }

      // attempt server create (if JSON Server present)
      let userObj = null;
      try {
        const checkRes = await fetch(`${API_BASE}/users?email=${encodeURIComponent(cleanEmail)}`);
        if (checkRes.ok) {
          const existing = await checkRes.json();
          if (existing && existing.length > 0) {
            userObj = existing[0];
          } else {
            const createRes = await fetch(`${API_BASE}/users`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: cleanName, email: cleanEmail })
            });
            if (createRes.ok) userObj = await createRes.json();
          }
        }
      } catch (err) {
        // server unreachable -> fall back to local-only
        // eslint-disable-next-line no-console
        console.warn("JSON server unreachable; falling back to local-only account.", err);
      }

      if (!userObj) {
        userObj = { id: Date.now(), name: cleanName, email: cleanEmail };
      }

      // add credentials to local accounts store
      const newAccounts = readAccounts();
      newAccounts.push({ id: userObj.id, name: userObj.name, email: userObj.email, password: cleanPassword });
      writeAccounts(newAccounts);

      // write session-compatible keys that Dashboard expects
      localStorage.setItem("user", JSON.stringify({ id: userObj.id, name: userObj.name, email: userObj.email }));
      localStorage.setItem("user-email", cleanEmail);
      localStorage.setItem("user-password", cleanPassword);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInEmail", cleanEmail);

      alert("✅ Sign Up successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("SignUp error:", err);
      alert("Failed to sign up. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-r from-blue-400 via-purple-200 to-indigo-300 text-gray-900"
      }`}
    >
      {/* Top-right theme toggle (accessible) */}
      <button
        onClick={toggleTheme}
        aria-pressed={darkMode}
        className={`absolute top-6 right-6 px-3 py-2 rounded-full font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition transform ${
          darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"
        }`}
      >
        {darkMode ? "☀️ Day" : "🌙 Night"}
      </button>

      {/* Container: becomes two-column on lg+ screens */}
      <div className="w-full max-w-5xl bg-transparent">
        <div className={`shadow-2xl rounded-2xl overflow-hidden ${darkMode ? "bg-gray-900" : "bg-white"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: artwork / marketing (hidden under md) */}
            <div
              className={`hidden lg:flex flex-col justify-center items-center p-10 gap-6 ${
                darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" : "bg-gradient-to-br from-indigo-100 to-blue-50 text-gray-900"
              }`}
              aria-hidden
            >
             
              <div className="text-center px-4">
                <h2 className="text-2xl font-extrabold mb-2">Welcome to Expense Tracker</h2>
                <p className="text-sm text-gray-600 dark:text-gray-600 max-w-sm">
                  Securely manage your expenses, set budgets, and get insights — all in one place.
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className={`p-6 sm:p-10 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                Create Your Account ✨
              </h1>
              <p className={`text-sm mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Join Expense Tracker and manage your finances easily.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name (optional)
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={`mt-1 w-full rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      darkMode ? "bg-gray-800 text-gray-100 border border-gray-700 focus:ring-indigo-400" : "border border-gray-300 bg-white focus:ring-indigo-500"
                    }`}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`mt-1 w-full rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      darkMode ? "bg-gray-800 text-gray-100 border border-gray-700 focus:ring-indigo-400" : "border border-gray-300 bg-white focus:ring-indigo-500"
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className={`mt-1 w-full rounded-xl p-2 shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          darkMode ? "bg-gray-800 text-gray-100 border border-gray-700 focus:ring-indigo-400" : "border border-gray-300 bg-white focus:ring-indigo-500"
                        }`}
                        minLength={6}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-2 top-1/2 -translate-y-1/2 px-2 rounded text-sm focus:outline-none"
                        tabIndex={0}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={`mt-1 w-full rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        darkMode ? "bg-gray-800 text-gray-100 border border-gray-700 focus:ring-indigo-400" : "border border-gray-300 bg-white focus:ring-indigo-500"
                      }`}
                      minLength={6}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-1"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-transparent text-sm hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-1"
                  >
                    Already have an account?
                  </button>
                </div>

                <p className={`text-xs text-center mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  By signing up you agree to our <button type="button" className="underline">Terms</button> & <button type="button" className="underline">Privacy</button>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
