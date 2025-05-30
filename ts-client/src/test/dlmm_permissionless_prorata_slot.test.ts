import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  createDLMMPoolWithAlphaVault,
  SEEDING_CONFIG,
  seedLiquidity,
} from "./helper/dlmm";
import DLMM, { ActivationType as DlmmActivationType } from "@meteora-ag/dlmm";
import {
  ActivationType,
  AlphaVault,
  Escrow,
  PoolType,
  VaultMode,
  VaultState,
  WhitelistMode,
} from "../alpha-vault";
import {
  airDropSol,
  connection,
  createBaseAndQuoteToken,
  getAmountInLamports,
  keypair,
  waitFor,
} from "./helper";
import { waitForState, createDummyPoint, VaultPoint } from "./helper/clock";

const MAX_INDIVIDUAL_CAP = 0.5;
const MAX_VAULT_DEPOSIT_CAP = 5;
const MAX_VAULT_BUYING_CAP = 10;

let BTC: PublicKey;
let SOL: PublicKey;
let vaultPoint: VaultPoint;
let dlmm: DLMM;
let alphaVault: AlphaVault;
let escrow: Escrow;

describe("DLMM, Permissionless, PRORATA, SLOT", () => {
  beforeAll(async () => {
    await airDropSol(connection, keypair.publicKey, 10);

    const { baseToken, quoteToken } = await createBaseAndQuoteToken(
      connection,
      keypair
    );

    BTC = baseToken;
    SOL = quoteToken;

    const dummySlot = await createDummyPoint(
      connection,
      ActivationType.SLOT,
      PoolType.DLMM
    );
    vaultPoint = {
      activationPoint: dummySlot.activationPoint,
      depositingPoint: dummySlot.depositingPoint,
      startVestingPoint: dummySlot.startVestingPoint,
      endVestingPoint: dummySlot.endVestingPoint,
    };

    const poolAddress = await createDLMMPoolWithAlphaVault(
      connection,
      keypair,
      {
        pool: {
          quoteMint: SOL,
          baseMint: BTC,
          binStep: 10,
          feeBps: 10,
          activationType: DlmmActivationType.Slot,
          activationPoint: vaultPoint.activationPoint,
          initialPrice: SEEDING_CONFIG.currentPrice,
        },
        vault: {
          vaultMode: VaultMode.PRORATA,
          whiteListMode: WhitelistMode.Permissionless,
          depositingPoint: vaultPoint.depositingPoint,
          startVestingPoint: vaultPoint.startVestingPoint,
          endVestingPoint: vaultPoint.endVestingPoint,
          maxDepositingCap: MAX_VAULT_DEPOSIT_CAP,
          individualDepositingCap: MAX_INDIVIDUAL_CAP,
          maxBuyingCap: MAX_VAULT_BUYING_CAP,
        },
        opt: {
          cluster: "localhost",
        },
      }
    );

    dlmm = await DLMM.create(connection, poolAddress, {
      cluster: "localhost",
    });
    await seedLiquidity(dlmm, keypair);

    alphaVault = await AlphaVault.create(
      connection,
      dlmm.lbPair.preActivationSwapAddress,
      {
        cluster: "localhost",
      }
    );

    escrow = await alphaVault.getEscrow(keypair.publicKey);
  });

  test("PREPARING", async () => {
    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.PREPARING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(false);
  });

  test("DEPOSITING", async () => {
    await waitForState(connection, alphaVault, VaultState.DEPOSITING);

    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.DEPOSITING);
    expect(canDeposit).toBe(true);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(false);

    const depositAmount = getAmountInLamports(1, 9);
    const depositTx = await alphaVault.deposit(
      depositAmount,
      keypair.publicKey
    );
    const depositTxHash = await sendAndConfirmTransaction(
      connection,
      depositTx,
      [keypair]
    );
    console.log("🚀 ~ depositTxHash:", depositTxHash);

    escrow = await alphaVault.getEscrow(keypair.publicKey);

    expect(escrow.totalDeposit.toString()).toEqual(depositAmount.toString());

    const {
      canDeposit: canDepositAfter,
      canClaim: canClaimAfter,
      canWithdraw: canWithdrawAfter,
      canWithdrawRemainingQuote: canWithdrawRemainingQuoteAfter,
    } = await alphaVault.interactionState(escrow);
    expect(canDepositAfter).toBe(true);
    expect(canClaimAfter).toBe(false);
    expect(canWithdrawAfter).toBe(true);
    expect(canWithdrawRemainingQuoteAfter).toBe(false);
  });

  test("PURCHASING", async () => {
    await waitForState(connection, alphaVault, VaultState.PURCHASING);

    const fillTx = await alphaVault.fillVault(keypair.publicKey);
    const fillTxHash = await sendAndConfirmTransaction(connection, fillTx, [
      keypair,
    ]);
    console.log("🚀 ~ fillTxHash:", fillTxHash);
    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.PURCHASING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(false);
  });

  test("LOCKING", async () => {
    await waitForState(connection, alphaVault, VaultState.LOCKING);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.LOCKING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(true);
  });

  test("VESTING", async () => {
    await waitForState(connection, alphaVault, VaultState.VESTING);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.VESTING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(true);
    expect(canWithdrawRemainingQuote).toBe(true);
  });

  test("VESTING_ENDED", async () => {
    await waitForState(connection, alphaVault, VaultState.ENDED);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    if (escrow) {
      const claimInfo = alphaVault.getClaimInfo(escrow);
      expect(claimInfo.totalClaimable.toNumber()).toBeGreaterThan(0);
    }

    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.ENDED);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(true);
    expect(canWithdrawRemainingQuote).toBe(true);
  });
});
