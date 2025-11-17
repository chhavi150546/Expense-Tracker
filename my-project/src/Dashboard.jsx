// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const todayStr = () => new Date().toISOString().slice(0, 10);
const formatINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

const API_BASE = "http://localhost:3000";

export default function Dashboard() {
  const navigate = useNavigate();

  // user & user-specific budget record id
  const [user, setUser] = useState(null);
  const [budgetRecordId, setBudgetRecordId] = useState(null);

  const [budget, setBudget] = useState(0);
  const [inputBudget, setInputBudget] = useState(""); // typed value, commit on Set
  const [spent, setSpent] = useState(0);

  // input rows (temporary entries to add)
  const [inputRows, setInputRows] = useState([
    { id: Date.now(), desc: "", category: "Food", amount: "", date: todayStr() },
  ]);

  // persisted expenses (from API)
  const [expenses, setExpenses] = useState([]);

  // edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ desc: "", category: "Food", amount: "", date: todayStr() });

  // small helper to parse number safely
  const toNumber = (v) => {
    if (v === "" || v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Generic safe fetch wrapper
  async function safeFetch(url, opts = {}) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res;
  }

  // Get logged-in user from localStorage. If none, redirect to signin.
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // load budget and expenses on mount (for current user)
  useEffect(() => {
    (async function init() {
      const u = getCurrentUser();
      if (!u) {
        // not logged in -> go to signin
        navigate("/signin");
        return;
      }
      setUser(u);

      try {
        // 1) load budget for this user: GET /budget?userId={u.id}
        const bRes = await safeFetch(`${API_BASE}/budget?userId=${u.id}`);
        const budgets = await bRes.json();

        if (Array.isArray(budgets) && budgets.length > 0) {
          // take first (should be one per user)
          const myBudget = budgets[0];
          setBudget(Number(myBudget.value || 0));
          setBudgetRecordId(myBudget.id);
        } else {
          // create initial budget record for this user with value 0
          const createRes = await safeFetch(`${API_BASE}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: u.id, value: 0 }),
          });
          const created = await createRes.json();
          setBudget(0);
          setBudgetRecordId(created.id);
        }

        // 2) load expenses for this user: GET /expenses?userId={u.id}
        const eRes = await safeFetch(`${API_BASE}/expenses?userId=${u.id}`);
        const eData = await eRes.json();
        setExpenses(Array.isArray(eData) ? eData : []);
      } catch (err) {
        console.warn("Could not load from API. Is JSON Server running?", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update 'spent' whenever expenses change
  useEffect(() => {
    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    setSpent(total);
  }, [expenses]);

  // commit budget to the server (user-specific)
  async function commitBudget() {
    const v = toNumber(inputBudget);
    if (!v || v <= 0) {
      alert("Enter a valid positive budget!");
      return;
    }
    if (!user) {
      alert("No user found. Please sign in.");
      return;
    }
    try {
      // If we have a budget record id, PATCH it; otherwise POST
      if (budgetRecordId) {
        await safeFetch(`${API_BASE}/budget/${budgetRecordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: v }),
        });
      } else {
        const res = await safeFetch(`${API_BASE}/budget`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, value: v }),
        });
        const created = await res.json();
        setBudgetRecordId(created.id);
      }

      setBudget(v);
      setInputBudget("");
    } catch (err) {
      console.error("Failed to save budget:", err);
      alert("Failed to save budget. Check JSON Server.");
    }
  }

  // loadExpenses helper (pull fresh list for this user)
  async function loadExpenses() {
    if (!user) return;
    try {
      const res = await safeFetch(`${API_BASE}/expenses?userId=${user.id}`);
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not reload expenses:", err);
    }
  }

  // add expense(s) - posts each valid input row to API (with userId)
  async function handleAddExpenses() {
    if (!user) {
      alert("No user found. Please sign in.");
      return;
    }
    if (inputRows.length === 0) {
      setInputRows([{ id: Date.now(), desc: "", category: "Food", amount: "", date: todayStr() }]);
      return;
    }

    let addedAny = false;
    for (const row of [...inputRows]) {
      const desc = row.desc?.trim();
      const category = row.category || "Other";
      const amount = toNumber(row.amount);
      const date = row.date || todayStr();

      if (!desc || !amount || amount <= 0) continue;

      // overspend check if budget set
      if (budget > 0 && spent + amount > budget) {
        const inc = window.confirm("This expense exceeds your budget. Increase budget now?");
        if (inc) {
          const newBudgetStr = window.prompt("Enter new total budget:", String(Math.max(spent + amount, budget)));
          const newBudget = toNumber(newBudgetStr);
          if (!newBudget || newBudget < spent + amount) {
            alert("Invalid or insufficient budget. Expense not added.");
            continue;
          }
          // save new budget (persist)
          try {
            if (budgetRecordId) {
              await safeFetch(`${API_BASE}/budget/${budgetRecordId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: newBudget }),
              });
            } else {
              const res = await safeFetch(`${API_BASE}/budget`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, value: newBudget }),
              });
              const created = await res.json();
              setBudgetRecordId(created.id);
            }
            setBudget(newBudget);
          } catch (err) {
            alert("Could not update budget. Expense not added.");
            continue;
          }
        } else {
          alert("Expense not added because it exceeds budget.");
          continue;
        }
      }

      // finally persist the expense (include userId)
      try {
        const res = await safeFetch(`${API_BASE}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, desc, category, amount, date }),
        });
        const created = await res.json();
        addedAny = true;
      } catch (err) {
        console.error("Failed to add expense:", err);
      }
    }

    if (!addedAny) {
      alert("No valid expenses added.");
      return;
    }

    // clear local input rows and reload expenses from server
    setInputRows([{ id: Date.now() + 1, desc: "", category: "Food", amount: "", date: todayStr() }]);
    await loadExpenses();
  }

  // delete expense (server) - only allow if expense belongs to user
  async function deleteExpense(id) {
    try {
      await safeFetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
      // update locally
      setExpenses((ex) => ex.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Check JSON Server.");
    }
  }

  // open edit modal with values
  function openEdit(exp) {
    setEditing(exp.id);
    setEditValues({ desc: exp.desc, category: exp.category, amount: exp.amount, date: exp.date || todayStr() });
    setIsEditOpen(true);
  }

  // save edits to API (PATCH)
  async function saveEdit() {
    const desc = (editValues.desc || "").trim().replace(/[^A-Za-z\s]/g, "");
    const amount = toNumber(editValues.amount);
    const date = editValues.date || todayStr();

    if (!desc || amount <= 0) {
      alert("Enter valid description and positive amount.");
      return;
    }

    const oldAmount = toNumber(expenses.find((e) => e.id === editing)?.amount || 0);
    const newSpent = spent - oldAmount + amount;
    if (budget > 0 && newSpent > budget) {
      const inc = window.confirm("Edited amount exceeds budget. Increase budget now?");
      if (inc) {
        const newBudget = toNumber(window.prompt("Enter new total budget:", String(newSpent)));
        if (!newBudget || newBudget < newSpent) {
          alert("Invalid budget. Edit cancelled.");
          return;
        }
        // persist new budget
        try {
          if (budgetRecordId) {
            await safeFetch(`${API_BASE}/budget/${budgetRecordId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value: newBudget }),
            });
          } else {
            const r = await safeFetch(`${API_BASE}/budget`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.id, value: newBudget }),
            });
            const created = await r.json();
            setBudgetRecordId(created.id);
          }
          setBudget(newBudget);
        } catch (err) {
          alert("Could not update budget. Edit cancelled.");
          return;
        }
      } else {
        alert("Edit cancelled because it exceeds budget.");
        return;
      }
    }

    // patch expense on server
    try {
      await safeFetch(`${API_BASE}/expenses/${editing}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, category: editValues.category, amount, date }),
      });
      // update locally
      setExpenses((ex) => ex.map((e) => (e.id === editing ? { ...e, desc, category: editValues.category, amount, date } : e)));
      setIsEditOpen(false);
      setEditing(null);
    } catch (err) {
      console.error("Save edit failed:", err);
      alert("Failed to save edit. Check JSON Server.");
    }
  }

  const cancelEdit = () => {
    setIsEditOpen(false);
    setEditing(null);
  };

  // input row helpers
  const addInputRow = () =>
    setInputRows((r) => [...r, { id: Date.now() + Math.random(), desc: "", category: "Food", amount: "", date: todayStr() }]);
  const removeInputRow = (id) => setInputRows((r) => r.filter((row) => row.id !== id));
  const updateInputRow = (id, key, value) => {
    if (key === "desc") value = value.replace(/[^A-Za-z\s]/g, "");
    setInputRows((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="bg-[#e8f4ff] min-h-screen font-sans flex flex-col">
      <main className="pt-20 w-full">
        <section className="max-w-6xl mx-auto px-6 text-center mt-6">
          <h1 className="text-4xl font-bold text-blue-700">Smart Expense Tracker</h1>
          <p className="text-gray-600 mt-2 text-lg">Take control of your finances with intelligent tracking</p>
        </section>

        <section className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl p-8 mb-10 mt-8 border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-blue-100 p-3 rounded-lg text-blue-600 text-2xl">💳</span>
            <h2 className="text-2xl font-semibold text-gray-800">Set Your Budget</h2>
            <div className="ml-auto">
              <Link to="/insights" className="px-4 py-2 rounded bg-indigo-600 text-white">Expense Insights</Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={inputBudget}
              onChange={(e) => setInputBudget(e.target.value)}
              placeholder="Enter your monthly budget"
              className="flex-1 border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring w-64"
              type="number"
              min="0"
            />

            <button onClick={commitBudget} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition">
              Set Budget
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-lg">
              <p className="text-lg font-semibold">Total Budget</p>
              <h3 id="totalBudget" className="text-3xl font-bold mt-2">{formatINR(budget)}</h3>
              <p className="opacity-80 mt-1">Monthly allocation</p>
            </div>

            <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg">
              <p className="text-lg font-semibold">Spent</p>
              <h3 id="totalSpent" className="text-3xl font-bold mt-2">{formatINR(spent)}</h3>
              <p className="opacity-80 mt-1">Expense total</p>
            </div>

            <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg">
              <p className="text-lg font-semibold">Balance</p>
              <h3 id="balanceLeft" className="text-3xl font-bold mt-2">{formatINR(budget - spent)}</h3>
              <p className="opacity-80 mt-1">Remaining</p>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-xl mb-10 border border-gray-100 overflow-hidden">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Add New Expense</h2>

          <div className="flex flex-col gap-4 mb-4">
            {inputRows.map((row) => (
              <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex flex-col">
                  <input
                    className={`desc border p-2 rounded w-52 ${/[^A-Za-z\s]/.test(row.desc) ? "border-red-500" : ""}`}
                    type="text"
                    placeholder="Description"
                    value={row.desc}
                    onChange={(e) => updateInputRow(row.id, "desc", e.target.value)}
                  />
                  <p className={`descError text-xs text-red-500 ${/[^A-Za-z\s]/.test(row.desc) ? "" : "hidden"}`}>Only alphabets allowed!</p>
                </div>

                <select className="category border p-2 rounded w-40" value={row.category} onChange={(e) => updateInputRow(row.id, "category", e.target.value)}>
                  <option>Food</option><option>Travel</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Other</option>
                </select>

                <input className="amount border p-2 rounded w-32" type="number" min="0" placeholder="Amount" value={row.amount} onChange={(e) => updateInputRow(row.id, "amount", e.target.value)} />

                <input className="date border p-2 rounded w-36" type="date" value={row.date} onChange={(e) => updateInputRow(row.id, "date", e.target.value)} />

                <button onClick={() => removeInputRow(row.id)} className="removeRowBtn ml-2 px-3 py-1 bg-red-100 rounded">Remove</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center mb-6">
            <button onClick={addInputRow} className="bg-gray-200 px-4 py-2 rounded">+ Add another</button>
            <button onClick={handleAddExpenses} className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow font-semibold hover:bg-purple-700 transition">Add Expense</button>
          </div>
        </section>

        <section className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8 mb-20 border border-gray-100 overflow-hidden">
          <h2 className="text-2xl font-semibold mb-4">Expense Details</h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-xl">
              <thead className="bg-blue-50 text-gray-700">
                <tr>
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Category</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody id="expenseTable">
                {expenses.map((e, idx) => (
                  <tr key={e.id}>
                    <td className="p-3 border">{idx + 1}</td>
                    <td className="p-3 border">{e.desc}</td>
                    <td className="p-3 border">{e.category}</td>
                    <td className="p-3 border">{e.date}</td>
                    <td className="p-3 border">{formatINR(e.amount)}</td>
                    <td className="p-3 border text-center">
                      <button onClick={() => openEdit(e)} className="editBtn text-blue-600 mr-3">✏</button>
                      <button onClick={() => deleteExpense(e.id)} className="deleteBtn text-red-600">🗑</button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td className="p-4 border text-center" colSpan={6}>No expenses — add some above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>

            <label className="text-sm font-semibold text-gray-700">Description</label>
            <input id="editDesc" type="text" className="w-full border p-2 rounded mb-1" value={editValues.desc} onChange={(e) => setEditValues((v) => ({ ...v, desc: e.target.value.replace(/[^A-Za-z\s]/g, "") }))} />
            <p className={`text-xs text-red-500 mb-3 ${/[^A-Za-z\s]/.test(editValues.desc) ? "" : "hidden"}`}>Only alphabets allowed!</p>

            <select id="editCategory" className="w-full border p-2 rounded mb-3" value={editValues.category} onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}>
              <option>Food</option><option>Travel</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Other</option>
            </select>

            <input id="editAmount" type="number" className="w-full border p-2 rounded mb-3" value={editValues.amount} onChange={(e) => setEditValues((v) => ({ ...v, amount: e.target.value }))} />
            <input id="editDate" type="date" className="w-full border p-2 rounded mb-3" value={editValues.date} onChange={(e) => setEditValues((v) => ({ ...v, date: e.target.value }))} />

            <div className="flex justify-end gap-3">
              <button onClick={cancelEdit} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}