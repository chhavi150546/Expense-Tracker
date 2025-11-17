import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

function SignUp() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const toggleTheme = () => setDarkMode(!darkMode);
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  // helper: read accounts (canonical local account store)
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

    if (!cleanEmail || !cleanPassword || !confirmPassword) return alert("⚠️ Please fill all fields!");
    if (cleanPassword !== confirmPassword) return alert("❌ Passwords do not match!");

    setSaving(true);

    try {
      // migrate old single-user keys into accounts if present (safe no-op if already migrated)
      const oldEmail = localStorage.getItem("user-email");
      const oldPass = localStorage.getItem("user-password");
      const oldUser = localStorage.getItem("user");
      if (oldEmail) {
        const accs = readAccounts();
        const already = accs.find(a => a.email === oldEmail);
        if (!already) {
          // if old user exists, add to accounts
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
      if (accounts.find(a => a.email === cleanEmail)) {
        alert("An account with this email already exists. Please sign in instead.");
        setSaving(false);
        return;
      }

      // attempt server create (if JSON Server present)
      let userObj = null;
      try {
        // check server for existing
        const checkRes = await fetch(`${API_BASE}/users?email=${encodeURIComponent(cleanEmail)}`);
        if (checkRes.ok) {
          const existing = await checkRes.json();
          if (existing && existing.length > 0) {
            // server user exists -> don't create duplicate on server; still create local account
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
        // server unreachable -> we will store locally only
        console.warn("JSON server unreachable; falling back to local-only account.", err);
      }

      // If server provided a userObj, use it; otherwise create a local user object
      if (!userObj) {
        userObj = { id: Date.now(), name: cleanName, email: cleanEmail };
      }

      // add credentials to canonical local accounts store
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
      console.error("SignUp error:", err);
      alert("Failed to sign up. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex items-center justify-center h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700" : "bg-gradient-to-r from-blue-400 via-purple-200 to-indigo-300"}`}>
      <button onClick={toggleTheme} className={`absolute top-24 right-6 px-4 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition ${darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"}`}>{darkMode ? "☀️ Day Mode" : "🌙 Night Mode"}</button>

      <div className={`shadow-2xl rounded-2xl p-8 w-full max-w-md relative ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white"}`}>
        <h1 className={`text-3xl font-bold text-center mb-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Create Your Account ✨</h1>
        <p className={`text-center mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Join Expense Tracker and manage your finances easily.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Name (optional)</label>
            <input id="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your name" className={`mt-1 w-full rounded-xl shadow-lg p-2 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "border border-gray-300"}`} />
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Email</label>
            <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className={`mt-1 w-full rounded-xl shadow-lg p-2 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "border border-gray-300"}`} />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Password</label>
            <input id="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className={`mt-1 w-full rounded-xl shadow-lg p-2 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "border border-gray-300"}`} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Confirm Password</label>
            <input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={`mt-1 w-full rounded-xl shadow-lg p-2 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "border border-gray-300"}`} />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-xl transition hover:scale-105 disabled:opacity-60">{saving ? "Creating account..." : "Sign Up"}</button>

          <a href="/signin" className="text-blue-600 dark:text-indigo-400 hover:underline block text-center mt-4">Already have an account? Sign In</a>
        </form>
      </div>
    </div>
  );
}
// inside SignIn and SignUp components' useEffect:


export default SignUp;