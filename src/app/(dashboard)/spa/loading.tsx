import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#8A8580]">
        <Sparkles className="h-8 w-8 animate-pulse text-[#E87B5A]" />
        <p className="text-sm">Cargando spa...</p>
      </div>
    </div>
  );
}
