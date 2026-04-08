"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMyInstructorProfile } from "@/hooks/useInstructors";

/**
 * Redirects instructor users to /profesores/mi-portal if they land on admin pages.
 * Owner/Manager users are never redirected (they can access everything).
 */
export function InstructorRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: meData } = useMyInstructorProfile();

  const roleName = session?.user?.roleName ?? "";
  const isManager =
    roleName.toLowerCase().startsWith("owner") ||
    roleName.toLowerCase().includes("manager");
  const isInstructor = meData?.isInstructor === true && !isManager;

  useEffect(() => {
    if (!isInstructor) return;

    // Allowed paths for instructors
    const allowed = ["/profesores/mi-portal", "/profesores/fichaje", "/profesores/mi-perfil"];
    const isAllowed = allowed.some((p) => pathname.startsWith(p));

    if (!isAllowed) {
      router.replace("/profesores/mi-portal");
    }
  }, [isInstructor, pathname, router]);

  return null;
}
