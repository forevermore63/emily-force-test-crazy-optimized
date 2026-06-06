"use client"

import useSWR from "swr"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { MINT } from "./token-config"

export function useBalances() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const key = publicKey ? ["balances", publicKey.toBase58()] : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!publicKey) return { sol: 0, token: 0 }

      const lamports = await connection.getBalance(publicKey)

      let token = 0
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: MINT },
        )
        if (accounts.value.length > 0) {
          token =
            accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount ?? 0
        }
      } catch {
        token = 0
      }

      return { sol: lamports / LAMPORTS_PER_SOL, token }
    },
    { refreshInterval: 15000 },
  )

  return {
    sol: data?.sol ?? 0,
    token: data?.token ?? 0,
    isLoading,
    error,
    refresh: mutate,
  }
}
