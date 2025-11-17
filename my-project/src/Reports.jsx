// src/Reports.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      const data = await res.json();
      setExpenses(data);
      setFiltered(data);
    } catch (err) {
      alert("Failed to load expenses!");
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
  body: expenses.map(e => [
    e.desc,
    e.category,
    e.date,
    e.amount
  ])
});

    pdf.save("Expense_Report.pdf");
  }

  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="bg-[#eef3ff] min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">Custom Reports</h1>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-md mb-6 flex flex-wrap gap-4 justify-between">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border p-2 rounded-xl"
          >
            <option>All</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded-xl"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded-xl"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded-2xl shadow">
            <h3 className="font-bold text-lg">Total Records</h3>
            <p className="text-3xl">{filtered.length}</p>
          </div>
          <div className="bg-purple-500 text-white p-4 rounded-2xl shadow">
            <h3 className="font-bold text-lg">Total Spent</h3>
            <p className="text-3xl">{formatINR(totalSpent)}</p>
          </div>
          <div className="bg-green-500 text-white p-4 rounded-2xl shadow">
            <h3 className="font-bold text-lg">Avg. Expense</h3>
            <p className="text-3xl">{filtered.length ? formatINR(totalSpent / filtered.length) : 0}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-6 justify-center">
          <button onClick={downloadPDF} className="bg-red-500 text-white px-5 py-2 rounded-xl shadow">
            Download PDF
          </button>
          <button onClick={downloadExcel} className="bg-green-600 text-white px-5 py-2 rounded-xl shadow">
            Download Excel
          </button>
          <button onClick={downloadCSV} className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow">
            Download CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-5 rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-3 border">Description</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="p-2 border">{e.desc}</td>
                  <td className="p-2 border">{e.category}</td>
                  <td className="p-2 border">{e.date}</td>
                  <td className="p-2 border">{formatINR(e.amount)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}