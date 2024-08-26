import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ALPHA_VAULT_TREASURY_ID,
  DLMM_PROGRAM_ID,
  DYNAMIC_AMM_PROGRAM_ID,
  SEED,
} from "../constant";
import {
  AlphaVaultProgram,
  GetOrCreateATAResponse,
  Vault,
  VaultMode,
} from "../type";
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import DynamicAmm from "@mercurial-finance/dynamic-amm-sdk";
import { Transaction } from "@solana/web3.js";
import DLMM from "@meteora-ag/dlmm";
import { BN } from "bn.js";

export function deriveEscrow(
  alphaVault: PublicKey,
  owner: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED.escrow), alphaVault.toBuffer(), owner.toBuffer()],
    programId
  );
}

export function deriveAlphaVault(
  base: PublicKey,
  lbPair: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED.vault), base.toBuffer(), lbPair.toBuffer()],
    programId
  );
}

export const getOrCreateATAInstruction = async (
  connection: Connection,
  tokenMint: PublicKey,
  owner: PublicKey,
  payer: PublicKey = owner,
  allowOwnerOffCurve = true
): Promise<GetOrCreateATAResponse> => {
  const toAccount = getAssociatedTokenAddressSync(
    tokenMint,
    owner,
    allowOwnerOffCurve
  );

  try {
    await getAccount(connection, toAccount);

    return { ataPubKey: toAccount, ix: undefined };
  } catch (e) {
    if (
      e instanceof TokenAccountNotFoundError ||
      e instanceof TokenInvalidAccountOwnerError
    ) {
      const ix = createAssociatedTokenAccountInstruction(
        payer,
        toAccount,
        owner,
        tokenMint
      );

      return { ataPubKey: toAccount, ix };
    } else {
      /* handle error */
      console.error("Error::getOrCreateATAInstruction", e);
      throw e;
    }
  }
};

export const wrapSOLInstruction = (
  from: PublicKey,
  to: PublicKey,
  amount: bigint
): TransactionInstruction[] => {
  return [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount,
    }),
    new TransactionInstruction({
      keys: [
        {
          pubkey: to,
          isSigner: false,
          isWritable: true,
        },
      ],
      data: Buffer.from(new Uint8Array([17])),
      programId: TOKEN_PROGRAM_ID,
    }),
  ];
};

export const unwrapSOLInstruction = (owner: PublicKey) => {
  const wSolATAAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    owner,
    true
  );
  if (wSolATAAccount) {
    const closedWrappedSolInstruction = createCloseAccountInstruction(
      wSolATAAccount,
      owner,
      owner
    );
    return closedWrappedSolInstruction;
  }
  return null;
};

export const fillDlmmTransaction = async (
  program: AlphaVaultProgram,
  vaultKey: PublicKey,
  vault: Vault,
  payer: PublicKey
) => {
  const connection = program.provider.connection;
  const pair = await DLMM.create(connection, vault.pool);

  const preInstructions: TransactionInstruction[] = [];
  const { ataPubKey: tokenOutVault, ix: createTokenOutVaultIx } =
    await getOrCreateATAInstruction(
      connection,
      vault.quoteMint,
      vaultKey,
      payer
    );
  createTokenOutVaultIx && preInstructions.push(createTokenOutVaultIx);

  const inAmountCap =
    vault.vaultMode == VaultMode.FCFS
      ? vault.totalDeposit
      : vault.totalDeposit.lt(vault.maxBuyingCap)
      ? vault.totalDeposit
      : vault.maxBuyingCap;

  const remainingInAmount = inAmountCap.sub(vault.swappedAmount);

  const swapForY = pair.lbPair.tokenXMint.equals(vault.quoteMint);
  const binArrays = await pair.getBinArrayForSwap(swapForY);

  const { consumedInAmount, binArraysPubkey } = pair.swapQuote(
    remainingInAmount,
    swapForY,
    new BN(0),
    binArrays,
    true
  );

  const [dlmmEventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    DLMM_PROGRAM_ID
  );

  const fillDlmmTransaction = await program.methods
    .fillDlmm(consumedInAmount)
    .accounts({
      vault: vaultKey,
      tokenVault: vault.tokenVault,
      tokenOutVault,
      ammProgram: DLMM_PROGRAM_ID,
      pool: vault.pool,
      binArrayBitmapExtension: pair.binArrayBitmapExtension
        ? pair.binArrayBitmapExtension.publicKey
        : null,
      reserveX: pair.lbPair.reserveX,
      reserveY: pair.lbPair.reserveY,
      tokenXMint: pair.lbPair.tokenXMint,
      tokenYMint: pair.lbPair.tokenYMint,
      oracle: pair.lbPair.oracle,
      tokenXProgram: TOKEN_PROGRAM_ID,
      tokenYProgram: TOKEN_PROGRAM_ID,
      dlmmEventAuthority,
    })
    .preInstructions(preInstructions)
    .remainingAccounts(
      binArraysPubkey.map((x) => ({
        pubkey: x,
        isSigner: false,
        isWritable: true,
      }))
    )
    .transaction();

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  return new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: payer,
  }).add(fillDlmmTransaction);
};

/**
 * Creates a transaction to fill a dynamic AMM.
 *
 * @param {AlphaVaultProgram} program - The Alpha Vault program instance.
 * @param {PublicKey} vaultKey - The public key of the vault.
 * @param {Vault} vault - The vault state.
 * @param {PublicKey} payer - The public key of the payer.
 * @return {Promise<Transaction>} A transaction to fill the dynamic AMM.
 */
export const fillDynamicAmmTransaction = async (
  program: AlphaVaultProgram,
  vaultKey: PublicKey,
  vault: Vault,
  payer: PublicKey
) => {
  const connection = program.provider.connection;
  const pool = await DynamicAmm.create(connection, vault.pool);

  const preInstructions: TransactionInstruction[] = [];
  const { ataPubKey: tokenOutVault, ix: createTokenOutVaultIx } =
    await getOrCreateATAInstruction(
      connection,
      vault.quoteMint,
      vaultKey,
      payer
    );
  createTokenOutVaultIx && preInstructions.push(createTokenOutVaultIx);

  const adminTokenFee = vault.quoteMint.equals(pool.poolState.tokenBMint)
    ? pool.poolState.protocolTokenBFee
    : pool.poolState.protocolTokenAFee;

  const fillAmmTransaction = await program.methods
    .fillDynamicAmm(vault.maxBuyingCap)
    .accounts({
      vault: vaultKey,
      tokenVault: vault.tokenVault,
      tokenOutVault,
      ammProgram: DYNAMIC_AMM_PROGRAM_ID,
      pool: vault.pool,
      aVault: pool.vaultA.vaultPda,
      bVault: pool.vaultB.vaultPda,
      aTokenVault: pool.vaultA.tokenVaultPda,
      bTokenVault: pool.vaultB.tokenVaultPda,
      aVaultLp: pool.poolState.aVaultLp,
      bVaultLp: pool.poolState.bVaultLp,
      aVaultLpMint: pool.vaultA.tokenLpMint.address,
      bVaultLpMint: pool.vaultB.tokenLpMint.address,
      adminTokenFee,
      vaultProgram: ALPHA_VAULT_TREASURY_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions(preInstructions)
    .transaction();

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  return new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: payer,
  }).add(fillAmmTransaction);
};
