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
  const [inputBudget, setInputBudget] = useState("");
  const [spent, setSpent] = useState(0);

  const [inputRows, setInputRows] = useState([
    { id: Date.now(), desc: "", category: "Food", amount: "", date: todayStr() },
  ]);

  const [expenses, setExpenses] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ desc: "", category: "Food", amount: "", date: todayStr() });

  const toNumber = (v) => {
    if (v === "" || v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  async function safeFetch(url, opts = {}) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res;
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    (async function init() {
      const u = getCurrentUser();
      if (!u) {
        navigate("/signin");
        return;
      }
      setUser(u);

      try {
        const bRes = await safeFetch(`${API_BASE}/budget?userId=${u.id}`);
        const budgets = await bRes.json();

        if (Array.isArray(budgets) && budgets.length > 0) {
          const myBudget = budgets[0];
          setBudget(Number(myBudget.value || 0));
          setBudgetRecordId(myBudget.id);
        } else {
          const createRes = await safeFetch(`${API_BASE}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: u.id, value: 0 }),
          });
          const created = await createRes.json();
          setBudget(0);
          setBudgetRecordId(created.id);
        }

        const eRes = await safeFetch(`${API_BASE}/expenses?userId=${u.id}`);
        const eData = await eRes.json();
        setExpenses(Array.isArray(eData) ? eData : []);
      } catch (err) {
        console.warn("Could not load from API. Is JSON Server running?", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    setSpent(total);
  }, [expenses]);

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

      if (budget > 0 && spent + amount > budget) {
        const inc = window.confirm("This expense exceeds your budget. Increase budget now?");
        if (inc) {
          const newBudgetStr = window.prompt("Enter new total budget:", String(Math.max(spent + amount, budget)));
          const newBudget = toNumber(newBudgetStr);
          if (!newBudget || newBudget < spent + amount) {
            alert("Invalid or insufficient budget. Expense not added.");
            continue;
          }
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

      try {
        await safeFetch(`${API_BASE}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, desc, category, amount, date }),
        });
        addedAny = true;
      } catch (err) {
        console.error("Failed to add expense:", err);
      }
    }

    if (!addedAny) {
      alert("No valid expenses added.");
      return;
    }

    setInputRows([{ id: Date.now() + 1, desc: "", category: "Food", amount: "", date: todayStr() }]);
    await loadExpenses();
  }

  async function deleteExpense(id) {
    try {
      await safeFetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
      setExpenses((ex) => ex.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Check JSON Server.");
    }
  }

  function openEdit(exp) {
    setEditing(exp.id);
    setEditValues({ desc: exp.desc, category: exp.category, amount: exp.amount, date: exp.date || todayStr() });
    setIsEditOpen(true);
  }

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

    try {
      await safeFetch(`${API_BASE}/expenses/${editing}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, category: editValues.category, amount, date }),
      });
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
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">Smart Expense Tracker</h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">Take control of your finances with intelligent tracking</p>
        </section>

        <section className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl p-6 sm:p-8 mb-8 mt-6 border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 p-3 rounded-lg text-blue-600 text-xl">💳</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Set Your Budget</h2>
                <p className="text-sm text-gray-500 hidden sm:block">Manage your monthly limit and track expenses.</p>
              </div>
            </div>

            <div className="ml-auto flex gap-2">
              <Link to="/insights" className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Expense Insights</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              value={inputBudget}
              onChange={(e) => setInputBudget(e.target.value)}
              placeholder="Enter your monthly budget"
              className="w-full sm:w-64 border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring"
              type="number"
              min="0"
            />

            <button onClick={commitBudget} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition">
              Set Budget
            </button>

            <div className="w-full sm:w-auto flex gap-3 mt-3 sm:mt-0">
              <div className="bg-blue-500 text-white p-3 rounded-2xl shadow-lg flex-1 text-center">
                <p className="text-sm font-semibold">Total Budget</p>
                <h3 id="totalBudget" className="text-2xl sm:text-3xl font-bold mt-1">{formatINR(budget)}</h3>
              </div>

              <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg flex-1 text-center">
                <p className="text-sm font-semibold">Spent</p>
                <h3 id="totalSpent" className="text-2xl sm:text-3xl font-bold mt-1">{formatINR(spent)}</h3>
              </div>

              <div className="bg-green-500 text-white p-3 rounded-2xl shadow-lg flex-1 text-center">
                <p className="text-sm font-semibold">Balance</p>
                <h3 id="balanceLeft" className="text-2xl sm:text-3xl font-bold mt-1">{formatINR(budget - spent)}</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8 border border-gray-100 overflow-hidden">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Add New Expense</h2>

          <div className="flex flex-col gap-4 mb-4">
            {inputRows.map((row) => (
              <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <input
                    className={`desc w-full border p-2 rounded ${/[^A-Za-z\s]/.test(row.desc) ? "border-red-500" : "border-gray-300"}`}
                    type="text"
                    placeholder="Description"
                    value={row.desc}
                    onChange={(e) => updateInputRow(row.id, "desc", e.target.value)}
                  />
                  <p className={`descError text-xs text-red-500 mt-1 ${/[^A-Za-z\s]/.test(row.desc) ? "block" : "hidden"}`}>Only alphabets allowed!</p>
                </div>

                <select className="category border p-2 rounded w-full sm:w-40" value={row.category} onChange={(e) => updateInputRow(row.id, "category", e.target.value)}>
                  <option>Food</option><option>Travel</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Other</option>
                </select>

                <input className="amount border p-2 rounded w-full sm:w-32" type="number" min="0" placeholder="Amount" value={row.amount} onChange={(e) => updateInputRow(row.id, "amount", e.target.value)} />

                <input className="date border p-2 rounded w-full sm:w-40" type="date" value={row.date} onChange={(e) => updateInputRow(row.id, "date", e.target.value)} />

                <button onClick={() => removeInputRow(row.id)} className="removeRowBtn ml-0 sm:ml-2 px-3 py-2 bg-red-100 rounded text-sm">Remove</button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
            <button onClick={addInputRow} className="w-full sm:w-auto bg-gray-200 px-4 py-2 rounded">+ Add another</button>
            <button onClick={handleAddExpenses} className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl shadow font-semibold hover:bg-purple-700 transition">Add Expense</button>
          </div>
          <p className="text-xs text-gray-500 text-center">Tip: add multiple rows, then press "Add Expense".</p>
        </section>

        <section className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-20 border border-gray-100 overflow-hidden">
          <h2 className="text-2xl font-semibold mb-4">Expense Details</h2>

          {/* Desktop table */}
          <div className="overflow-x-auto hidden md:block">
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
                  <tr key={e.id} className="odd:bg-gray-50">
                    <td className="p-3 border align-top">{idx + 1}</td>
                    <td className="p-3 border align-top">{e.desc}</td>
                    <td className="p-3 border align-top">{e.category}</td>
                    <td className="p-3 border align-top">{e.date}</td>
                    <td className="p-3 border align-top">{formatINR(e.amount)}</td>
                    <td className="p-3 border text-center align-top">
                      <button onClick={() => openEdit(e)} className="editBtn text-blue-600 mr-3" aria-label={`Edit ${e.desc}`}>✏</button>
                      <button onClick={() => deleteExpense(e.id)} className="deleteBtn text-red-600" aria-label={`Delete ${e.desc}`}>🗑</button>
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {expenses.length === 0 ? (
              <div className="bg-white p-4 rounded-2xl text-center text-gray-500">No expenses — add some above.</div>
            ) : (
              expenses.map((e, idx) => (
                <div key={e.id} className="bg-white border rounded-2xl p-4 shadow-sm flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{e.desc}</h4>
                      <div className="text-sm font-semibold">{formatINR(e.amount)}</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{e.category} • {e.date}</p>
                  </div>
                  <div className="flex flex-col items-end ml-4 gap-2">
                    <button onClick={() => openEdit(e)} className="text-blue-600 text-sm px-2 py-1 rounded">Edit</button>
                    <button onClick={() => deleteExpense(e.id)} className="text-red-600 text-sm px-2 py-1 rounded">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Edit Modal (responsive) */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-3">Edit Expense</h2>

            <label className="text-sm font-semibold text-gray-700">Description</label>
            <input
              id="editDesc"
              type="text"
              className="w-full border p-2 rounded mb-2"
              value={editValues.desc}
              onChange={(e) => setEditValues((v) => ({ ...v, desc: e.target.value.replace(/[^A-Za-z\s]/g, "") }))}
            />
            <p className={`text-xs text-red-500 mb-2 ${/[^A-Za-z\s]/.test(editValues.desc) ? "" : "hidden"}`}>Only alphabets allowed!</p>

            <select id="editCategory" className="w-full border p-2 rounded mb-3" value={editValues.category} onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}>
              <option>Food</option><option>Travel</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Other</option>
            </select>

            <input id="editAmount" type="number" className="w-full border p-2 rounded mb-3" value={editValues.amount} onChange={(e) => setEditValues((v) => ({ ...v, amount: e.target.value }))} />
            <input id="editDate" type="date" className="w-full border p-2 rounded mb-4" value={editValues.date} onChange={(e) => setEditValues((v) => ({ ...v, date: e.target.value }))} />

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
