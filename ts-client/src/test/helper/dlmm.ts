import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  AlphaVault,
  PoolType,
  VaultMode,
  WhitelistMode,
} from "../../alpha-vault";
import BN from "bn.js";
import DLMM, {
  ActivationType,
  deriveCustomizablePermissionlessLbPair,
  deriveLbPair2,
  IDL,
  LBCLMM_PROGRAM_IDS,
} from "@meteora-ag/dlmm";
import { getMint } from "@solana/spl-token";
import { BASE_TOKEN_DECIMAL, getAmountInLamports, MINT_AMOUNT } from ".";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

export const SEEDING_CONFIG = Object.freeze({
  currentPrice: 0.000001,
  minPrice: 0.000001,
  maxPrice: 0.00003,
  curvature: 0.6,
  seedAmount: getAmountInLamports(MINT_AMOUNT, BASE_TOKEN_DECIMAL),
});

interface DLMMPoolConfig {
  pool: {
    quoteMint: PublicKey;
    baseMint: PublicKey;
    binStep: number;
    feeBps: number;
    activationType: ActivationType;
    activationPoint: BN;
    initialPrice: number;
  };
  vault: {
    vaultMode: VaultMode;
    whiteListMode: WhitelistMode;
    depositingPoint: BN;
    startVestingPoint: BN;
    endVestingPoint: BN;
    maxDepositingCap: number;
    maxBuyingCap: number;
    individualDepositingCap: number;
  };
  opt: {
    cluster: "localhost";
  };
}

export const createDlmmProgram = (connection: Connection) => {
  const provider = new AnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(
    { ...IDL, address: LBCLMM_PROGRAM_IDS["localhost"] },
    provider
  );

  return program;
};

export const createDLMMPoolWithAlphaVault = async (
  connection: Connection,
  wallet: Keypair,
  config: DLMMPoolConfig
) => {
  const initPrice = DLMM.getPricePerLamport(
    BASE_TOKEN_DECIMAL,
    9,
    config.pool.initialPrice
  );

  const activateBinId = DLMM.getBinIdFromPrice(
    initPrice,
    config.pool.binStep,
    false
  );

  const createPoolTx = await DLMM.createCustomizablePermissionlessLbPair(
    connection,
    new BN(config.pool.binStep),
    config.pool.baseMint,
    config.pool.quoteMint,
    new BN(activateBinId),
    new BN(config.pool.feeBps),
    config.pool.activationType,
    true,
    wallet.publicKey,
    config.pool.activationPoint,
    false,
    {
      cluster: config.opt.cluster,
    }
  );

  const createPoolTxHash = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [wallet]
  );

  const [poolAddress] = deriveCustomizablePermissionlessLbPair(
    config.pool.baseMint,
    config.pool.quoteMint,
    new PublicKey(LBCLMM_PROGRAM_IDS[config.opt.cluster])
  );

  if (config.vault.vaultMode === VaultMode.FCFS) {
    const maxDepositingCap = getAmountInLamports(
      config.vault.maxDepositingCap,
      9
    );
    const individualDepositingCap = getAmountInLamports(
      config.vault.individualDepositingCap,
      9
    );
    const createVaultTx = await AlphaVault.createCustomizableFcfsVault(
      connection,
      {
        baseMint: config.pool.baseMint,
        quoteMint: config.pool.quoteMint,
        poolAddress,
        poolType: PoolType.DLMM,
        depositingPoint: config.vault.depositingPoint,
        startVestingPoint: config.vault.startVestingPoint,
        endVestingPoint: config.vault.endVestingPoint,
        maxDepositingCap,
        individualDepositingCap,
        escrowFee: new BN(0),
        whitelistMode: config.vault.whiteListMode,
      },
      wallet.publicKey,
      {
        cluster: config.opt.cluster,
      }
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet]
    );
    console.log("🚀 ~ createVaultTxHash:", createVaultTxHash);
  } else if (config.vault.vaultMode === VaultMode.PRORATA) {
    const maxBuyingCap = getAmountInLamports(config.vault.maxBuyingCap, 9);
    const createVaultTx = await AlphaVault.createCustomizableProrataVault(
      connection,
      {
        baseMint: config.pool.baseMint,
        quoteMint: config.pool.quoteMint,
        poolAddress,
        poolType: PoolType.DLMM,
        depositingPoint: config.vault.depositingPoint,
        startVestingPoint: config.vault.startVestingPoint,
        endVestingPoint: config.vault.endVestingPoint,
        maxBuyingCap,
        escrowFee: new BN(0),
        whitelistMode: config.vault.whiteListMode,
      },
      wallet.publicKey,
      {
        cluster: config.opt.cluster,
      }
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet]
    );
    console.log("🚀 ~ createVaultTxHash:", createVaultTxHash);
  } else {
    throw new Error("Invalid vault mode");
  }

  return poolAddress;
};

export const seedLiquidity = async (dlmm: DLMM, keypair: Keypair) => {
  const {
    sendPositionOwnerTokenProveIxs,
    initializeBinArraysAndPositionIxs,
    addLiquidityIxs,
  } = await dlmm.seedLiquidity(
    keypair.publicKey,
    SEEDING_CONFIG.seedAmount,
    SEEDING_CONFIG.curvature,
    SEEDING_CONFIG.minPrice,
    SEEDING_CONFIG.maxPrice,
    keypair.publicKey,
    keypair.publicKey,
    keypair.publicKey,
    keypair.publicKey,
    new BN(0),
    false
  );
  const connection = dlmm.program.provider.connection;
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  if (sendPositionOwnerTokenProveIxs.length > 0) {
    const sendPositionOwnerTx = new Transaction({
      feePayer: keypair.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(...sendPositionOwnerTokenProveIxs);
    const sendPositionOwnerTxHash = await sendAndConfirmTransaction(
      connection,
      sendPositionOwnerTx,
      [keypair]
    );
    console.log("🚀 ~ seedLiquidity ~ sendPositionOwnerTxHash:", "DONE");
  }

  const initializeBinArrayTxsHash = await Promise.all(
    initializeBinArraysAndPositionIxs.map((groupIx) => {
      const tx = new Transaction({
        feePayer: keypair.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...groupIx);

      return sendAndConfirmTransaction(connection, tx, [keypair]);
    })
  );
  console.log(
    "🚀 ~ seedLiquidity ~ initializeBinArrayTxsHash:",
    `${initializeBinArrayTxsHash.length} Bin Array Initialized`
  );

  const addLiquidityTxsHash = await Promise.all(
    addLiquidityIxs.map((groupIx) => {
      const tx = new Transaction({
        feePayer: keypair.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...groupIx);

      return sendAndConfirmTransaction(connection, tx, [keypair]);
    })
  );
  console.log(
    "🚀 ~ seedLiquidity ~ addLiquidityTxsHash:",
    `${addLiquidityTxsHash.length} transactions created`
  );
};
