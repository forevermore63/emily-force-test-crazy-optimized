"use client"

import useSWR from "swr"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"

export type HistoryItem = {
  signature: string
  blockTime: number | null
  err: boolean
}

export const HISTORY_KEY = "history"

export function useHistory() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const key = publicKey ? [HISTORY_KEY, publicKey.toBase58()] : null

  const { data, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!publicKey) return [] as HistoryItem[]

      const sigs = await connection.getSignaturesForAddress(publicKey, {
        limit: 8,
      })

      return sigs.map((s) => ({
        signature: s.signature,
        blockTime: s.blockTime ?? null,
        err: s.err !== null,
      }))
    },
    { refreshInterval: 20000 },
  )

  return {
    items: data ?? [],
    isLoading,
    refresh: mutate,
  }
}
