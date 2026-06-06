"use client"

import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { MINT, TOKEN, txUrl } from "@/lib/token-config"
import { useBalances } from "@/lib/use-balances"
import { HISTORY_KEY } from "@/lib/use-history"

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; signature: string }
  | { kind: "error"; message: string }

// Convert a human-readable decimal string to base units (BigInt) without float drift.
function toBaseUnits(amount: string, decimals: number): bigint {
  const [whole, fraction = ""] = amount.trim().split(".")
  const cleanFraction = fraction.slice(0, decimals)
  const padded = cleanFraction.padEnd(decimals, "0")
  return BigInt(`${whole || "0"}${padded}`)
}

export function TransferCard() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { token: tokenBalance, sol: solBalance, refresh } = useBalances()
  const { mutate } = useSWRConfig()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const disabled = status.kind === "working"
  const parsedAmount = Number(amount)
  const exceedsBalance = parsedAmount > tokenBalance
  const noSolForFees = !!publicKey && solBalance <= 0
  const invalidAmount = amount !== "" && (!parsedAmount || parsedAmount <= 0)

  async function handleSend() {
    if (!publicKey) {
      setStatus({ kind: "error", message: "Connect your wallet first." })
      return
    }

    let recipientKey: PublicKey
    try {
      recipientKey = new PublicKey(recipient.trim())
    } catch {
      setStatus({ kind: "error", message: "Invalid recipient address." })
      return
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setStatus({ kind: "error", message: "Enter an amount greater than 0." })
      return
    }

    if (parsedAmount > tokenBalance) {
      setStatus({
        kind: "error",
        message: `Amount exceeds your balance of ${tokenBalance.toLocaleString()} ${TOKEN.symbol}.`,
      })
      return
    }

    if (solBalance <= 0) {
      setStatus({
        kind: "error",
        message: "You need some SOL to cover network fees.",
      })
      return
    }

    try {
      setStatus({ kind: "working", message: "Reading mint info..." })
      const mintInfo = await getMint(connection, MINT)
      const baseUnits = toBaseUnits(amount, mintInfo.decimals)

      const fromAta = await getAssociatedTokenAddress(MINT, publicKey)
      const toAta = await getAssociatedTokenAddress(MINT, recipientKey)

      const tx = new Transaction()

      // Create the recipient's token account if it doesn't exist yet.
      setStatus({ kind: "working", message: "Checking recipient account..." })
      try {
        await getAccount(connection, toAta)
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            toAta,
            recipientKey, // owner
            MINT,
          ),
        )
      }

      tx.add(
        createTransferInstruction(
          fromAta,
          toAta,
          publicKey,
          baseUnits,
          [],
          TOKEN_PROGRAM_ID,
        ),
      )

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = publicKey

      setStatus({ kind: "working", message: "Approve in your wallet..." })
      const signature = await sendTransaction(tx, connection)

      setStatus({ kind: "working", message: "Confirming transaction..." })
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      )

      setStatus({ kind: "success", signature })
      setAmount("")
      refresh()
      if (publicKey) {
        mutate([HISTORY_KEY, publicKey.toBase58()])
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Transaction failed."
      setStatus({ kind: "error", message })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">
          Send {TOKEN.symbol}
        </h2>
        <span className="text-sm text-muted-foreground">
          Balance: {tokenBalance.toLocaleString()} {TOKEN.symbol}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Recipient wallet</span>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Solana address"
            spellCheck={false}
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Amount</span>
          <div className="flex items-center gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              inputMode="decimal"
              aria-invalid={exceedsBalance || invalidAmount}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAmount(String(tokenBalance))}
              disabled={disabled || tokenBalance <= 0}
            >
              Max
            </Button>
          </div>
          {exceedsBalance && (
            <span className="text-xs text-destructive">
              Exceeds your balance of {tokenBalance.toLocaleString()}{" "}
              {TOKEN.symbol}.
            </span>
          )}
          {noSolForFees && !exceedsBalance && (
            <span className="text-xs text-destructive">
              You need some SOL to cover network fees.
            </span>
          )}
        </label>

        <Button
          onClick={handleSend}
          disabled={
            disabled ||
            !publicKey ||
            invalidAmount ||
            exceedsBalance ||
            noSolForFees ||
            amount === ""
          }
        >
          {status.kind === "working" ? status.message : `Send ${TOKEN.symbol}`}
        </Button>

        {status.kind === "error" && (
          <p className="text-sm text-destructive">{status.message}</p>
        )}
        {status.kind === "success" && (
          <p className="text-sm text-primary">
            Sent.{" "}
            <a
              href={txUrl(status.signature)}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              View on Solscan
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
