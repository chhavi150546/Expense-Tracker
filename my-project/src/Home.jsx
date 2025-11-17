// Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    title: "Expense Insights",
    desc: "Understand your spending with detailed insights.",
    img: "https://cdn-icons-png.flaticon.com/512/1161/1161388.png",
    to: "/insights",
  },
  {
    title: "Automated Budgeting",
    desc: "Track and analyze your expenses effortlessly.",
    img: "https://cdn-icons-png.flaticon.com/512/1490/1490859.png",
    to: "/automated",
  },
  {
    title: "Custom Reports",
    desc: "Create personalized financial reports with ease.",
    img: "https://cdn-icons-png.flaticon.com/512/9068/9068970.png",
    to: "/reports",
  },
];

const CHOOSE_CARDS = [
  {
    title: "User-Friendly Dashboard",
    desc: "Navigate your expenses easily with our clean design.",
    img: "https://cdn-icons-png.flaticon.com/512/4313/4313556.png",
  },
  {
    title: "Secure & Private",
    desc: "Your data is encrypted and never shared with third parties.",
    img: "https://cdn-icons-png.flaticon.com/512/2345/2345336.png",
  },
  {
    title: "Real-Time Sync",
    desc: "Access your financial data from any device instantly.",
    img: "https://cdn-icons-png.flaticon.com/512/4467/4467515.png",
  },
];

const HERO_TEXTS = [
  "Unlock Financial Clarity 💰",
  "Track Every Expense 🔍",
  "Achieve Your Saving Goals 🎯",
  "Master Your Budget 📊",
];

