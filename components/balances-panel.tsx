"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { TOKEN } from "@/lib/token-config"
import { useBalances } from "@/lib/use-balances"

export function BalancesPanel() {
  const { connected } = useWallet()
  const { sol, token, isLoading } = useBalances()

  if (!connected) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Connect a wallet to view balances and send {TOKEN.symbol}.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat
        label={`${TOKEN.symbol} Balance`}
        value={isLoading ? "..." : token.toLocaleString()}
      />
      <Stat
        label="SOL Balance"
        value={isLoading ? "..." : sol.toFixed(4)}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-card-foreground">
        {value}
      </p>
    </div>
  )
}
