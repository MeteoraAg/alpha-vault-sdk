import { BN, IdlAccounts, Program } from "@coral-xyz/anchor";
import { AlphaVault } from "./idl";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export interface GetOrCreateATAResponse {
  ataPubKey: PublicKey;
  ix?: TransactionInstruction;
}

export interface DepositInfo {
  // Total deposit amount
  totalDeposit: BN;
  // Total consumed deposit amount for bought token
  totalFilled: BN;
  // Total remaining deposit amount to be returned
  totalReturned: BN;
}

export interface VaultParam {
  quoteMint: PublicKey;
  baseMint: PublicKey;
  poolAddress: PublicKey;
  poolType: PoolType;
  vaultMode: VaultMode;
  config: PublicKey;
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
  DYNAMIC,
}
