"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface Session {
  id: string;
  playedAt: string;
}

interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  memberType: string;
  joinDate: string;
  sessions: Session[];
  sessionsThisMonth: number;
}

const MEMBER_TYPE_CONFIG: Record<string, { label: string; color: string; price: number }> = {
  unlimited: { label: "Unlimited", color: "bg-blue-500/20 text-blue-400", price: 350 },
  standard:  { label: "Standard 8", color: "bg-green-500/20 text-green-400", price: 200 },
};

function AddMemberModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    memberType: "standard",
    joinDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await fetch("/api/sensa/members", {
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
          <h2 className="font-semibold text-lg">Add Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="+34..." />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="email@..." />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Membership Type</label>
            <select value={form.memberType} onChange={(e) => setForm({ ...form, memberType: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              <option value="unlimited">Unlimited — €350/mo</option>
              <option value="standard">Standard 8 sessions — €200/mo</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Join Date</label>
            <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/sensa/members");
      const json = await res.json();
      setMembers(json.members ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const unlimited = members.filter((m) => m.memberType === "unlimited");
  const standard = members.filter((m) => m.memberType === "standard");
  const mrr = unlimited.length * 350 + standard.length * 200;

  const displayed = filter === "all" ? members : members.filter((m) => m.memberType === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-gray-400 text-sm mt-1">{members.length} active members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors">
          + Add Member
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Unlimited Members</div>
          <div className="text-2xl font-bold">{unlimited.length}</div>
          <div className="text-xs text-gray-400 mt-1">€350/mo each</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Standard Members</div>
          <div className="text-2xl font-bold">{standard.length}</div>
          <div className="text-xs text-gray-400 mt-1">€200/mo each</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Monthly Recurring</div>
          <div className="text-2xl font-bold text-green-400">€{mrr.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">MRR</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "unlimited", "standard"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "All Members" : f === "unlimited" ? "Unlimited (€350)" : "Standard (€200)"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : displayed.length === 0 ? (
        <div className="text-gray-500 text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
          No members yet. Add your first member above.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Join Date</th>
                  <th className="px-4 py-3 text-left">Last Session</th>
                  <th className="px-4 py-3 text-center">Sessions (mo)</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((m) => {
                  const typeCfg = MEMBER_TYPE_CONFIG[m.memberType];
                  const lastSession = m.sessions[0]?.playedAt;
                  return (
                    <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg?.color ?? "bg-gray-600/20 text-gray-400"}`}>
                          {typeCfg?.label ?? m.memberType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {m.phone ? (
                          <a href={`tel:${m.phone}`} className="hover:text-blue-400 transition-colors">{m.phone}</a>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(m.joinDate).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {lastSession ? new Date(lastSession).toLocaleDateString("es-ES") : "—"}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {m.sessionsThisMonth}
                        {m.memberType === "standard" && (
                          <span className="text-gray-500">/8</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <AddMemberModal onClose={() => setShowModal(false)} onSaved={fetchMembers} />}
    </div>
  );
}
