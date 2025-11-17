import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-10 py-6 shadow-md bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold text-gray-800">Expense Tracker</h1>
        <img
          className="w-10 h-10"
          src="https://cdn-icons-png.freepik.com/256/10758/10758836.png"
          alt="logo"
        />
      </div>

      <nav>
        <ul className="flex gap-6 text-gray-600 font-medium items-center">
          <li>
            <Link to="/" className="px-5 py-2 rounded-lg font-medium shadow hover:bg-gray-400 hover:bg-opacity-40 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="px-5 py-2 rounded-lg font-medium shadow hover:bg-gray-400 hover:bg-opacity-40 transition">
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="px-5 py-2 rounded-lg font-medium shadow hover:bg-gray-400 hover:bg-opacity-40 transition">
              Contact
            </Link>
          </li>
          <li>
            <Link to="/feedback" className="px-5 py-2 rounded-lg font-medium shadow hover:bg-gray-400 hover:bg-opacity-40 transition">
              Feedback
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="px-5 py-2 rounded-lg font-medium shadow hover:bg-gray-400 hover:bg-opacity-40 transition">
              Dashboard
            </Link>
          </li>

          {/* Sign In / Sign Up on the right */}
          <li>
            <button
              onClick={() => navigate("/signin")}
              className="border border-black px-5 py-2 rounded-lg hover:bg-black hover:text-white transition"
            >
              Sign In
            </button>
          </li>

          <li>
            <button
              onClick={() => navigate("/signup")}
              className="border border-indigo-600 text-indigo-600 px-5 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition"
            >
              Sign Up
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}