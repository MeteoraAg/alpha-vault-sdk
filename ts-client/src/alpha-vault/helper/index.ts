import {
  Cluster,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ALPHA_VAULT_TREASURY_ID,
  DLMM_PROGRAM_ID,
  DYNAMIC_AMM_PROGRAM_ID,
  PROGRAM_ID,
  SEED,
  VAULT_PROGRAM_ID,
} from "../constant";
import {
  AlphaVaultProgram,
  GetOrCreateATAResponse,
  Vault,
  VaultMode,
} from "../type";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import DynamicAmm, { Amm, AmmIdl } from "@meteora-ag/dynamic-amm-sdk";
import { Transaction } from "@solana/web3.js";
import DLMM, {
  DlmmSdkError,
  LBCLMM_PROGRAM_IDS,
  RemainingAccountInfo,
  SwapQuote,
  IDL as DLMMIdl,
  LbClmm,
} from "@meteora-ag/dlmm";
import BN from "bn.js";
import IDL from "../alpha_vault.json";
import { AlphaVault } from "../idl";
import { Opt } from "..";
import {
  AnchorProvider as OldAnchorProvider,
  Program as OldProgram,
} from "@cora-xyz/anchor-0.28.0";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import CpAmmIDL, {
  CpAmm,
  CpAmmTypes,
  CP_AMM_PROGRAM_ID,
} from "@meteora-ag/cp-amm-sdk";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export function createProgram(connection: Connection, opt?: Opt) {
  const provider = new AnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );

  return new Program<AlphaVault>(
    { ...IDL, address: PROGRAM_ID[opt?.cluster || "mainnet-beta"] },
    provider
  );
}

export function createDlmmProgram(connection: Connection, opt?: Opt) {
  const provider = new OldAnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );

  return new OldProgram(
    DLMMIdl,
    LBCLMM_PROGRAM_IDS[opt?.cluster || "mainnet-beta"],
    provider
  );
}

export function createDammProgram(connection: Connection, opt?: Opt) {
  const provider = new OldAnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );

  // @ts-ignore
  return new OldProgram(AmmIdl, DYNAMIC_AMM_PROGRAM_ID, provider);
}

export function createCpAmmProgram(connection: Connection, opt?: Opt) {
  const provider = new AnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );
  return new Program<CpAmmTypes>(
    { ...CpAmmIDL, address: CP_AMM_PROGRAM_ID },
    provider
  );
}

export function deriveCrankFeeWhitelist(
  cranker: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED.crankFeeWhitelist), cranker.toBuffer()],
    programId
  );
}

