"use client";

import { useState, useEffect, useCallback } from "react";

// ========================== TYPES ==========================

interface InboxItem {
  id: string;
  source: string;
  subject: string | null;
  fromName: string | null;
  fromEmail: string | null;
  aiSummary: string | null;
  priority: number;
  actionType: string | null;
  requiresAction: boolean;
  receivedAt: string | null;
  status: string;
}

interface ChiefTask {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  sourceContext: string | null;
  priority: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

interface GmailStatus {
  connected: boolean;
  isExpired?: boolean;
  lastSync?: string | null;
}

interface TranscriptAnalysis {
  summary: string;
  commitments: Array<{ who: string; what: string; when?: string }>;
  followUps: Array<{ description: string; person?: string; urgency: string }>;
  decisions: string[];
  tasks: Array<{
    title: string;
    description?: string;
    priority: number;
    dueDate?: string | null;
    source: string;
  }>;
}

// ========================== HELPERS ==========================

const PRIORITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Urgente", color: "text-red-700", bg: "bg-red-100" },
  2: { label: "Importante", color: "text-amber-700", bg: "bg-amber-100" },
  3: { label: "Normal", color: "text-blue-700", bg: "bg-blue-100" },
  4: { label: "Bajo", color: "text-gray-600", bg: "bg-gray-100" },
};

const SOURCE_ICONS: Record<string, string> = {
  gmail: "📧",
  transcript: "📞",
  manual: "✍️",
  notion: "📝",
};

