import { BN, IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { AlphaVault } from "./idl";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { WhitelistMode } from "./constant";

export interface GetOrCreateATAResponse {
  ataPubKey: PublicKey;
  ix?: TransactionInstruction;
}

export interface DepositWithProofParams {
  merkleRootConfig: PublicKey;
  maxCap: BN;
  proof: number[][];
}

export interface DepositInfo {
  // Total deposit amount
  totalDeposit: BN;
  // Total consumed deposit amount for bought token
  totalFilled: BN;
  // Total remaining deposit amount to be returned
  totalReturned: BN;
}

export interface WalletDepositCap {
  address: PublicKey;
  maxAmount: BN;
}

export interface VaultParam {
  quoteMint: PublicKey;
  baseMint: PublicKey;
  poolAddress: PublicKey;
  poolType: PoolType;
  vaultMode: VaultMode;
  config: PublicKey;
}

export interface CustomizableFcfsVaultParams {
  quoteMint: PublicKey;
  baseMint: PublicKey;
  poolAddress: PublicKey;
  poolType: PoolType;
  depositingPoint: BN;
  startVestingPoint: BN;
  endVestingPoint: BN;
  maxDepositingCap: BN;
  individualDepositingCap: BN;
  escrowFee: BN;
  whitelistMode: WhitelistMode;
}

export interface CustomizableProrataVaultParams {
  quoteMint: PublicKey;
  baseMint: PublicKey;
  poolAddress: PublicKey;
  poolType: PoolType;
  depositingPoint: BN;
  startVestingPoint: BN;
  endVestingPoint: BN;
  maxBuyingCap: BN;
  escrowFee: BN;
  whitelistMode: WhitelistMode;
}

export type AlphaVaultProgram = Program<AlphaVault>;

export type Vault = IdlAccounts<AlphaVault>["vault"];
export type Escrow = IdlAccounts<AlphaVault>["escrow"];
export type FCFSConfig = IdlAccounts<AlphaVault>["fcfsVaultConfig"];
export type ProrataConfig = IdlAccounts<AlphaVault>["prorataVaultConfig"];

export enum VaultMode {
  PRORATA,
  FCFS,
}

export enum PoolType {
  DLMM,
  DAMM,
  DAMMV2,
}

export enum ActivationType {
  SLOT,
  TIMESTAMP,
}
