"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { avatarPhotoUrl } from "@/lib/avatar";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// Drop-in replacement for the app's initials-circle avatars: shows a real-face
// photo over the initials, falling back to the initials if the image fails or
// while it loads. When `src` is given (an uploaded profile photo) it wins;
// otherwise a deterministic per-`name` face is used, so the same person gets the
// same face in every component. Pass the existing avatar classes (size + tone
// bg + ring + text color) via `className`.
export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
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
          src={src || avatarPhotoUrl(name)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full rounded-full object-cover"
        />
      )}
    </span>
  );
}
