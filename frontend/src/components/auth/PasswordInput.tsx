"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

// Password input with a show/hide toggle (docs/08 Password Input component).
export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className="pr-10" {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {/* Icon shows the STATE: open eye = visible, crossed eye = hidden. */}
          {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      </div>
    );
  }
);
