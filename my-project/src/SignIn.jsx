import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("dark-mode");
    if (savedTheme === "enabled") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) localStorage.setItem("dark-mode", "enabled");
    else localStorage.setItem("dark-mode", "disabled");
  }, [darkMode]);

  // If already logged in or user object present, redirect to dashboard
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    const userRaw = localStorage.getItem("user");
    if (logged && userRaw) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // canonical accounts read (migration-friendly)
  function readAccounts() {
    // migrate old single-account keys if present
    const accountsRaw = localStorage.getItem("accounts");
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];

    const singleEmail = localStorage.getItem("user-email");
    const singlePass = localStorage.getItem("user-password");
    const singleUser = localStorage.getItem("user");
    if (singleEmail && !accounts.find(a => a.email === singleEmail)) {
      const u = singleUser ? JSON.parse(singleUser) : null;
      accounts.push({ id: u?.id || Date.now(), name: u?.name || singleEmail.split("@")[0], email: singleEmail, password: singlePass || "" });
      localStorage.setItem("accounts", JSON.stringify(accounts));
    }
    return accounts;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanEmail || !cleanPass) return alert("Please enter email and password.");

    const accounts = readAccounts();

    // 1) Try to match a local account (preferred)
    const found = accounts.find(a => a.email === cleanEmail);
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

    // 3) If nothing local, try server user detection (server has no passwords in JSON-server demo)
    // If server has the user email, we accept and create a local account entry without password — but require sign up flow normally.
    // For security we will reject (ask user to sign up again).
    alert("No account found. Please Sign Up first.");
  };

  return (
    <div className={`flex items-center justify-center h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700" : "bg-gradient-to-r from-blue-400 via-purple-200 to-indigo-300"}`}>
      <button onClick={()=>setDarkMode(!darkMode)} className={`absolute top-24 right-6 px-4 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition ${darkMode ? "bg-yellow-400 text-black" : "bg-black text-white"}`}>{darkMode ? "☀️ Day Mode" : "🌙 Night Mode"}</button>

      <div className={`shadow-2xl rounded-2xl p-8 w-full max-w-md relative ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white"}`}>
        <h1 className={`text-3xl font-bold text-center mb-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Welcome Back 🔐</h1>
        <p className={`text-center mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Log in to continue tracking your expenses.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Email</label>
            <input id="email" name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" className={`mt-1 w-full rounded-xl shadow-lg p-2 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "border border-gray-300"}`} />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Password</label>
            <input id="password" name="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className={`mt-1 w-full rounded-xl shadow-lg p-2 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "border border-gray-300"}`} />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-xl transition hover:scale-105">Sign In</button>

          <a href="/signup" className="text-blue-600 dark:text-indigo-400 hover:underline block text-center mt-4">Don’t have an account? Sign Up</a>
        </form>
      </div>
    </div>
  );
}
// inside SignIn and SignUp components' useEffect:



export default SignIn;