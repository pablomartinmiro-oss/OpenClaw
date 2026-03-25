"use client";

import { useEffect, useState } from "react";

const CANOPY_URL = "https://canopy-backend-production-81e1.up.railway.app";
const CANOPY_EMAIL = "pablo@viddixai.com";
const CANOPY_PASS = "Atlas2026!";

interface Agent {
  id: string;
  name: string;
  status: string;
  adapter: string;
  role: string;
}

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee_id: string | null;
}

interface Session {
  id: string;
  status: string;
  inserted_at: string;
}

export default function CommandPage() {
  const [token, setToken] = useState<string>("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIssue, setNewIssue] = useState("");

  useEffect(() => {
    fetch(`${CANOPY_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: CANOPY_EMAIL, password: CANOPY_PASS }),
    })
      .then((r) => r.json())
      .then((d) => {
        const t = d.token;
        setToken(t);
        return Promise.all([
          fetch(`${CANOPY_URL}/api/v1/agents`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
          fetch(`${CANOPY_URL}/api/v1/issues`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
          fetch(`${CANOPY_URL}/api/v1/sessions`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
        ]);
      })
      .then(([a, i, s]) => {
        setAgents(a.agents || []);
        setIssues(i.issues || []);
        setSessions(s.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const wakeAgent = async (id: string) => {
    await fetch(`${CANOPY_URL}/api/v1/agents/${id}/wake`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: "idle" } : a)));
  };

  const createIssue = async () => {
    if (!newIssue.trim()) return;
    const res = await fetch(`${CANOPY_URL}/api/v1/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: newIssue,
        priority: "high",
        workspace_id: "7154e597-bc18-48c3-9296-0c71676e976f",
      }),
    }).then((r) => r.json());
    if (res.issue) {
      setIssues((prev) => [res.issue, ...prev]);
      setNewIssue("");
    }
  };

  const statusColor: Record<string, string> = {
    idle: "text-green-400",
    working: "text-yellow-400",
    running: "text-yellow-400",
    sleeping: "text-gray-500",
    error: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">🎯 Atlas Command Center</h1>
        <p className="text-gray-400 mt-1">
          Agent status, issues, sessions — all in one place
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-20">Connecting to Canopy...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Agents */}
          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Agents ({agents.length})</h2>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className={`text-xs ${statusColor[agent.status] || "text-gray-400"}`}>
                        {agent.status}
                      </div>
                    </div>
                    {agent.status === "sleeping" ? (
                      <button
                        onClick={() => wakeAgent(agent.id)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg"
                      >
                        Wake
                      </button>
                    ) : (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          agent.status === "working" ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-3">Stats</h2>
              {[
                { label: "Total Issues", value: issues.length },
                { label: "Active Sessions", value: sessions.filter((s) => s.status === "active").length },
                { label: "Agents Online", value: agents.filter((a) => a.status !== "sleeping").length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0"
                >
                  <span className="text-gray-400">{stat.label}</span>
                  <span className="font-mono font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues + Sessions */}
          <div className="col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Issues & Tasks</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createIssue()}
                  placeholder="Create a new task for the team..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={createIssue}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {issues.length === 0 && (
                  <div className="text-center text-gray-500 py-6 text-sm">No issues yet</div>
                )}
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        issue.priority === "high"
                          ? "bg-red-400"
                          : issue.priority === "medium"
                          ? "bg-yellow-400"
                          : "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{issue.title}</div>
                      <div className="text-xs text-gray-500">{issue.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Recent Sessions</h2>
              {sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-sm">No sessions yet</div>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 6).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-800/50"
                    >
                      <div className="font-mono text-xs text-gray-500">{session.id.slice(0, 8)}...</div>
                      <div
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === "active"
                            ? "bg-green-900/50 text-green-400"
                            : session.status === "failed"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {session.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.inserted_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
