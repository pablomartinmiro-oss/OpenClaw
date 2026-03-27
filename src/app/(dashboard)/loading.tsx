import { LayoutDashboard } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <LayoutDashboard className="h-8 w-8 animate-pulse" />
        <p className="text-sm">Cargando dashboard...</p>
      </div>
    </div>
  );
}
