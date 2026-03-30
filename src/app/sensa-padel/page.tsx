"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Users, Euro, Phone, CheckCircle, X } from "lucide-react";

interface KPIs {
  todayRevenue: number;
  yesterdayRevenue: number;
  todayCourtBookings: number;
  newPlayersToday: number;
  activeLeads: number;
}

interface ChartDay {
  date: string;
  total: number;
}

interface HotLead {
  id: string;
  visitCount: number;
  lastVisit: string;
  status: string;
  member: {
    id: string;
    name: string;
    phone: string | null;
  };
}

interface DashboardData {
  kpis: KPIs;
  chartData: ChartDay[];
  hotLeads: HotLead[];
}

// ─── Revenue Modal ────────────────────────────────────────────────────────────
function RevenueModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
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
          <h2 className="font-semibold text-lg">Add Today&apos;s Revenue</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Court Bookings (#)</label>
              <input
                type="number" value={form.courtBookings}
                onChange={(e) => setForm({ ...form, courtBookings: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Court Revenue (€)</label>
              <input
                type="number" step="0.01" value={form.courtRevenue}
                onChange={(e) => setForm({ ...form, courtRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">New Memberships (#)</label>
              <input
                type="number" value={form.newMemberships}
                onChange={(e) => setForm({ ...form, newMemberships: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Membership Revenue (€)</label>
              <input
                type="number" step="0.01" value={form.membershipRevenue}
                onChange={(e) => setForm({ ...form, membershipRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Classes (€)</label>
              <input
                type="number" step="0.01" value={form.classesRevenue}
                onChange={(e) => setForm({ ...form, classesRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Other (€)</label>
              <input
                type="number" step="0.01" value={form.otherRevenue}
                onChange={(e) => setForm({ ...form, otherRevenue: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              rows={2} placeholder="Optional notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── New Player Modal ─────────────────────────────────────────────────────────
function NewPlayerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    court: "",
    isFirst: true,
    amountPaid: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await fetch("/api/sensa/players", {
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
          <h2 className="font-semibold text-lg">Add New Player</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name *</label>
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="+34..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email (optional)</label>
              <input
                type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="email@..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Court Played</label>
              <input
                value={form.court}
                onChange={(e) => setForm({ ...form, court: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Court 1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Amount Paid (€)</label>
              <input
                type="number" step="0.01" value={form.amountPaid}
                onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox" checked={form.isFirst}
              onChange={(e) => setForm({ ...form, isFirst: e.target.checked })}
              className="w-4 h-4 rounded accent-green-500"
            />
            <span className="text-sm text-gray-300">First visit (add to leads)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SensaDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/sensa/dashboard");
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleLeadAction(leadId: string, status: string) {
    await fetch("/api/sensa/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: leadId,
        status,
        followUpDate: status === "contacted" ? new Date(Date.now() + 7 * 86400000).toISOString() : undefined,
        convertedAt: status === "converted" ? new Date().toISOString() : undefined,
      }),
    });
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const revenueDiff = (kpis?.todayRevenue ?? 0) - (kpis?.yesterdayRevenue ?? 0);
  const revenueDiffPct = kpis?.yesterdayRevenue
    ? Math.round((revenueDiff / kpis.yesterdayRevenue) * 100)
    : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GM Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Today&apos;s Revenue</span>
            <Euro size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold">€{(kpis?.todayRevenue ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 0 })}</div>
          {revenueDiffPct !== null && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${revenueDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
              {revenueDiff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(revenueDiffPct)}% vs yesterday
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Court Bookings</span>
            <span className="text-green-400 text-sm">🎾</span>
          </div>
          <div className="text-2xl font-bold">{kpis?.todayCourtBookings ?? 0}<span className="text-gray-500 text-lg">/6</span></div>
          <div className="text-xs text-gray-400 mt-1">courts active today</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">New Players</span>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{kpis?.newPlayersToday ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">first-timers today</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Active Leads</span>
            <span className="text-orange-400 text-sm">🔥</span>
          </div>
          <div className="text-2xl font-bold">{kpis?.activeLeads ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">warm leads to follow up</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold mb-4">Revenue — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.chartData ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#9ca3af" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`€${value}`, "Revenue"]}
            />
            <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Leads */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">🔥 Hot Leads</h2>
            <a href="/sensa-padel/leads" className="text-xs text-blue-400 hover:text-blue-300">View all →</a>
          </div>
          {(data?.hotLeads ?? []).length === 0 ? (
            <div className="text-gray-500 text-sm py-6 text-center">No hot leads right now. Keep playing! 🎾</div>
          ) : (
            <div className="space-y-3">
              {(data?.hotLeads ?? []).map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{lead.member.name}</div>
                    <div className="text-xs text-gray-400">{lead.member.phone ?? "No phone"} · {lead.visitCount} visits · Last: {new Date(lead.lastVisit).toLocaleDateString("es-ES")}</div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${lead.member.phone}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs transition-colors"
                    >
                      <Phone size={12} /> Call
                    </a>
                    <button
                      onClick={() => handleLeadAction(lead.id, "converted")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 text-xs transition-colors"
                    >
                      <CheckCircle size={12} /> Converted
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowRevenueModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Euro size={16} />
              Add Today&apos;s Revenue
            </button>
            <button
              onClick={() => setShowPlayerModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-700 hover:bg-green-600 text-sm font-medium transition-colors"
            >
              <Users size={16} />
              Add New Player
            </button>
            <a
              href="/sensa-padel/members"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              <CheckCircle size={16} />
              Mark as Member
            </a>
            <div className="pt-2 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-2">Quick links</div>
              <div className="space-y-1.5">
                <a href="/sensa-padel/leads" className="block text-xs text-blue-400 hover:text-blue-300 py-1">→ Lead Tracker</a>
                <a href="/sensa-padel/revenue" className="block text-xs text-blue-400 hover:text-blue-300 py-1">→ Revenue Log</a>
                <a href="/sensa-padel/members" className="block text-xs text-blue-400 hover:text-blue-300 py-1">→ Members</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRevenueModal && (
        <RevenueModal onClose={() => setShowRevenueModal(false)} onSaved={fetchData} />
      )}
      {showPlayerModal && (
        <NewPlayerModal onClose={() => setShowPlayerModal(false)} onSaved={fetchData} />
      )}
    </div>
  );
}
