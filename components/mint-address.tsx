"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { TOKEN } from "@/lib/token-config"

export function MintAddress() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(TOKEN.mintAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50"
    >
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">Mint address</span>
        <span className="block truncate font-mono text-sm text-card-foreground">
          {TOKEN.mintAddress}
        </span>
      </span>
      {copied ? (
        <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="sr-only">Copy mint address</span>
    </button>
  )
}
