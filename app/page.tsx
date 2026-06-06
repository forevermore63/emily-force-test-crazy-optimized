import { ArrowUpRight } from "lucide-react"
import { SolanaProvider } from "@/components/solana-provider"
import { WalletButton } from "@/components/wallet-button"
import { BalancesPanel } from "@/components/balances-panel"
import { TransferCard } from "@/components/transfer-card"
import { HistoryPanel } from "@/components/history-panel"
import { MintAddress } from "@/components/mint-address"
import { TOKEN, links } from "@/lib/token-config"

export default function Page() {
  return (
    <SolanaProvider>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-5 py-12 md:py-16">
        <header className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {TOKEN.name}
              </h1>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">
                {TOKEN.tagline}
              </p>
            </div>
            <WalletButton />
          </div>

          <MintAddress />

          <div className="flex flex-wrap gap-3">
            <LinkButton href={links.jupiter} label="Buy on Jupiter" primary />
            <LinkButton href={links.birdeye} label="Chart on Birdeye" />
            <LinkButton href={links.solscan} label="Solscan" />
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <BalancesPanel />
          <TransferCard />
          <HistoryPanel />
        </section>

        <footer className="mt-auto border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          This interface lets you connect a Solana wallet and transfer{" "}
          {TOKEN.symbol} tokens. It is not financial advice and makes no promise
          of value or returns. Always verify the mint address before
          transacting.
        </footer>
      </main>
    </SolanaProvider>
  )
}

function LinkButton({
  href,
  label,
  primary = false,
}: {
  href: string
  label: string
  primary?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          : "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-primary/50"
      }
    >
      {label}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  )
}
