import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              aria-label="Go to home"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                Expense Tracker
              </h1>
              <img
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                src="https://cdn-icons-png.freepik.com/256/10758/10758836.png"
                alt="logo"
              />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <ul className="flex gap-4 items-center text-gray-600 font-medium">
              <li>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Feedback
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Dashboard
                </Link>
              </li>
            </ul>

            {/* Auth buttons */}
            <div className="flex items-center gap-3 ml-4">
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2 rounded-lg border border-black hover:bg-black hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Sign Up
              </button>
            </div>
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => navigate("/signin")}
              className="px-3 py-1 rounded-md border border-black text-sm hover:bg-black hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Sign in"
            >
              Sign In
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="p-2 rounded-md inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Open main menu</span>
              {/* hamburger / close icons */}
              <svg
                className="h-6 w-6 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (collapsible) */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t bg-white/95 backdrop-blur-sm shadow-inner"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Contact
            </Link>
            <Link
              to="/feedback"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Feedback
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Dashboard
            </Link>

            <div className="pt-2 border-t flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/signin");
                }}
                className="w-full px-3 py-2 rounded-md border border-black text-left hover:bg-black hover:text-white transition"
              >
                Sign In
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/signup");
                }}
                className="w-full px-3 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
