import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("dark-mode");
    if (savedTheme === "enabled") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) localStorage.setItem("dark-mode", "enabled");
    else localStorage.setItem("dark-mode", "disabled");
  }, [darkMode]);

  // redirect if already logged in
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    const userRaw = localStorage.getItem("user");
    if (logged && userRaw) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // canonical accounts read (migration-friendly)
  function readAccounts() {
    const accountsRaw = localStorage.getItem("accounts");
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];

    const singleEmail = localStorage.getItem("user-email");
    const singlePass = localStorage.getItem("user-password");
    const singleUser = localStorage.getItem("user");
    if (singleEmail && !accounts.find((a) => a.email === singleEmail)) {
      const u = singleUser ? JSON.parse(singleUser) : null;
      accounts.push({
        id: u?.id || Date.now(),
        name: u?.name || singleEmail.split("@")[0],
        email: singleEmail,
        password: singlePass || ""
      });
      localStorage.setItem("accounts", JSON.stringify(accounts));
    }
    return accounts;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanEmail || !cleanPass) return alert("Please enter email and password.");

    setSaving(true);

    try {
      const accounts = readAccounts();

      // 1) Try to match a local account (preferred)
      const found = accounts.find((a) => a.email === cleanEmail);
      if (found) {
        if (found.password === cleanPass) {
          // success
          localStorage.setItem("user", JSON.stringify({ id: found.id, name: found.name, email: found.email }));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("loggedInEmail", found.email);
          localStorage.setItem("user-email", found.email);
          localStorage.setItem("user-password", found.password);
          navigate("/dashboard");
          return;
        } else {
          alert("Invalid password. If you forgot your password, sign up again or reset (local demo).");
          return;
        }
      }

      // 2) fallback: check single-user keys (legacy)
      const savedEmail = localStorage.getItem("user-email");
      const savedPassword = localStorage.getItem("user-password");
      if (savedEmail === cleanEmail && savedPassword === cleanPass) {
        // ensure user object exists
        if (!localStorage.getItem("user")) {
          const name = cleanEmail.split("@")[0];
          localStorage.setItem("user", JSON.stringify({ id: Date.now(), name, email: cleanEmail }));
        }
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInEmail", cleanEmail);
        navigate("/dashboard");
        return;
      }

      // 3) If nothing local, reject and ask to sign up
      alert("No account found. Please Sign Up first.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("SignIn error:", err);
      alert("Sign in failed — check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-r from-blue-400 via-purple-200 to-indigo-300 text-gray-900"
      }`}
    >
      {/* Theme toggle */}
      <button
        onClick={() => setDarkMode((v) => !v)}
        aria-pressed={darkMode}
        className={`absolute top-6 right-6 px-3 py-2 rounded-full font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
          darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"
        }`}
      >
        {darkMode ? "☀️ Day" : "🌙 Night"}
      </button>

      {/* Card container: becomes two-column on lg */}
      <div className="w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden">
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
          {/* Left: illustration & marketing (hidden under lg) */}
          <div
            className={`hidden lg:flex flex-col justify-center items-center p-10 gap-6 ${
              darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" : "bg-gradient-to-br from-indigo-100 to-blue-50 text-gray-900"
            }`}
            aria-hidden
          >
            
            <div className="text-center px-4">
              <h2 className="text-2xl font-extrabold mb-2">Welcome back</h2>
              <p className="text-sm text-gray-600 dark:text-gray-600 max-w-sm">
                Sign in to access your dashboard, track expenses, and view insights.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className={`p-6 sm:p-10 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Welcome Back 🔐</h1>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Log in to continue tracking your expenses.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`mt-1 w-full rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    darkMode ? "bg-gray-800 text-gray-100 border border-gray-700 focus:ring-indigo-400" : "border border-gray-300 bg-white focus:ring-indigo-500"
                  }`}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`mt-1 w-full rounded-xl p-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      darkMode ? "bg-gray-800 text-gray-100 border border-gray-700 focus:ring-indigo-400" : "border border-gray-300 bg-white focus:ring-indigo-500"
                    }`}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-2 top-1/2 -translate-y-1/2 px-2 rounded text-sm focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        localStorage.setItem("remember", "true");
                      } else {
                        localStorage.removeItem("remember");
                      }
                    }}
                  />
                  <label htmlFor="remember" className="text-sm">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot?
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-1"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center">
                <a href="/signup" className="text-sm text-indigo-600 hover:underline">
                  Don’t have an account? Sign Up
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
