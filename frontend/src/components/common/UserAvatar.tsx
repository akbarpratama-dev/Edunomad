"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { avatarPhotoUrl } from "@/lib/avatar";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// Drop-in replacement for the app's initials-circle avatars: shows a real-face
// photo (deterministic per user `name`, so the same person gets the same face
// in every component) over the initials, falling back to the initials if the
// image fails or while it loads. Pass the existing avatar classes (size + tone
// bg + ring + text color) via `className`.
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn("relative inline-grid place-items-center overflow-hidden rounded-full", className)}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarPhotoUrl(name)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full rounded-full object-cover"
        />
      )}
    </span>
  );
}
