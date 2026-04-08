"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useInstructor, useDeleteInstructor } from "@/hooks/useInstructors";
import { toast } from "sonner";
import InstructorProfileCard from "./_components/InstructorProfileCard";
import InstructorAvailabilityEditor from "./_components/InstructorAvailabilityEditor";

export default function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useInstructor(id);
  const deleteMutation = useDeleteInstructor();
  const instructor = data?.instructor;

  const handleDelete = async () => {
    if (!confirm("Eliminar este profesor? Esta accion no se puede deshacer.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Profesor eliminado");
      router.push("/profesores");
    } catch {
      toast.error("Error al eliminar profesor");
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (!instructor) {
    return (
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
        <p className="text-lg font-medium text-[#2D2A26]">Profesor no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/profesores")}
          className="flex items-center gap-2 text-sm text-[#8A8580] hover:text-[#E87B5A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Profesores
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-[10px] border border-[#C75D4A]/30 px-3 py-2 text-xs font-medium text-[#C75D4A] hover:bg-[#C75D4A]/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>

      {/* Profile */}
      <InstructorProfileCard instructor={instructor} />

      {/* Availability */}
      <InstructorAvailabilityEditor instructor={instructor} />
    </div>
  );
}
