import {
  CpAmm,
  FEE_DENOMINATOR,
  BaseFeeMode,
  getLiquidityDeltaFromAmountA,
  PoolState,
  SCALE_OFFSET,
  getBaseFeeParams,
  PoolFeesParams,
  getDynamicFeeParams,
} from "@meteora-ag/cp-amm-sdk";
import { ActivationType } from "@meteora-ag/dlmm";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { AlphaVault, PoolType, WhitelistMode } from "../alpha-vault";
import {
  Clock,
  ClockLayout,
  createDummyMint,
  loadKeypairFromFile,
} from "./utils";

async function createCustomizableDammV2WithPermissionlessVault(
  connection: Connection,
  payer: Keypair
) {
  const tokenAMint = await createDummyMint(connection, payer).then(
    (info) => info.mint
  );
  const tokenBMint = NATIVE_MINT;

  // 1. Create DAMM v2 token launch pool
  const minPrice = 0.01;
  const maxPrice = 10;

  // quote decimals - base decimals = 9 - 6
  const toLamportMultipler = 3;

  const sqrtMinPrice = new BN(
    Math.sqrt(minPrice * 10 ** toLamportMultipler)
  ).shln(SCALE_OFFSET);
  const sqrtMaxPrice = new BN(
    Math.sqrt(maxPrice * 10 ** toLamportMultipler)
  ).shln(SCALE_OFFSET);

  const hasAlphaVault = true;
  const creator = payer.publicKey;

  const clockAccount = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  const clock: Clock = ClockLayout.decode(clockAccount.data);

  // Pool start trade after created for 24 hours
  const activationPoint = clock.unixTimestamp.add(new BN(3600 * 24));

  const positionNftMint = Keypair.generate();
  const cpAmm = new CpAmm(connection);

  const tokenAAmount = new BN(100_000_000_000);
  const tokenBAmount = new BN(0);
  const collectFeeMode = 0; // Both token

  const liquidityDelta = getLiquidityDeltaFromAmountA(
    tokenAAmount,
    sqrtMinPrice,
    sqrtMaxPrice
  );

  const feePct = 5;
  const protocolFeePercent = 20;
  const referralFeePercent = 20;
  const cliffFeeNumerator = new BN(feePct)
    .mul(new BN(FEE_DENOMINATOR))
    .divn(100);

  const baseFee = getBaseFeeParams(
    {
      baseFeeMode: BaseFeeMode.FeeMarketCapSchedulerExponential,
      feeMarketCapSchedulerParam: {
        startingFeeBps: 1111,
        endingFeeBps: 100,
        numberOfPeriod: 3,
        sqrtPriceStepBps: 2000,
        schedulerExpirationDuration: 60,
      },
    },
    9,
    ActivationType.Timestamp
  );

  console.log("Base fee:", baseFee);

  const poolFees: PoolFeesParams = {
    baseFee,
    padding: [],
    dynamicFee: getDynamicFeeParams(500),
  };

  const { tx, pool } = await cpAmm.createCustomPool({
    payer: payer.publicKey,
    creator,
    positionNft: positionNftMint.publicKey,
    tokenAMint,
    tokenBMint,
    tokenAAmount,
    tokenBAmount,
    sqrtMinPrice,
    sqrtMaxPrice,
    initSqrtPrice: sqrtMinPrice,
    hasAlphaVault,
    activationType: ActivationType.Timestamp,
    collectFeeMode,
    activationPoint,
    tokenAProgram: TOKEN_PROGRAM_ID,
    tokenBProgram: TOKEN_PROGRAM_ID,
    liquidityDelta,
    poolFees,
  });

  console.log("Creating pool");
  const createPoolTxHash = await sendAndConfirmTransaction(connection, tx, [
    payer,
    positionNftMint,
  ]);
  console.log(createPoolTxHash);

  const poolAccount = await connection.getAccountInfo(pool);
  const dammV2Pool: PoolState = await cpAmm._program.coder.accounts.decode(
    "pool",
    poolAccount.data
  );

  // 2. Create permissionless alpha vault
  const depositingPoint = new BN(0); // Deposit start immediately
  const startVestingPoint = activationPoint.add(new BN(3600)); // 1 hour lock duration
  const endVestingPoint = startVestingPoint.add(new BN(3600 * 6)); // 6 hours vesting duration
  const maxBuyingCap = new BN(100).mul(new BN(LAMPORTS_PER_SOL)); // 100 SOL buying cap
  const escrowFee = new BN(0); // 0 fee to create stake escrow account

  const createAlphaVaultTx = await AlphaVault.createCustomizableProrataVault(
    connection,
    {
      quoteMint: dammV2Pool.tokenBMint,
      baseMint: dammV2Pool.tokenAMint,
      poolAddress: pool,
      poolType: PoolType.DAMMV2,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      maxBuyingCap,
      escrowFee,
      whitelistMode: WhitelistMode.Permissionless,
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
 * This example shows how to create damm v2 with permissionless vault
 */
createCustomizableDammV2WithPermissionlessVault(connection, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
