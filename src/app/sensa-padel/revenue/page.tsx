"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";

interface RevenueEntry {
  id: string;
  date: string;
  courtBookings: number;
  courtRevenue: number;
  newMemberships: number;
  membershipRevenue: number;
  classesRevenue: number;
  otherRevenue: number;
  notes: string | null;
  createdAt: string;
}

function total(r: RevenueEntry) {
  return r.courtRevenue + r.membershipRevenue + r.classesRevenue + r.otherRevenue;
}

function AddEntryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    courtBookings: "",
    courtRevenue: "",
    newMemberships: "",
    membershipRevenue: "",
    classesRevenue: "",
    otherRevenue: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/sensa/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-semibold text-lg">Add Revenue Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date</label>
            <input
              type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Court Bookings (#)</label>
              <input type="number" value={form.courtBookings} onChange={(e) => setForm({ ...form, courtBookings: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Court Revenue (€)</label>
              <input type="number" step="0.01" value={form.courtRevenue} onChange={(e) => setForm({ ...form, courtRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">New Memberships (#)</label>
              <input type="number" value={form.newMemberships} onChange={(e) => setForm({ ...form, newMemberships: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Membership Revenue (€)</label>
              <input type="number" step="0.01" value={form.membershipRevenue} onChange={(e) => setForm({ ...form, membershipRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Classes (€)</label>
              <input type="number" step="0.01" value={form.classesRevenue} onChange={(e) => setForm({ ...form, classesRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Other (€)</label>
              <input type="number" step="0.01" value={form.otherRevenue} onChange={(e) => setForm({ ...form, otherRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRevenues = useCallback(async () => {
    try {
      const res = await fetch("/api/sensa/revenue");
      const json = await res.json();
      setRevenues(json.revenues ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRevenues(); }, [fetchRevenues]);

  function exportCSV() {
    const header = ["Date", "Court Bookings", "Court Revenue", "New Memberships", "Membership Revenue", "Classes", "Other", "Total", "Notes"];
    const rows = revenues.map((r) => [
      new Date(r.date).toLocaleDateString("es-ES"),
      r.courtBookings,
      r.courtRevenue.toFixed(2),
      r.newMemberships,
      r.membershipRevenue.toFixed(2),
      r.classesRevenue.toFixed(2),
      r.otherRevenue.toFixed(2),
      total(r).toFixed(2),
      r.notes ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensa-revenue-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthTotal = revenues
    .filter((r) => new Date(r.date) >= thisMonthStart)
    .reduce((s, r) => s + total(r), 0);

  const lastMonthTotal = revenues
    .filter((r) => new Date(r.date) >= lastMonthStart && new Date(r.date) < thisMonthStart)
    .reduce((s, r) => s + total(r), 0);

  const monthDiff = thisMonthTotal - lastMonthTotal;
  const monthDiffPct = lastMonthTotal > 0 ? Math.round((monthDiff / lastMonthTotal) * 100) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Daily revenue log</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors">
            + Add Entry
          </button>
        </div>
      </div>

      {/* Month KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">This Month</div>
          <div className="text-2xl font-bold">€{thisMonthTotal.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</div>
          {monthDiffPct !== null && (
            <div className={`text-xs mt-1 ${monthDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
              {monthDiff >= 0 ? "▲" : "▼"} {Math.abs(monthDiffPct)}% vs last month
            </div>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Last Month</div>
          <div className="text-2xl font-bold">€{lastMonthTotal.toLocaleString("es-ES", { minimumFractionDigits: 0 })}</div>
          <div className="text-xs text-gray-400 mt-1">completed period</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : revenues.length === 0 ? (
        <div className="text-gray-500 text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
          No revenue entries yet. Add your first entry above.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Courts</th>
                  <th className="px-4 py-3 text-right">Memberships</th>
                  <th className="px-4 py-3 text-right">Classes</th>
                  <th className="px-4 py-3 text-right">Other</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((r) => (
                  <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {new Date(r.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      <div>€{r.courtRevenue.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">{r.courtBookings} bookings</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      <div>€{r.membershipRevenue.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">{r.newMemberships} new</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">€{r.classesRevenue.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">€{r.otherRevenue.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">€{total(r).toFixed(0)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{r.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700 bg-gray-800/30">
                  <td className="px-4 py-3 font-semibold text-gray-300">Total ({revenues.length} days)</td>
                  <td className="px-4 py-3 text-right font-semibold">€{revenues.reduce((s, r) => s + r.courtRevenue, 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right font-semibold">€{revenues.reduce((s, r) => s + r.membershipRevenue, 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right font-semibold">€{revenues.reduce((s, r) => s + r.classesRevenue, 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right font-semibold">€{revenues.reduce((s, r) => s + r.otherRevenue, 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">€{revenues.reduce((s, r) => s + total(r), 0).toFixed(0)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {showModal && <AddEntryModal onClose={() => setShowModal(false)} onSaved={fetchRevenues} />}
    </div>
  );
}
