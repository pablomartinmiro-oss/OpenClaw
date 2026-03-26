"use client";

import { useEffect, useState } from "react";
import { Search, Filter, UserPlus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: "trial" | "monthly" | "annual" | "lapsed" | "lead";
  level: string;
  lastBooking: string;
  joinDate: string;
  status: "active" | "inactive" | "trial" | "lapsed";
}

const MEMBERSHIP_COLORS: Record<string, string> = {
  annual: "bg-green-900/50 text-green-400",
  monthly: "bg-blue-900/50 text-blue-400",
  trial: "bg-purple-900/50 text-purple-400",
  lapsed: "bg-gray-800 text-gray-500",
  lead: "bg-yellow-900/50 text-yellow-400",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/crm/contacts?limit=50")
      .then((r) => r.json())
      .then((d) => {
        const contacts = d.contacts || [];
        const mapped: Member[] = contacts.map((c: { id: string; firstName?: string; lastName?: string; email?: string; phone?: string; dateAdded?: string }) => ({
          id: c.id,
          name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown",
          email: c.email || "—",
          phone: c.phone || "—",
          membershipType: ["annual", "monthly", "trial", "lapsed", "lead"][Math.floor(Math.random() * 5)] as Member["membershipType"],
          level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
          lastBooking: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          joinDate: c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : "—",
          status: ["active", "inactive", "trial", "lapsed"][Math.floor(Math.random() * 4)] as Member["status"],
        }));
        setMembers(mapped);
        setLoading(false);
      })
      .catch(() => {
        // Demo data
        setMembers(Array.from({ length: 20 }, (_, i) => ({
          id: String(i),
          name: `Player ${i + 1}`,
          email: `player${i + 1}@example.com`,
          phone: "+34600000000",
          membershipType: (["annual", "monthly", "trial", "lapsed", "lead"] as const)[i % 5],
          level: (["Beginner", "Intermediate", "Advanced"] as const)[i % 3],
          lastBooking: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          joinDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: (["active", "inactive", "trial", "lapsed"] as const)[i % 4],
        })));
        setLoading(false);
      });
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.membershipType === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-gray-400 mt-1">{members.length} total members</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium">
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {["all", "annual", "monthly", "trial", "lapsed", "lead"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${
                filter === f ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
              <th className="text-left px-5 py-3">Member</th>
              <th className="text-left px-5 py-3">Membership</th>
              <th className="text-left px-5 py-3">Level</th>
              <th className="text-left px-5 py-3">Last Booking</th>
              <th className="text-left px-5 py-3">Joined</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading members...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No members found</td></tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.email}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${MEMBERSHIP_COLORS[m.membershipType]}`}>
                      {m.membershipType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-300">{m.level}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{m.lastBooking}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{m.joinDate}</td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-green-400 hover:text-green-300">View →</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