export default function Home() {
  const navigate = useNavigate();

  // hero text animation
  const [heroIndex, setHeroIndex] = useState(0);

  // animation state for features & choose-cards
  const [visibleFeatures, setVisibleFeatures] = useState(false);
  const [visibleChooseCards, setVisibleChooseCards] = useState(false);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_TEXTS.length);
    }, 2500);
    return () => clearInterval(heroInterval);
  }, []);

  // run entrance animations after load
  useEffect(() => {
    const t1 = setTimeout(() => setVisibleFeatures(true), 300); // show features
    const t2 = setTimeout(() => setVisibleChooseCards(true), 800); // show choose cards
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // handlers
  const goTo = (path) => {
    // If path starts with /, use navigate, else navigate to a path
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
     
     

      {/* HERO */}
      <main className="bg-gradient-to-tr from-purple-100 via-indigo-200 to-pink-100 flex-grow">
        <section className="flex flex-col items-center justify-center text-center px-6 sm:px-10 py-12 sm:py-16 min-h-[70vh]">
          <h2
            className="text-4xl sm:text-6xl font-extrabold text-gray-900 transition-all duration-700 mb-4"
            aria-live="polite"
          >
            {HERO_TEXTS[heroIndex]}
          </h2>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-700 max-w-2xl">
            Know where your money is going. Track your spending and discover trends to improve your financial habits.
          </p>

          <button onClick={() => goTo("/signUp")} id="getStartedBtn" className="m-6 sm:m-10 p-3 sm:p-4 bg-black text-white rounded hover:bg-indigo-800 transition">
            Get Started
          </button>

          {/* FEATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10 w-full max-w-6xl">
            {FEATURES.map((f, idx) => {
              const showClass = visibleFeatures ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
              return (
                <div
                  key={f.title}
                  onClick={() => goTo(f.to)}
                  className={`p-6 sm:p-8 rounded-2xl border border-black shadow-lg bg-white/70 transition-all duration-700 cursor-pointer ${showClass}`}
                  style={{ transitionDelay: `${idx * 120}ms` }}
                >
                  <img src={f.img} className="w-10 sm:w-12 mx-auto mb-4" alt={f.title} />
                  <h3 className="font-semibold text-lg sm:text-xl mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="bg-white p-10 sm:p-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-10">Why Choose Expense Tracker?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 text-center">
            {CHOOSE_CARDS.map((c, idx) => {
              const showClass = visibleChooseCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
              return (
                <div
                  key={c.title}
                  className={`p-6 rounded-lg bg-gradient-to-br shadow hover:scale-105 transition-all duration-700 ${showClass}`}
                  style={{ transitionDelay: `${idx * 160}ms` }}
                >
                  <img src={c.img} className="w-12 sm:w-14 mx-auto mb-4" alt={c.title} />
                  <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-600">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* STATS */}
        <section className="bg-gradient-to-tr from-purple-100 via-indigo-200 to-pink-100 py-16 sm:py-20 px-6 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Trusted by Thousands</h2>
          <p className="text-gray-700 text-base sm:text-lg mb-8 sm:mb-12">Join our growing community of smart savers</p>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl px-8 py-6 sm:px-12 sm:py-10 hover:scale-105 transition-transform max-w-xs">
              <h3 className="text-4xl sm:text-5xl font-extrabold text-indigo-600 mb-2">50K+</h3>
              <p className="text-gray-800 text-lg font-medium">Active Users</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl px-8 py-6 sm:px-12 sm:py-10 hover:scale-105 transition-transform max-w-xs">
              <h3 className="text-4xl sm:text-5xl font-extrabold text-indigo-600 mb-2">$10M+</h3>
              <p className="text-gray-800 text-lg font-medium">Expenses Tracked</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl px-8 py-6 sm:px-12 sm:py-10 hover:scale-105 transition-transform max-w-xs">
              <h3 className="text-4xl sm:text-5xl font-extrabold text-indigo-600 mb-2">98%</h3>
              <p className="text-gray-800 text-lg font-medium">User Satisfaction</p>
            </div>
          </div>
        </section>

        {/* EMPOWER SECTION */}
        <section className="bg-white/70 py-16 px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-center gap-12">
          <div className="max-w-lg text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Empowering Your <br /> Financial Goals</h1>
            <p className="text-gray-700 text-base sm:text-lg mb-6">Take control of your finances with intelligent tools that help you save more and spend wisely.</p>
            <button onClick={() => goTo("/learn-more")} id="learnMoreBtn" className="px-5 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition">
              Learn More
            </button>
          </div>

          <div className="relative w-full max-w-md sm:max-w-lg">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 rotate-2 scale-105 opacity-90 -z-10"></div>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative z-10">
              <div className="mb-6">
                <div className="flex justify-between text-gray-800 font-semibold mb-2">
                  <span>Monthly Savings</span><span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "85%" }}></div></div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-gray-800 font-semibold mb-2">
                  <span>Budget Goals</span><span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "92%" }}></div></div>
              </div>

              <div>
                <div className="flex justify-between text-gray-800 font-semibold mb-2">
                  <span>Expense Control</span><span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "78%" }}></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-gradient-to-tr from-purple-100 via-indigo-200 to-pink-100 py-16 px-6 sm:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Loved by Users Worldwide</h2>
            <p className="text-gray-700 text-base sm:text-lg">See what our community has to say</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="bg-white/90 shadow-lg rounded-2xl p-6 sm:p-8 max-w-sm hover:scale-105 transition-transform">
              <div className="flex text-yellow-400 mb-4">★★★★★</div>
              <p className="italic text-gray-700 mb-6">"ExpenseTracker transformed how I manage my money. The insights are incredible!"</p>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-500 to-green-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">S</div>
                <div><h4 className="font-semibold text-gray-900">Sarah Khan</h4><p className="text-sm text-gray-600">Business Owner</p></div>
              </div>
            </div>

            <div className="bg-white/90 shadow-lg rounded-2xl p-6 sm:p-8 max-w-sm hover:scale-105 transition-transform">
              <div className="flex text-yellow-400 mb-4">★★★★★</div>
              <p className="italic text-gray-700 mb-6">"Finally, an app that makes budgeting fun and easy. I saved more in 3 months!"</p>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-green-400 to-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">M</div>
                <div><h4 className="font-semibold text-gray-900">Manjot Mann</h4><p className="text-sm text-gray-600">Engineer</p></div>
              </div>
            </div>

            <div className="bg-white/90 shadow-lg rounded-2xl p-6 sm:p-8 max-w-sm hover:scale-105 transition-transform">
              <div className="flex text-yellow-400 mb-4">★★★★★</div>
              <p className="italic text-gray-700 mb-6">"The automated budgeting feature is a game-changer. I feel fully in control!"</p>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-500 to-teal-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">R</div>
                <div><h4 className="font-semibold text-gray-900">Rahul Vaid</h4><p className="text-sm text-gray-600">Manager</p></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-center py-4 text-gray-700 text-sm border-t">
        © 2025 Expense Tracker. All rights reserved.
      </footer>
    </div>
  );
}