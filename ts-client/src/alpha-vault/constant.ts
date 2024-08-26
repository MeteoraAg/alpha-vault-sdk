import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = Object.freeze({
  devnet: "vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2",
  "mainnet-beta": "vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2",
});

export const SEED = Object.freeze({
  escrow: "escrow",
  vault: "vault",
});

export const ALPHA_VAULT_TREASURY_ID = new PublicKey(
  "BJQbRiRWhJCyTYZcAuAL3ngDCx3AyFQGKDq8zhiZAKUw"
);

export const MERKLE_PROOF_API = Object.freeze({
  devnet: "https://worker-dev.meteora.ag/merkle-root-config-proof",
  "mainnet-beta": "https://worker.meteora.ag/merkle-root-config-proof",
});
