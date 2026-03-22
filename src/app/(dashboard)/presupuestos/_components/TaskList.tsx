"use client";

import {
  CheckCircle, Circle, Clock, FileText, Shield, Ruler,
  MessageSquare, MapPin, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useTasks, useUpdateTask } from "@/hooks/useQuotes";
import type { Task } from "@/hooks/useQuotes";

interface Props {
  quoteId: string;
}

const TASK_ICONS: Record<string, React.ReactNode> = {
  request_dni: <FileText className="h-4 w-4" />,
  check_dni: <FileText className="h-4 w-4" />,
  request_sizes: <Ruler className="h-4 w-4" />,
  prepare_material: <Ruler className="h-4 w-4" />,
  validate_level: <MessageSquare className="h-4 w-4" />,
  offer_insurance: <Shield className="h-4 w-4" />,
  send_location: <MapPin className="h-4 w-4" />,
};

function getTaskIcon(type: string): React.ReactNode {
  return TASK_ICONS[type] ?? <AlertTriangle className="h-4 w-4" />;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);

  const formatted = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  if (diffDays < 0) return `${formatted} (vencida)`;
  if (diffDays === 0) return `${formatted} (hoy)`;
  if (diffDays <= 3) return `${formatted} (en ${diffDays}d)`;
  return formatted;
}

function TaskRow({ task, onToggle, isPending }: {
  task: Task; onToggle: () => void; isPending: boolean;
}) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className={`flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors ${isCompleted ? "opacity-60" : ""} ${isOverdue ? "bg-red-50/50" : "hover:bg-surface/50"}`}>
      <button
        onClick={onToggle}
        disabled={isPending}
        className="mt-0.5 flex-shrink-0 transition-colors disabled:opacity-50"
      >
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-sage" />
        ) : (
          <Circle className="h-5 w-5 text-text-secondary hover:text-coral" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${isCompleted ? "line-through text-text-secondary" : "text-text-primary"}`}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">{task.description}</div>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            {getTaskIcon(task.type)}
            {task.type.replace(/_/g, " ")}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-muted-red font-medium" : "text-text-secondary"}`}>
              <Clock className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {task.quoteItem && (
            <span className="text-xs text-text-secondary">
              {task.quoteItem.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TaskList({ quoteId }: Props) {
  const { data: tasks, isLoading } = useTasks(quoteId);
  const updateTask = useUpdateTask();

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask.mutateAsync({ taskId: task.id, status: newStatus });
      toast.success(newStatus === "completed" ? "Tarea completada" : "Tarea reabierta");
    } catch {
      toast.error("Error al actualizar tarea");
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <div className="h-4 w-32 rounded bg-surface animate-pulse mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) return null;

  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="border-t border-border px-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">
          Tareas
        </h3>
        <span className="text-xs text-text-secondary">
          {completed.length}/{tasks.length} completadas
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-surface mb-3">
        <div
          className="h-full rounded-full bg-sage transition-all"
          style={{ width: `${tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0}%` }}
        />
      </div>
      <div className="space-y-0.5">
        {pending.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => handleToggle(task)}
            isPending={updateTask.isPending}
          />
        ))}
        {completed.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => handleToggle(task)}
            isPending={updateTask.isPending}
          />
        ))}
      </div>
    </div>
  );
}
