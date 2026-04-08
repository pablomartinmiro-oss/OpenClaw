"use client";

import { useSession } from "next-auth/react";

export function InstructorTopbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="flex h-12 items-center justify-between border-b border-[#E8E4DE] bg-white px-6">
      <p className="text-sm text-[#8A8580] capitalize">{today}</p>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E87B5A]/10 text-xs font-bold text-[#E87B5A]">
          {(user?.name ?? "P")[0]}
        </div>
        <span className="hidden text-sm font-medium text-[#2D2A26] md:block">
          {user?.name ?? "Profesor"}
        </span>
      </div>
    </header>
  );
}
