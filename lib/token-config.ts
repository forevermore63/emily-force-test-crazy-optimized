import { PublicKey } from "@solana/web3.js"

export const TOKEN = {
  name: "Sausage Slots",
  symbol: "SAUSAGE",
  // Mint address from the provided source.
  mintAddress: "GNVUCR9Q7bAJriqb1UgC7wh4MD5KCmatBHgTkMK1jupx",
  tagline: "Noosa Dachshunds × Sausage Therapy",
}

export const MINT = new PublicKey(TOKEN.mintAddress)

export const links = {
  jupiter: `https://jup.ag/swap?in=SOL&out=${TOKEN.mintAddress}`,
  birdeye: `https://birdeye.so/token/${TOKEN.mintAddress}?chain=solana`,
  solscan: `https://solscan.io/token/${TOKEN.mintAddress}`,
}

export function txUrl(signature: string) {
  return `https://solscan.io/tx/${signature}`
}
