"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

// Canonical route to a user's in-app profile (authenticated view).
export function profileHref(userId?: string | null): string | null {
  return userId ? `/users/${userId}` : null;
}

// Wraps any content (a name, an avatar+name row, a card) in a link to the
// user's profile. Falls back to a plain <span> when the id is missing, so
// callers can pass an optional id without branching. Keeps the hover affordance
// subtle (underline on text) so it drops into existing lists cleanly.
export function ProfileLink({
  userId,
  className,
  children,
  title,
}: {
  userId?: string | null;
  className?: string;
  children: React.ReactNode;
  title?: string;
}) {
  const href = profileHref(userId);
  if (!href) return <span className={className}>{children}</span>;
  return (
    <Link
      href={href}
      title={title ?? "Lihat profil"}
      className={cn(
        "rounded-sm outline-none transition-colors hover:text-[#5f8c00] hover:underline focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children}
    </Link>
  );
}
