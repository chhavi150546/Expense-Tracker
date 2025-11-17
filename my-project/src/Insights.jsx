// src/Insights.jsx
import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function Insights(){
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/signin"); return; }
    setUser(JSON.parse(raw));
  }, [navigate]);

  useEffect(()=>{
    if (!user) return;
    fetch(`${API_BASE}/expenses?userId=${user.id}`)
      .then(r=>r.json()).then(data=>{
        setExpenses(data.sort((a,b)=>a.date.localeCompare(b.date)));
      }).catch(err=>{
        console.error("Failed to load insights", err);
      });
  }, [user]);

  // draw a monthly chart by default
  useEffect(()=>{
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    // Prepare monthly totals
    const map = {};
    expenses.forEach(e=>{
      const m = (e.date || "").slice(0,7) || "unknown";
      map[m] = (map[m] || 0) + Number(e.amount || 0);
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Expenses", data, backgroundColor: "rgba(99,102,241,0.7)", borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [expenses]);

  function goBack(){ navigate("/dashboard"); }

  return (
    <div className="min-h-screen p-6 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Expense Insights</h1>
          <div>
            <button onClick={goBack} className="px-4 py-2 border rounded mr-2">Back</button>
            <button onClick={()=>{ localStorage.removeItem("user"); navigate("/signin"); }} className="px-4 py-2 border rounded">Sign out</button>
          </div>
        </header>

        <section className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">Monthly Expenses</h2>
          <div style={{height: 320}}>
            <canvas ref={chartRef} />
          </div>
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-3">Top categories</h2>
          <ul>
            {(() => {
              const map = {};
              expenses.forEach(e => map[e.category] = (map[e.category] || 0) + Number(e.amount || 0));
              const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1]);
              if (sorted.length === 0) return <li className="p-2">No data</li>;
              return sorted.map(([cat, amt]) => (
                <li key={cat} className="flex justify-between border-b py-2">
                  <span>{cat}</span>
                  <strong>{(Math.round(amt)).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits:0 }).replace("INR","₹") || amt}</strong>
                </li>
              ));
            })()}
          </ul>
        </section>
      </div>
    </div>
  );
}