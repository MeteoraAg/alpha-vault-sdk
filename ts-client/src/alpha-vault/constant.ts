import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = Object.freeze({
  devnet: "vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2",
  "mainnet-beta": "vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2",
  localhost: "SNPmGgnywBvvrAKMLundzG6StojyHTHDLu7T4sdhP4k",
});

export const SEED = Object.freeze({
  escrow: "escrow",
  vault: "vault",
  merkleRoot: "merkle_root",
  crankFeeWhitelist: "crank_fee_whitelist",
  merkleProofMetadata: "merkle_proof_metadata",
});

export const ALPHA_VAULT_TREASURY_ID = new PublicKey(
  "BJQbRiRWhJCyTYZcAuAL3ngDCx3AyFQGKDq8zhiZAKUw"
);

export const VAULT_PROGRAM_ID = new PublicKey(
  "24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi"
);

export const DYNAMIC_AMM_PROGRAM_ID = new PublicKey(
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB"
);

export const DLMM_PROGRAM_ID = new PublicKey(
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
);

export const MERKLE_PROOF_API = Object.freeze({
  devnet: "https://worker-dev.meteora.ag/merkle-root-config-proof",
  "mainnet-beta": "https://worker.meteora.ag/merkle-root-config-proof",
});

export enum WhitelistMode {
  Permissionless,
  PermissionWithMerkleProof,
  PermissionWithAuthority,
}

export enum VaultState {
  PREPARING,
  DEPOSITING,
  PURCHASING,
  LOCKING,
  VESTING,
  ENDED,
}

// firstJoinPoint: the first point user can deposit
// lastJoinPoint: the last point user can deposit
// lastBuyingPoint: the last point vault can buy from the pool
// startVestingPoint: the first point user can claim token
// endVestingPoint: the point that vesting is ended
export interface VaultPoint {
  firstJoinPoint: number;
  lastJoinPoint: number;
  lastBuyingPoint: number;
  startVestingPoint: number;
  endVestingPoint: number;
}
