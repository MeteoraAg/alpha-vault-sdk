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
import { getMint } from "@solana/spl-token";
import AmmImpl, { PROGRAM_ID } from "@meteora-ag/dynamic-amm-sdk";
import { deriveCustomizablePermissionlessConstantProductPoolAddress } from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import { getAmountInLamports } from ".";

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
  config: DAMMPoolConfig
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
      }
    );

  const createPoolTxHash = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [wallet]
  );
  console.log("🚀 ~ createPoolTxHash:", createPoolTxHash);

  const poolAddress =
    deriveCustomizablePermissionlessConstantProductPoolAddress(
      config.pool.baseMint,
      config.pool.quoteMint,
      new PublicKey(PROGRAM_ID)
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
      }
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet]
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
      }
    );

    const createVaultTxHash = await sendAndConfirmTransaction(
      connection,
      createVaultTx,
      [wallet]
    );
    console.log(
      "🚀 ~ createDLMMPoolWithAlphaVault ~ createVaultTxHash:",
      createVaultTxHash
    );
  } else {
    throw new Error("Invalid vault mode");
  }

  return poolAddress;
};
