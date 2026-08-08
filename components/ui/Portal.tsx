"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

/**
 * Renders children directly into `document.body`, escaping any ancestor's
 * `transform` (framer-motion's animated wrappers apply one) — a `transform`
 * on an ancestor creates a new containing block, which silently breaks
 * `position: fixed` on descendants. Anything meant to stay pinned to the
 * viewport regardless of which animated screen is mounted belongs in here.
 */
export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
