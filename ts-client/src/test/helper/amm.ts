import { ActivationType } from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/types";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import {
  AlphaVault,
  PoolType,
  VaultMode,
  WhitelistMode,
} from "../../alpha-vault";
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import AmmImpl, { PROGRAM_ID } from "@meteora-ag/dynamic-amm-sdk";
import { deriveCustomizablePermissionlessConstantProductPoolAddress } from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import { getAmountInLamports } from ".";
import {
  CpAmm,
  ActivationType as CpAmmActivationType,
  CollectFeeMode,
  MIN_SQRT_PRICE,
  MAX_SQRT_PRICE,
  getLiquidityDeltaFromAmountA,
  getBaseFeeParams,
  BaseFeeMode,
  PoolFeesParams,
} from "@meteora-ag/cp-amm-sdk";
import Decimal from "decimal.js";

interface DAMMPoolConfig {
  pool: {
    quoteMint: PublicKey;
    baseMint: PublicKey;
    quoteAmount: BN;
    baseAmount: BN;
    activationType: ActivationType;
    activationPoint: BN;
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

export const createDAMMPoolWithAlphaVault = async (
  connection: Connection,
  wallet: Keypair,
  config: DAMMPoolConfig,
) => {
  const createPoolTx =
    await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      connection,
      wallet.publicKey,
      config.pool.baseMint,
      config.pool.quoteMint,
      config.pool.baseAmount,
      config.pool.quoteAmount,
      {
        activationPoint: config.pool.activationPoint,
        activationType: config.pool.activationType,
        hasAlphaVault: true,
        padding: Array(90).fill(0),
        tradeFeeNumerator: 2500,
      },
    );

  const createPoolTxHash = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [wallet],
  );
  console.log("🚀 ~ createPoolTxHash:", createPoolTxHash);

  const poolAddress =
    deriveCustomizablePermissionlessConstantProductPoolAddress(
      config.pool.baseMint,
      config.pool.quoteMint,
      new PublicKey(PROGRAM_ID),
    );

  if (config.vault.vaultMode === VaultMode.FCFS) {
    const maxDepositingCap = getAmountInLamports(
      config.vault.maxDepositingCap,
      9,
    );
    const individualDepositingCap = getAmountInLamports(
      config.vault.individualDepositingCap,
      9,
    );
    const createVaultTx = await AlphaVault.createCustomizableFcfsVault(
      connection,
      {
        baseMint: config.pool.baseMint,
        quoteMint: config.pool.quoteMint,
        poolAddress,
        poolType: PoolType.DAMM,
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
      },
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet],
    );
  } else if (config.vault.vaultMode === VaultMode.PRORATA) {
    const maxBuyingCap = getAmountInLamports(config.vault.maxBuyingCap, 9);
    const createVaultTx = await AlphaVault.createCustomizableProrataVault(
      connection,
      {
        baseMint: config.pool.baseMint,
        quoteMint: config.pool.quoteMint,
        poolAddress,
        poolType: PoolType.DAMM,
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
      },
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet],
    );
    console.log(
      "🚀 ~ createDLMMPoolWithAlphaVault ~ createVaultTxHash:",
      createVaultTxHash,
    );
  } else {
    throw new Error("Invalid vault mode");
  }

  return poolAddress;
};

interface DAMMV2PoolConfig {
  pool: {
    baseMint: PublicKey;
    quoteMint: PublicKey;
    baseAmount: BN;
    activationType: CpAmmActivationType;
    activationPoint: BN;
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

export const createDAMMV2PoolWithAlphaVault = async (
  connection: Connection,
  wallet: Keypair,
  config: DAMMV2PoolConfig,
) => {
  const tokenAAmount = config.pool.baseAmount;
  const tokenBAmount = new BN(0);

  const startPrice = new Decimal(1);
  const endPrice = new Decimal(5);

  const sqrtStartPrice = startPrice.sqrt().floor();
  const sqrtEndPrice = endPrice.sqrt().ceil();

  const sqrtStartPriceX64 = new BN(sqrtStartPrice.toString()).shln(64);
  const sqrtEndPriceX64 = new BN(sqrtEndPrice.toString()).shln(64);

  const liquidityDeltaA = getLiquidityDeltaFromAmountA(
    tokenAAmount,
    sqrtStartPriceX64,
    sqrtEndPriceX64,
    CollectFeeMode.OnlyB,
  );

  const baseFee = getBaseFeeParams(
    {
      baseFeeMode: BaseFeeMode.FeeTimeSchedulerLinear,
      feeTimeSchedulerParam: {
        startingFeeBps: 500,
        endingFeeBps: 100,
        numberOfPeriod: 3,
        totalDuration:
          config.pool.activationType === CpAmmActivationType.Slot ? 100 : 60,
      },
    },
    9,
    config.pool.activationType,
  );

  const poolFees: PoolFeesParams = {
    baseFee,
    compoundingFeeBps: 0,
    padding: 0,
    dynamicFee: null,
  };

  const positionNftMint = Keypair.generate();
  const cpAmm = new CpAmm(connection);

  const { tx: createPoolTx, pool: poolAddress } = await cpAmm.createCustomPool({
    payer: wallet.publicKey,
    creator: wallet.publicKey,
    positionNft: positionNftMint.publicKey,
    tokenAMint: config.pool.baseMint,
    tokenBMint: config.pool.quoteMint,
    tokenAAmount,
    tokenBAmount,
    sqrtMinPrice: sqrtStartPriceX64,
    sqrtMaxPrice: sqrtEndPriceX64,
    initSqrtPrice: sqrtStartPriceX64,
    hasAlphaVault: true,
    activationType: config.pool.activationType,
    collectFeeMode: 0,
    activationPoint: config.pool.activationPoint,
    tokenAProgram: TOKEN_PROGRAM_ID,
    tokenBProgram: TOKEN_PROGRAM_ID,
    liquidityDelta: liquidityDeltaA,
    poolFees,
  });

  const createPoolTxHash = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [wallet, positionNftMint],
  );
  console.log("🚀 ~ createDAMMV2PoolTxHash:", createPoolTxHash);

  if (config.vault.vaultMode === VaultMode.FCFS) {
    const maxDepositingCap = getAmountInLamports(
      config.vault.maxDepositingCap,
      9,
    );
    const individualDepositingCap = getAmountInLamports(
      config.vault.individualDepositingCap,
      9,
    );
    const createVaultTx = await AlphaVault.createCustomizableFcfsVault(
      connection,
      {
        baseMint: config.pool.baseMint,
        quoteMint: config.pool.quoteMint,
        poolAddress,
        poolType: PoolType.DAMMV2,
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
      },
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet],
    );
    console.log("🚀 ~ createDAMMV2VaultTxHash:", createVaultTxHash);
  } else if (config.vault.vaultMode === VaultMode.PRORATA) {
    const maxBuyingCap = getAmountInLamports(config.vault.maxBuyingCap, 9);
    const createVaultTx = await AlphaVault.createCustomizableProrataVault(
      connection,
      {
        baseMint: config.pool.baseMint,
        quoteMint: config.pool.quoteMint,
        poolAddress,
        poolType: PoolType.DAMMV2,
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
      },
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet],
    );
    console.log("🚀 ~ createDAMMV2VaultTxHash:", createVaultTxHash);
  } else {
    throw new Error("Invalid vault mode");
  }

  return poolAddress;
};
