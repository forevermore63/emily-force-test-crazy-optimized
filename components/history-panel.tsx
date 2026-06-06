"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react"
import { useHistory } from "@/lib/use-history"
import { txUrl } from "@/lib/token-config"

function timeAgo(blockTime: number | null) {
  if (!blockTime) return "pending"
  const seconds = Math.floor(Date.now() / 1000 - blockTime)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function HistoryPanel() {
  const { publicKey } = useWallet()
  const { items, isLoading } = useHistory()

  if (!publicKey) return null

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">
        Recent activity
      </h2>

      {isLoading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading transactions...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.signature}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                {item.err ? (
                  <XCircle
                    className="size-4 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                )}
                <span className="truncate font-mono text-sm text-foreground">
                  {item.signature.slice(0, 8)}…{item.signature.slice(-8)}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {timeAgo(item.blockTime)}
                </span>
                <a
                  href={txUrl(item.signature)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-muted-foreground transition-colors hover:text-primary"
                  aria-label="View transaction on Solscan"
                >
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