export function deriveMerkleRootConfig(
  alphaVault: PublicKey,
  version: BN,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEED.merkleRoot),
      alphaVault.toBuffer(),
      new Uint8Array(version.toArrayLike(Buffer, "le", 8)),
    ],
    programId
  );
}

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
  tokenProgram: PublicKey,
  allowOwnerOffCurve = true
): Promise<GetOrCreateATAResponse> => {
  const toAccount = getAssociatedTokenAddressSync(
    tokenMint,
    owner,
    allowOwnerOffCurve,
    tokenProgram
  );

  try {
    await getAccount(connection, toAccount);

    return { ataPubKey: toAccount, ix: undefined };
  } catch (e) {
    if (
      e instanceof TokenAccountNotFoundError ||
      e instanceof TokenInvalidAccountOwnerError
    ) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        payer,
        toAccount,
        owner,
        tokenMint,
        tokenProgram
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

export const fillDammV2Transaction = async (
  program: AlphaVaultProgram,
  vaultKey: PublicKey,
  vault: Vault,
  payer: PublicKey
) => {
  const connection = program.provider.connection;
  const cpAmm = new CpAmm(connection);

  const pool = await cpAmm._program.account.pool.fetch(vault.pool);

  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_authority")],
    cpAmm._program.programId
  );

  const [dammEventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    cpAmm._program.programId
  );

  const [crankFeeWhitelist] = deriveCrankFeeWhitelist(payer, program.programId);
  const crankFeeWhitelistAccount = await connection.getAccountInfo(
    crankFeeWhitelist
  );

  const preInstructions: TransactionInstruction[] = [];
  const { ataPubKey: tokenOutVault, ix: createTokenOutVaultIx } =
    await getOrCreateATAInstruction(
      connection,
      vault.baseMint,
      vaultKey,
      payer,
      pool.tokenAFlag == 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
    );
  createTokenOutVaultIx && preInstructions.push(createTokenOutVaultIx);

  const fillDammInstruction = await program.methods
    .fillDammV2(vault.maxBuyingCap)
    .accountsPartial({
      vault: vaultKey,
      tokenVault: vault.tokenVault,
      tokenOutVault,
      ammProgram: cpAmm._program.programId,
      pool: vault.pool,
      poolAuthority,
      tokenAMint: pool.tokenAMint,
      tokenBMint: pool.tokenBMint,
      tokenAVault: pool.tokenAVault,
      tokenBVault: pool.tokenBVault,
      tokenAProgram:
        pool.tokenAFlag == 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID,
      tokenBProgram:
        pool.tokenBFlag == 0 ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID,
      cranker: payer,
      crankFeeReceiver: crankFeeWhitelistAccount
        ? program.programId
        : ALPHA_VAULT_TREASURY_ID,
      crankFeeWhitelist: crankFeeWhitelistAccount
        ? crankFeeWhitelist
        : program.programId,
      dammEventAuthority,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const { lastValidBlockHeight, blockhash } =
    await connection.getLatestBlockhash("confirmed");

  new Transaction({
    lastValidBlockHeight,
    blockhash,
  }).add(...preInstructions, fillDammInstruction);
};

export const fillDlmmTransaction = async (
  program: AlphaVaultProgram,
  vaultKey: PublicKey,
  vault: Vault,
  payer: PublicKey,
  opt?: { cluster: string }
) => {
  const connection = program.provider.connection;
  const cluster = (opt?.cluster ?? "mainnet-beta") as Cluster;
  const pair = await DLMM.create(connection, vault.pool, {
    cluster,
  });

  const [crankFeeWhitelist] = deriveCrankFeeWhitelist(payer, program.programId);
  const crankFeeWhitelistAccount = await connection.getAccountInfo(
    crankFeeWhitelist
  );

  // TODO: Estimate CU
  const preInstructions: TransactionInstruction[] = [
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    }),
  ];
  const { ataPubKey: tokenOutVault, ix: createTokenOutVaultIx } =
    await getOrCreateATAInstruction(
      connection,
      vault.baseMint,
      vaultKey,
      payer,
      pair.tokenX.owner
    );
  createTokenOutVaultIx && preInstructions.push(createTokenOutVaultIx);

  const inAmountCap =
    vault.vaultMode == VaultMode.FCFS
      ? vault.totalDeposit
      : vault.totalDeposit.lt(vault.maxBuyingCap)
      ? vault.totalDeposit
      : vault.maxBuyingCap;

  const remainingInAmount = inAmountCap.sub(vault.swappedAmount);

  if (remainingInAmount.lte(new BN(0))) return;

  const swapForY = pair.lbPair.tokenXMint.equals(vault.quoteMint);

  const binArrays = await pair.getBinArrayForSwap(swapForY, 3);

  let quoteResult: SwapQuote;
  try {
    quoteResult = pair.swapQuote(
      remainingInAmount,
      swapForY,
      new BN(0),
      binArrays,
      true
    );
  } catch (error) {
    if (error instanceof DlmmSdkError) {
      if (error.name == "SWAP_QUOTE_INSUFFICIENT_LIQUIDITY") {
        // With isPartialFill, insufficient liquidity happen only when there is not enough liquidity in the pool
        // Vault bought up full distribution curve
        return null;
      }
    }
    throw error;
  }

  const { consumedInAmount, binArraysPubkey } = quoteResult;

  const dlmmProgramId = new PublicKey(LBCLMM_PROGRAM_IDS[cluster]);
  const [dlmmEventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    dlmmProgramId
  );

  const tokenXProgram = pair.tokenX.owner;
  const tokenYProgram = pair.tokenY.owner;

  const remainingAccountInfos: RemainingAccountInfo = {
    slices: [
      {
        accountsType: {
          transferHookX: {},
        },
        length: pair.tokenX.transferHookAccountMetas.length,
      },
      {
        accountsType: {
          transferHookY: {},
        },
        length: pair.tokenY.transferHookAccountMetas.length,
      },
    ],
  };

  const binArrayAccounts = binArraysPubkey.map((x) => ({
    pubkey: x,
    isSigner: false,
    isWritable: true,
  }));

  const transferHookAccounts = [
    ...pair.tokenX.transferHookAccountMetas,
    ...pair.tokenY.transferHookAccountMetas,
  ];

  const remainingAccounts = [...transferHookAccounts, ...binArrayAccounts];

  const fillDlmmTransaction = await program.methods
    .fillDlmm(consumedInAmount, remainingAccountInfos)
    .accountsPartial({
      vault: vaultKey,
      tokenVault: vault.tokenVault,
      tokenOutVault,
      ammProgram: dlmmProgramId,
      pool: vault.pool,
      binArrayBitmapExtension: pair.binArrayBitmapExtension
        ? pair.binArrayBitmapExtension.publicKey
        : pair.program.programId,
      reserveX: pair.lbPair.reserveX,
      reserveY: pair.lbPair.reserveY,
      tokenXMint: pair.lbPair.tokenXMint,
      tokenYMint: pair.lbPair.tokenYMint,
      oracle: pair.lbPair.oracle,
      tokenXProgram,
      tokenYProgram,
      dlmmEventAuthority,
      cranker: payer,
      crankFeeReceiver: crankFeeWhitelistAccount
        ? program.programId
        : ALPHA_VAULT_TREASURY_ID,
      crankFeeWhitelist: crankFeeWhitelistAccount
        ? crankFeeWhitelist
        : program.programId,
      systemProgram: SystemProgram.programId,
      memoProgram: MEMO_PROGRAM_ID,
    })
    .preInstructions(preInstructions)
    .remainingAccounts(remainingAccounts)
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
export const fillDammTransaction = async (
  program: AlphaVaultProgram,
  vaultKey: PublicKey,
  vault: Vault,
  payer: PublicKey,
  opt?: { cluster: string }
) => {
  if (vault.vaultMode === VaultMode.PRORATA) {
    if (vault.swappedAmount.eq(BN.min(vault.totalDeposit, vault.maxBuyingCap)))
      return;
  } else {
    if (vault.swappedAmount.eq(vault.totalDeposit)) return;
  }

  const connection = program.provider.connection;
  const pool = await DynamicAmm.create(connection, vault.pool, {
    cluster: (opt?.cluster ?? "mainnet-beta") as Cluster,
  });

  const [crankFeeWhitelist] = deriveCrankFeeWhitelist(payer, program.programId);
  const crankFeeWhitelistAccount = await connection.getAccountInfo(
    crankFeeWhitelist
  );

  const preInstructions: TransactionInstruction[] = [];
  const { ataPubKey: tokenOutVault, ix: createTokenOutVaultIx } =
    await getOrCreateATAInstruction(
      connection,
      vault.baseMint,
      vaultKey,
      payer,
      TOKEN_PROGRAM_ID
    );
  createTokenOutVaultIx && preInstructions.push(createTokenOutVaultIx);

  const adminTokenFee = vault.quoteMint.equals(pool.poolState.tokenBMint)
    ? pool.poolState.protocolTokenBFee
    : pool.poolState.protocolTokenAFee;

  const fillAmmTransaction = await program.methods
    .fillDynamicAmm(vault.totalDeposit)
    .accountsPartial({
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
      vaultProgram: VAULT_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      cranker: payer,
      crankFeeReceiver: crankFeeWhitelistAccount
        ? program.programId
        : ALPHA_VAULT_TREASURY_ID,
      crankFeeWhitelist: crankFeeWhitelistAccount
        ? crankFeeWhitelist
        : program.programId,
      systemProgram: SystemProgram.programId,
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

export const estimateSlotDate = (
  enableSlot: number,
  slotAverageTime: number,
  currentSlot: number
) => {
  const estimateDate = new Date(
    Date.now() + (enableSlot - currentSlot) * slotAverageTime
  );

  return estimateDate;
};
