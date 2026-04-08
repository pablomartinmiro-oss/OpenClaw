"use client";

export default function AlquilerError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-[#8A8580] text-sm">
        Error al cargar el modulo de alquiler
      </p>
      <p className="text-xs text-[#C75D4A]">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-[#E87B5A] rounded-[10px] hover:bg-[#D56E4F] transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