function PriorityBadge({ priority }: { priority: number }) {
  const p = PRIORITY_LABELS[priority] || PRIORITY_LABELS[3];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.bg} ${p.color}`}>
      {p.label}
    </span>
  );
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "desconocido";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// ========================== COMPONENTS ==========================

function StatusBar({
  gmail,
  onSync,
  syncing,
}: {
  gmail: GmailStatus | null;
  onSync: () => void;
  syncing: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      {/* Gmail */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Gmail:</span>
        {gmail?.connected ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm font-medium">
              ✅ Conectado
              {gmail.lastSync && (
                <span className="text-gray-500 font-normal ml-1">
                  (sync: {timeAgo(gmail.lastSync)})
                </span>
              )}
            </span>
            <button
              onClick={onSync}
              disabled={syncing}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncing ? "Sincronizando..." : "↻ Sync"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-sm">❌ No conectado</span>
            <a
              href="/api/integrations/gmail/auth"
              className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
            >
              Conectar
            </a>
          </div>
        )}
      </div>

      {/* MeetGeek */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">MeetGeek:</span>
        <span className="text-gray-400 text-sm">🔜 Próximamente</span>
      </div>

      {/* Notion */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Notion:</span>
        <span className="text-gray-400 text-sm">🔜 Próximamente</span>
      </div>
    </div>
  );
}

function InboxColumn({
  items,
  loading,
  onAction,
}: {
  items: InboxItem[];
  loading: boolean;
  onAction: (id: string, action: "done" | "snooze" | "task") => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📥 Inbox</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length} pendientes
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Cargando...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm font-medium">¡Inbox limpio!</p>
            <p className="text-xs mt-1">Nada requiere acción</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">
                    {SOURCE_ICONS[item.source] || "📌"}{" "}
                    {item.fromName || item.fromEmail || "Desconocido"}
                  </p>
                  <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
                    {item.subject || "Sin asunto"}
                  </p>
                </div>
                <PriorityBadge priority={item.priority} />
              </div>

              {item.aiSummary && (
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {item.aiSummary}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => onAction(item.id, "done")}
                  className="flex-1 text-xs py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  ✅ Listo
                </button>
                <button
                  onClick={() => onAction(item.id, "snooze")}
                  className="flex-1 text-xs py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                >
                  ⏰ Posponer
                </button>
                <button
                  onClick={() => onAction(item.id, "task")}
                  className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  → Tarea
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksColumn({
  tasks,
  loading,
  onComplete,
  onAdd,
}: {
  tasks: ChiefTask[];
  loading: boolean;
  onComplete: (id: string) => void;
  onAdd: (title: string) => void;
}) {
  const [newTask, setNewTask] = useState("");

  const grouped = {
    1: tasks.filter((t) => t.priority === 1),
    2: tasks.filter((t) => t.priority === 2),
    3: tasks.filter((t) => t.priority >= 3),
  };

  const handleAdd = () => {
    if (newTask.trim()) {
      onAdd(newTask.trim());
      setNewTask("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">✅ Mis Tareas</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {tasks.length} activas
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Cargando...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Priority groups */}
          {[
            { priority: 1, label: "🔴 Urgente", color: "text-red-600" },
            { priority: 2, label: "🟡 Importante", color: "text-amber-600" },
            { priority: 3, label: "⚪ Normal", color: "text-gray-600" },
          ].map(({ priority, label, color }) => {
            const group = grouped[priority as 1 | 2 | 3];
            if (group.length === 0) return null;
            return (
              <div key={priority}>
                <h3 className={`text-xs font-bold ${color} uppercase tracking-wide mb-2`}>
                  {label}
                </h3>
                <div className="space-y-2">
                  {group.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 bg-white rounded-xl border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                    >
                      <button
                        onClick={() => onComplete(task.id)}
                        className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.source && (
                            <span className="text-xs text-gray-400">
                              {SOURCE_ICONS[task.source] || "📌"} {task.source}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-gray-400">
                              📅 {new Date(task.dueDate).toLocaleDateString("es-ES")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium">¡Sin tareas pendientes!</p>
            </div>
          )}
        </div>
      )}

      {/* Add task */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="+ Añadir tarea..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function TranscriptColumn({
  onTasksExtracted,
}: {
  onTasksExtracted: (tasks: ChiefTask[]) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<TranscriptAnalysis | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    if (!transcript.trim()) return;
    setProcessing(true);
    setError("");
    setAnalysis(null);
    setSaved(false);

    try {
      const res = await fetch("/api/integrations/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          meetingTitle: meetingTitle || undefined,
          save: false,
        }),
      });
      const data = await res.json() as { analysis?: TranscriptAnalysis; error?: string };
      if (!res.ok || data.error) {
        setError(data.error || "Error procesando transcript");
      } else {
        setAnalysis(data.analysis || null);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!analysis || !transcript.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/integrations/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          meetingTitle: meetingTitle || undefined,
          save: true,
        }),
      });
      const data = await res.json() as { tasksCreated?: number; error?: string };
      if (res.ok && !data.error) {
        setSaved(true);
        // Notify parent to refresh tasks
        onTasksExtracted([]);
        // Clear after save
        setTimeout(() => {
          setTranscript("");
          setMeetingTitle("");
          setAnalysis(null);
          setSaved(false);
        }, 3000);
      } else {
        setError(data.error || "Error guardando");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-800 mb-4">📞 Procesar Reunión</h2>

      <div className="space-y-3 mb-4">
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Título de la reunión..."
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Pega aquí el transcript de tu reunión..."
          rows={6}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <button
          onClick={handleExtract}
          disabled={!transcript.trim() || processing}
          className="w-full py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {processing ? "Analizando con IA..." : "🔍 Extraer Tareas"}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}

      {analysis && !saved && (
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Summary */}
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Resumen</p>
            <p className="text-sm text-gray-700">{analysis.summary}</p>
          </div>

          {/* Tasks to confirm */}
          {analysis.tasks.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Tareas extraídas ({analysis.tasks.length})
              </p>
              <div className="space-y-2">
                {analysis.tasks.map((task, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commitments */}
          {analysis.commitments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Compromisos
              </p>
              <div className="space-y-1">
                {analysis.commitments.map((c, i) => (
                  <div key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>
                      <strong>{c.who}:</strong> {c.what}
                      {c.when && <span className="text-gray-500"> ({c.when})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-40 transition-colors font-medium text-sm"
          >
            {saving ? "Guardando..." : `✅ Confirmar y guardar (${analysis.tasks.length} tareas)`}
          </button>
        </div>
      )}

      {saved && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm font-medium text-green-700">¡Guardado correctamente!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================== MAIN PAGE ==========================

export default function ChiefOfStaffPage() {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [tasks, setTasks] = useState<ChiefTask[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [briefing, setBriefing] = useState("");
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const fetchGmailStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/gmail/status");
      const data = await res.json() as GmailStatus;
      setGmailStatus(data);
    } catch {
      setGmailStatus({ connected: false });
    }
  }, []);

  const fetchInbox = useCallback(async () => {
    setLoadingInbox(true);
    try {
      const res = await fetch("/api/chief/inbox");
      const data = await res.json() as { items: InboxItem[] };
      setInboxItems(data.items || []);
    } catch (err) {
      console.error("Inbox fetch error:", err);
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch("/api/chief/tasks");
      const data = await res.json() as { tasks: ChiefTask[] };
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Tasks fetch error:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchGmailStatus();
    fetchInbox();
    fetchTasks();
  }, [fetchGmailStatus, fetchInbox, fetchTasks]);

  const handleGmailSync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/integrations/gmail/sync", { method: "POST" });
      const data = await res.json() as { message?: string; error?: string };
      setSyncMessage(data.message || data.error || "Sync completado");
      await fetchInbox();
      await fetchTasks();
      await fetchGmailStatus();
    } catch {
      setSyncMessage("Error durante el sync");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(""), 5000);
    }
  };

  const handleInboxAction = async (id: string, action: "done" | "snooze" | "task") => {
    if (action === "task") {
      const item = inboxItems.find((i) => i.id === id);
      if (item) {
        await fetch("/api/chief/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.subject || "Revisar email",
            description: item.aiSummary || undefined,
            source: "gmail",
            sourceId: id,
            sourceContext: `${item.fromName || item.fromEmail}: ${item.subject}`,
            priority: item.priority,
          }),
        });
        await fetchTasks();
      }
    }

    const status = action === "done" ? "done" : action === "snooze" ? "snoozed" : "pending";
    const snoozedUntil =
      action === "snooze"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined;

    await fetch("/api/chief/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, snoozedUntil }),
    });

    setInboxItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleTaskComplete = async (id: string) => {
    await fetch("/api/chief/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "done" }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = async (title: string) => {
    await fetch("/api/chief/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, source: "manual" }),
    });
    await fetchTasks();
  };

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    setBriefing("");
    try {
      const res = await fetch("/api/brain/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_telegram: false }),
      });
      const data = await res.json() as { briefing?: string; error?: string };
      setBriefing(data.briefing || data.error || "Error generando briefing");
    } catch {
      setBriefing("Error de conexión");
    } finally {
      setLoadingBriefing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎯 Chief of Staff</h1>
              <p className="text-sm text-gray-500">Tu asistente ejecutivo personal</p>
            </div>
            <button
              onClick={handleGenerateBriefing}
              disabled={loadingBriefing}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all font-medium text-sm shadow-sm"
            >
              {loadingBriefing ? "⏳ Generando..." : "🌅 Mi briefing de hoy"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Status bar */}
        <StatusBar
          gmail={gmailStatus}
          onSync={handleGmailSync}
          syncing={syncing}
        />

        {/* Sync message */}
        {syncMessage && (
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-200">
            {syncMessage}
          </div>
        )}

        {/* Briefing panel */}
        {briefing && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-900">🌅 Tu Briefing</h3>
              <button
                onClick={() => setBriefing("")}
                className="text-amber-600 hover:text-amber-800 text-sm"
              >
                ✕ Cerrar
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
              {briefing}
            </pre>
          </div>
        )}

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Inbox */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 h-[600px] flex flex-col shadow-sm">
            <InboxColumn
              items={inboxItems}
              loading={loadingInbox}
              onAction={handleInboxAction}
            />
          </div>

          {/* Column 2: Tasks */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 h-[600px] flex flex-col shadow-sm">
            <TasksColumn
              tasks={tasks}
              loading={loadingTasks}
              onComplete={handleTaskComplete}
              onAdd={handleAddTask}
            />
          </div>

          {/* Column 3: Transcript */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 h-[600px] flex flex-col shadow-sm">
            <TranscriptColumn onTasksExtracted={() => fetchTasks()} />
          </div>
        </div>
      </div>
    </div>
  );
}
