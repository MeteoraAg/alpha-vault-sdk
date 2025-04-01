import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { ActivationType as DAMMActivationType } from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/types";
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
  BASE_TOKEN_DECIMAL,
  connection,
  createBaseAndQuoteToken,
  getAmountInLamports,
  keypair,
  MINT_AMOUNT,
  waitFor,
} from "./helper";
import BN from "bn.js";
import { waitForState, createDummyPoint, VaultPoint } from "./helper/clock";
import AmmImpl from "@meteora-ag/dynamic-amm-sdk";
import { createDAMMPoolWithAlphaVault } from "./helper/amm";

const MAX_INDIVIDUAL_CAP = 0.5;
const MAX_VAULT_DEPOSIT_CAP = 5;
const MAX_VAULT_BUYING_CAP = 10;

let BTC: PublicKey;
let SOL: PublicKey;
let vaultPoint: VaultPoint;
let amm: AmmImpl;
let alphaVault: AlphaVault;
let escrow: Escrow;

describe("DAMM, Permissionless, FCFS, SLOT", () => {
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
      PoolType.DYNAMIC
    );
    vaultPoint = {
      activationPoint: dummySlot.activationPoint,
      depositingPoint: dummySlot.depositingPoint,
      startVestingPoint: dummySlot.startVestingPoint,
      endVestingPoint: dummySlot.endVestingPoint,
    };

    const poolAddress = await createDAMMPoolWithAlphaVault(
      connection,
      keypair,
      {
        pool: {
          quoteMint: SOL,
          baseMint: BTC,
          quoteAmount: getAmountInLamports(5, 9),
          baseAmount: getAmountInLamports(MINT_AMOUNT, BASE_TOKEN_DECIMAL),
          activationType: DAMMActivationType.Slot,
          activationPoint: vaultPoint.activationPoint,
        },
        vault: {
          vaultMode: VaultMode.FCFS,
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

    amm = await AmmImpl.create(connection, poolAddress);

    alphaVault = await AlphaVault.create(
      connection,
      amm.poolState.bootstrapping.whitelistedVault,
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
    expect(canWithdrawRemainingQuote).toBe(false);
    expect(canClaim).toBe(false);
  });

  test("DEPOSITING", async () => {
    await waitForState(connection, alphaVault, VaultState.DEPOSITING);

    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.DEPOSITING);
    expect(canDeposit).toBe(true);
    expect(canWithdraw).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(false);
    expect(canClaim).toBe(false);

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
    console.log("🚀 ~ it ~ depositTxHash:", depositTxHash);

    escrow = await alphaVault.getEscrow(keypair.publicKey);

    expect(escrow.totalDeposit.toString()).toEqual(
      getAmountInLamports(MAX_INDIVIDUAL_CAP, 9).toString()
    );

    const {
      canDeposit: canDepositAfter,
      canClaim: canClaimAfter,
      canWithdraw: canWithdrawAfter,
      canWithdrawRemainingQuote: canWithdrawRemainingQuoteAfter,
    } = await alphaVault.interactionState(escrow);
    expect(canDepositAfter).toBe(false);
    expect(canClaimAfter).toBe(false);
    expect(canWithdrawRemainingQuoteAfter).toBe(false);
    expect(canWithdrawAfter).toBe(false);
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
    expect(canWithdrawRemainingQuote).toBe(false);
    expect(canClaim).toBe(false);
  });

  test("LOCKING", async () => {
    await waitForState(connection, alphaVault, VaultState.LOCKING);

    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.LOCKING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(false);
    expect(canClaim).toBe(false);
  });

  test("VESTING", async () => {
    await waitForState(connection, alphaVault, VaultState.VESTING);

    const { canDeposit, canClaim, canWithdraw, canWithdrawRemainingQuote } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.VESTING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canWithdrawRemainingQuote).toBe(false);
    expect(canClaim).toBe(true);
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
    expect(canWithdrawRemainingQuote).toBe(false);
    expect(canClaim).toBe(true);
  });
});
