// src/Insights.jsx
import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";
const formatINR = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

export default function Insights() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // require auth
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/signin");
      return;
    }
    setUser(JSON.parse(raw));
  }, [navigate]);

  // load user expenses
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE}/expenses?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        const normalized = (data || []).map((d) => ({
          ...d,
          amount: Number(d.amount || d.value || 0),
          date: d.date || "",
          category: d.category || "Other",
          desc: d.desc || d.description || "",
        }));
        normalized.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        setExpenses(normalized);
      })
      .catch((err) => {
        console.error("Failed to load insights", err);
        setExpenses([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Draw monthly chart (responsive)
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Prepare monthly totals
    const map = {};
    expenses.forEach((e) => {
      const m = (e.date || "").slice(0, 7) || "unknown";
      map[m] = (map[m] || 0) + Number(e.amount || 0);
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    // create chart
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Expenses",
            data,
            backgroundColor: "rgba(99,102,241,0.85)",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatINR(ctx.raw),
            },
          },
        },
        scales: {
          x: {
            ticks: { maxRotation: 0, autoSkip: true },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => (val ? `₹${Number(val).toLocaleString("en-IN")}` : "₹0"),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [expenses]);

  function goBack() {
    navigate("/dashboard");
  }

  function signOut() {
    localStorage.removeItem("user");
    navigate("/signin");
  }

  // category totals sorted
  const topCategories = (() => {
    const map = {};
    expenses.forEach((e) => (map[e.category] = (map[e.category] || 0) + Number(e.amount || 0)));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        {/* Header: stacks on small screens */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Expense Insights</h1>
            <p className="text-sm text-gray-600 mt-1">Visualize spending trends and top categories.</p>
          </div>

          <div className="flex gap-2 justify-start sm:justify-end">
            <button
              onClick={goBack}
              className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm shadow-sm"
            >
              Back
            </button>
            <button
              onClick={signOut}
              className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm shadow-sm"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Chart + Top categories: responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart card (takes 2 cols on lg) */}
          <section className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Monthly Expenses</h2>
              <div className="text-sm text-gray-500">{expenses.length ? `${expenses.length} records` : "No records"}</div>
            </div>

            <div
              className="w-full bg-gray-50 rounded-md p-2"
              style={{ minHeight: 180 }}
              aria-live="polite"
            >
              {loading ? (
                <div className="flex items-center justify-center p-8">Loading chart…</div>
              ) : expenses.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-gray-500">No data to display.</div>
              ) : (
                // responsive canvas container; different heights per breakpoint
                <div className="relative" style={{ height: 240 }}>
                  <canvas ref={chartRef} />
                </div>
              )}
            </div>
          </section>

          {/* Top categories */}
          <aside className="bg-white p-4 sm:p-6 rounded-xl shadow flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Top categories</h2>
              <span className="text-sm text-gray-500">{topCategories.length}</span>
            </div>

            {topCategories.length === 0 ? (
              <div className="text-gray-500">No data</div>
            ) : (
              <ul className="space-y-3 overflow-auto">
                {topCategories.map(([cat, amt]) => (
                  <li key={cat} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-100 to-indigo-300 flex items-center justify-center text-indigo-700 font-semibold">
                        {cat?.charAt(0)?.toUpperCase() || "—"}
                      </div>
                      <div>
                        <div className="font-medium">{cat}</div>
                        <div className="text-xs text-gray-500">{/* optionally show count or percent */}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatINR(amt)}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <button
                onClick={() => window.print()}
                className="w-full px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm shadow-sm"
              >
                Print report
              </button>
            </div>
          </aside>
        </div>

        {/* Recent transactions (mobile-friendly list) */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Recent transactions</h2>

          {loading ? (
            <div className="py-6 text-center">Loading…</div>
          ) : expenses.length === 0 ? (
            <div className="py-6 text-center text-gray-500">No transactions yet.</div>
          ) : (
            <div className="space-y-3">
              {expenses.slice().reverse().slice(0, 8).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 p-3 rounded-md border">
                  <div>
                    <div className="font-medium">{e.desc || "—"}</div>
                    <div className="text-xs text-gray-500">{e.category} • {e.date}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatINR(e.amount)}</div>
                </div>
              ))}
              {expenses.length > 8 && (
                <div className="text-center">
                  <button onClick={() => navigate("/reports")} className="text-sm text-indigo-600 hover:underline">
                    View full reports →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
