// src/Reports.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:3000";
const formatINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      const data = await res.json();
      // ensure consistent shape
      const normalized = (data || []).map((d) => ({
        id: d.id,
        desc: d.desc || d.description || "",
        category: d.category || "Other",
        date: d.date || "",
        amount: Number(d.amount || d.value || 0),
      }));
      setExpenses(normalized);
      setFiltered(normalized);
      const cats = Array.from(new Set(normalized.map((x) => x.category))).filter(Boolean);
      setCategories(["All", ...cats]);
    } catch (err) {
      // graceful fallback to empty
      console.error("Failed to load expenses:", err);
      setExpenses([]);
      setFiltered([]);
      setCategories(["All"]);
    } finally {
      setLoading(false);
    }
  }

  // Filtering logic
  useEffect(() => {
    let data = [...expenses];

    if (categoryFilter !== "All") {
      data = data.filter((e) => e.category === categoryFilter);
    }
    if (dateFrom) {
      data = data.filter((e) => e.date >= dateFrom);
    }
    if (dateTo) {
      data = data.filter((e) => e.date <= dateTo);
    }

    setFiltered(data);
  }, [categoryFilter, dateFrom, dateTo, expenses]);

  // Download CSV
  function downloadCSV() {
    const rows = filtered.map((e) => ({
      Description: e.desc,
      Category: e.category,
      Date: e.date,
      Amount: e.amount,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    const buffer = XLSX.write(workbook, { bookType: "csv", type: "array" });
    saveAs(new Blob([buffer], { type: "text/csv" }), "expenses_report.csv");
  }

  // Download Excel
  function downloadExcel() {
    const rows = filtered.map((e) => ({
      Description: e.desc,
      Category: e.category,
      Date: e.date,
      Amount: e.amount,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "expenses_report.xlsx");
  }

  // Download PDF
  function downloadPDF() {
    const pdf = new jsPDF();
    pdf.text("Expense Report", 14, 14);
    autoTable(pdf, {
      head: [["Description", "Category", "Date", "Amount"]],
      body: filtered.map((e) => [e.desc, e.category, e.date, formatINR(e.amount)]),
      startY: 20,
      styles: { fontSize: 10 },
    });

    pdf.save("Expense_Report.pdf");
  }

  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#eef3ff] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-4 text-center">Custom Reports</h1>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <label className="flex-1 min-w-[140px]">
            <span className="sr-only">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border p-2 rounded-xl"
              aria-label="Filter by category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex-1 min-w-[140px]">
            <span className="sr-only">Date from</span>
            <input
              type="date"
              className="w-full border p-2 rounded-xl"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Date from"
            />
          </label>

          <label className="flex-1 min-w-[140px]">
            <span className="sr-only">Date to</span>
            <input
              type="date"
              className="w-full border p-2 rounded-xl"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Date to"
            />
          </label>

          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-0">
            <button
              onClick={() => {
                setCategoryFilter("All");
                setDateFrom("");
                setDateTo("");
              }}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
              aria-label="Reset filters"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded-2xl shadow flex flex-col">
            <h3 className="font-bold text-lg">Total Records</h3>
            <p className="text-2xl sm:text-3xl mt-2">{filtered.length}</p>
          </div>

          <div className="bg-purple-500 text-white p-4 rounded-2xl shadow flex flex-col">
            <h3 className="font-bold text-lg">Total Spent</h3>
            <p className="text-2xl sm:text-3xl mt-2">{formatINR(totalSpent)}</p>
          </div>

          <div className="bg-green-500 text-white p-4 rounded-2xl shadow flex flex-col">
            <h3 className="font-bold text-lg">Avg. Expense</h3>
            <p className="text-2xl sm:text-3xl mt-2">
              {filtered.length ? formatINR(totalSpent / filtered.length) : formatINR(0)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={downloadPDF}
            className="bg-red-500 text-white px-5 py-2 rounded-xl shadow w-full sm:w-auto"
            aria-label="Download PDF"
          >
            Download PDF
          </button>
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-5 py-2 rounded-xl shadow w-full sm:w-auto"
            aria-label="Download Excel"
          >
            Download Excel
          </button>
          <button
            onClick={downloadCSV}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow w-full sm:w-auto"
            aria-label="Download CSV"
          >
            Download CSV
          </button>
        </div>

        {/* Table (desktop) */}
        <div className="bg-white p-4 rounded-2xl shadow-lg overflow-x-auto mb-6 hidden md:block">
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-blue-50">
                <tr>
                  <th className="text-left p-3 border">Description</th>
                  <th className="text-left p-3 border">Category</th>
                  <th className="text-left p-3 border">Date</th>
                  <th className="text-right p-3 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="odd:bg-gray-50">
                    <td className="p-3 border align-top">{e.desc}</td>
                    <td className="p-3 border align-top">{e.category}</td>
                    <td className="p-3 border align-top">{e.date}</td>
                    <td className="p-3 border text-right align-top">{formatINR(e.amount)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile: card list */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="py-6 text-center">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-4 rounded-2xl shadow text-center text-gray-500">No data found.</div>
          ) : (
            filtered.map((e) => (
              <div key={e.id} className="bg-white p-4 rounded-2xl shadow flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base">{e.desc || "—"}</h4>
                    <p className="text-sm text-gray-600">{e.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{e.date}</div>
                    <div className="text-lg font-bold mt-1">{formatINR(e.amount)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
