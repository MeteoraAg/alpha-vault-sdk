import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import fs from "fs";
import * as Token from "@solana/spl-token";
import { struct, u64, i64 } from "@coral-xyz/borsh";
import BN from "bn.js";

export const DYNAMIC_AMM_PROGRAM_ID = new PublicKey(
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB"
);

export const ALPHA_VAULT_PROGRAM_ID = new PublicKey(
  "vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2"
);

export interface Clock {
  slot: BN;
  epochStartTimestamp: BN;
  epoch: BN;
  leaderScheduleEpoch: BN;
  unixTimestamp: BN;
}

export const ClockLayout = struct([
  u64("slot"),
  i64("epochStartTimestamp"),
  u64("epoch"),
  u64("leaderScheduleEpoch"),
  i64("unixTimestamp"),
]);

export enum ActivationType {
  Slot,
  Timestamp,
}

export function loadKeypairFromFile(filePath: string): Keypair {
  const keypairFile = JSON.parse(fs.readFileSync(filePath).toString());
  const keypair = Uint8Array.from(keypairFile as number[]);
  return Keypair.fromSecretKey(keypair);
}

export async function createTokenAndMint(
  connection: Connection,
  payer: Keypair,
  decimals: number,
  supply: number
) {
  const lamports = await Token.getMinimumBalanceForRentExemptMint(connection);
  const mintKeypair = Keypair.generate();
  const programId = Token.TOKEN_PROGRAM_ID;

  const minterATA = Token.getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    payer.publicKey
  );

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: Token.MINT_SIZE,
      lamports,
      programId,
    }),
    Token.createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      payer.publicKey,
      null,
      programId
    ),
    Token.createAssociatedTokenAccountInstruction(
      payer.publicKey,
      minterATA,
      payer.publicKey,
      mintKeypair.publicKey,
      Token.TOKEN_PROGRAM_ID,
      Token.ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    Token.createMintToInstruction(
      mintKeypair.publicKey,
      minterATA,
      payer.publicKey,
      supply,
      [],
      Token.TOKEN_PROGRAM_ID
    )
  );

  transaction.recentBlockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  const txHash = await connection.sendTransaction(transaction, [
    payer,
    mintKeypair,
  ]);
  await connection.confirmTransaction(txHash, "finalized");

  return {
    mint: mintKeypair.publicKey,
    ata: minterATA,
  };
}
