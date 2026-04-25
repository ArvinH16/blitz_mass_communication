import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm shadow-xs transition-all duration-200 outline-none focus-visible:ring-[3px] hover:border-input/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
