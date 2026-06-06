"use client"

import dynamic from "next/dynamic"

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false, loading: () => <div className="h-10 w-36" /> },
)

// Render only on the client to avoid hydration mismatches, and override the
// adapter's default purple with the app's theme colors via inline styles.
export function WalletButton() {
  return (
    <WalletMultiButton
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        height: "auto",
        lineHeight: 1.2,
        padding: "0.5rem 1rem",
        borderRadius: "var(--radius-md)",
      }}
    />
  )
}
