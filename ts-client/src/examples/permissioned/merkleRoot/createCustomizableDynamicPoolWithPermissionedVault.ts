import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import {
  bpsToNumerator,
  Clock,
  ClockLayout,
  createDummyMint,
  loadKeypairFromFile,
} from "./../../utils";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  AlphaVault,
  DYNAMIC_AMM_PROGRAM_ID,
  PermissionWithMerkleProof,
  PoolType,
} from "../../../alpha-vault";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { ActivationType } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/types";
import { deriveCustomizablePermissionlessConstantProductPoolAddress } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import BN from "bn.js";

async function createCustomizableDynamicPoolWithPermissionedVault(
  connection: Connection,
  payer: Keypair
) {
  const mintA = await createDummyMint(connection, payer).then(
    (info) => info.mint
  );
  const mintB = NATIVE_MINT;

  // 1. Create dynamic pool
  const feeBps = new BN(50);
  const hasAlphaVault = true;
  const creator = payer.publicKey;

  const clockAccount = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  const clock: Clock = ClockLayout.decode(clockAccount.data);

  // Pool start trade after created for 24 hours
  const activationPoint = clock.unixTimestamp.add(new BN(3600 * 24));
  const tokenAAmount = new BN(1_000_000);
  const tokenBAmount = new BN(1_000_000);

  const createPoolTx =
    await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      connection,
      creator,
      mintA,
      mintB,
      tokenAAmount,
      tokenBAmount,
      {
        hasAlphaVault,
        activationPoint,
        activationType: ActivationType.Timestamp,
        tradeFeeNumerator: bpsToNumerator(feeBps).toNumber(),
        padding: new Array(90).fill(0),
      }
    );

  console.log("Creating pool");
  const createPoolTxHash = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [payer]
  );
  console.log(createPoolTxHash);

  const poolKey = deriveCustomizablePermissionlessConstantProductPoolAddress(
    mintA,
    mintB,
    new PublicKey(DYNAMIC_AMM_PROGRAM_ID)
  );

  const amm = await AmmImpl.create(connection, poolKey, {
    cluster: "devnet",
  });

  // 2. Create permissioned alpha vault
  const depositingPoint = clock.unixTimestamp.add(new BN(3600)); // Deposit start 1 hour later after pool created
  const startVestingPoint = activationPoint.add(new BN(3600)); // 1 hour lock duration
  const endVestingPoint = startVestingPoint.add(new BN(3600 * 6)); // 6 hours vesting duration
  const maxDepositingCap = new BN(100).mul(new BN(LAMPORTS_PER_SOL)); // Max deposit 100 SOL
  const individualDepositingCap = new BN(1).mul(new BN(LAMPORTS_PER_SOL)); // Each user max deposit 1 SOL
  const escrowFee = new BN(0); // 0 fee to create stake escrow account

  const createAlphaVaultTx = await AlphaVault.createCustomizableFcfsVault(
    connection,
    {
      quoteMint: amm.poolState.tokenBMint,
      baseMint: amm.poolState.tokenAMint,
      poolAddress: amm.address,
      poolType: PoolType.DAMM,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      individualDepositingCap,
      maxDepositingCap,
      escrowFee,
      whitelistMode: PermissionWithMerkleProof,
    },
    creator,
    {
      cluster: "devnet",
    }
  );

  console.log("Creating alpha vault");
  const alphaVaultTxHash = await sendAndConfirmTransaction(
    connection,
    createAlphaVaultTx,
    [payer]
  );
  console.log(alphaVaultTxHash);
}

const connection = new Connection(clusterApiUrl("devnet"));
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to create dynamic pool with permissioned vault
 */
createCustomizableDynamicPoolWithPermissionedVault(connection, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
