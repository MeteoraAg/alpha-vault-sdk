import DLMM, {
  ActivationType,
  deriveCustomizablePermissionlessLbPair,
  LBCLMM_PROGRAM_IDS,
} from "@meteora-ag/dlmm";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { BN } from "bn.js";
import {
  AlphaVault,
  PermissionWithMerkleProof,
  PoolType,
} from "../../../alpha-vault";
import {
  Clock,
  ClockLayout,
  createDummyMint,
  loadKeypairFromFile,
} from "./../../utils";

async function createCustomizableDlmmWithPermissionedVault(
  connection: Connection,
  payer: Keypair
) {
  const mintX = await createDummyMint(connection, payer).then(
    (info) => info.mint
  );
  const mintY = NATIVE_MINT;

  // 1. Create DLMM token launch pool
  const binStep = new BN(10);
  const activeId = new BN(0);
  const feeBps = new BN(50);
  const hasAlphaVault = true;
  const creator = payer.publicKey;

  const clockAccount = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  const clock: Clock = ClockLayout.decode(clockAccount.data);

  // Pool start trade after created for 24 hours
  const activationPoint = clock.unixTimestamp.add(new BN(3600 * 24));

  const createPoolTx = await DLMM.createCustomizablePermissionlessLbPair(
    connection,
    binStep,
    mintX,
    mintY,
    activeId,
    feeBps,
    ActivationType.Timestamp,
    hasAlphaVault,
    creator,
    activationPoint,
    {
      cluster: "devnet",
    }
  );

  console.log("Creating pool");
  const createPoolTxHash = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [payer]
  );
  console.log(createPoolTxHash);

  const [lbPairKey] = deriveCustomizablePermissionlessLbPair(
    mintX,
    mintY,
    new PublicKey(LBCLMM_PROGRAM_IDS["devnet"])
  );

  const dlmm = await DLMM.create(connection, lbPairKey, {
    cluster: "devnet",
  });

  // 2. Create permissioned alpha vault
  const depositingPoint = new BN(0); // Deposit start immediately
  const startVestingPoint = activationPoint.add(new BN(3600)); // 1 hour lock duration
  const endVestingPoint = startVestingPoint.add(new BN(3600 * 6)); // 6 hours vesting duration
  const maxBuyingCap = new BN(100).mul(new BN(LAMPORTS_PER_SOL)); // 100 SOL buying cap
  const escrowFee = new BN(0); // 0 fee to create stake escrow account

  const createAlphaVaultTx = await AlphaVault.createCustomizableProrataVault(
    connection,
    {
      quoteMint: dlmm.lbPair.tokenYMint,
      baseMint: dlmm.lbPair.tokenXMint,
      poolAddress: dlmm.pubkey,
      poolType: PoolType.DLMM,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      maxBuyingCap,
      escrowFee,
    },
    creator,
    PermissionWithMerkleProof,
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
 * This example shows how to create dlmm with permissioned vault
 */
createCustomizableDlmmWithPermissionedVault(connection, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
