"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let lastKey = "";
    let lastTime = 0;

    function onKeyDown(e: KeyboardEvent) {
      // Skip if typing in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
      // Skip if modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const now = Date.now();
      const key = e.key.toLowerCase();

      // Two-key shortcuts (g + letter)
      if (lastKey === "g" && now - lastTime < 800) {
        switch (key) {
          case "h": router.push("/"); break;
          case "c": router.push("/contacts"); break;
          case "p": router.push("/pipeline"); break;
          case "m": router.push("/comms"); break;
          case "r": router.push("/reservas"); break;
          case "q": router.push("/presupuestos"); break;
          case "k": router.push("/catalogo"); break;
          case "s": router.push("/settings"); break;
        }
        lastKey = "";
        return;
      }

      lastKey = key;
      lastTime = now;
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);
}
