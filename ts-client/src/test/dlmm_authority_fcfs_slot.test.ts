import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
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
  createEscrowForAuthority,
  getAmountInLamports,
  keypair,
  OWNER_ESCROW_CAP,
  waitFor,
} from "./helper";
import { waitForState, createDummyPoint, VaultPoint } from "./helper/clock";

const MAX_INDIVIDUAL_CAP = 0.5;
const MAX_VAULT_DEPOSIT_CAP = 5;
const MAX_VAULT_BUYING_CAP = 10;

const walletWithAuthority = new Keypair();
const walletWithoutAuthority = new Keypair();

const DEPOSIT_CAP_WALLETS = [
  {
    address: walletWithAuthority.publicKey,
    maxAmount: getAmountInLamports(MAX_INDIVIDUAL_CAP, 9),
  },
  {
    address: keypair.publicKey,
    maxAmount: getAmountInLamports(OWNER_ESCROW_CAP, 9),
  },
];

let BTC: PublicKey;
let SOL: PublicKey;
let vaultPoint: VaultPoint;
let dlmm: DLMM;
let alphaVault: AlphaVault;
let escrow: Escrow | null;
let escrowWithAuthority: Escrow | null;
let escrowWithoutAuthority: Escrow | null;

describe("DLMM, Authority, FCFS, SLOT", () => {
  beforeAll(async () => {
    await Promise.all(
      [keypair, walletWithAuthority, walletWithoutAuthority].map(
        async (wallet) => {
          await airDropSol(connection, wallet.publicKey, 10);
        }
      )
    );

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
          vaultMode: VaultMode.FCFS,
          whiteListMode: WhitelistMode.PermissionWithAuthority,
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
  });

  test("PREPARING", async () => {
    const { canDeposit, canClaim, canWithdraw } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.PREPARING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);
  });

  test("DEPOSITING", async () => {
    await waitForState(connection, alphaVault, VaultState.DEPOSITING);

    await createEscrowForAuthority(alphaVault, DEPOSIT_CAP_WALLETS);
    [escrowWithAuthority, escrowWithoutAuthority, escrow] = await Promise.all(
      [walletWithAuthority, walletWithoutAuthority, keypair].map(
        async (wallet) => {
          const escrow = await alphaVault.getEscrow(wallet.publicKey);
          return escrow;
        }
      )
    );

    const [
      {
        canDeposit: canWalletWithAuthorityDeposit,
        canClaim: canWalletWithAuthorityClaim,
        canWithdraw: canWalletWithAuthorityWithdraw,
      },
      {
        canDeposit: canWalletWithoutAuthorityDeposit,
        canClaim: canWalletWithoutAuthorityClaim,
        canWithdraw: canWalletWithoutAuthorityWithdraw,
      },
      { canDeposit: canDeposit, canClaim: canClaim, canWithdraw: canWithdraw },
    ] = await Promise.all(
      [escrowWithAuthority, escrowWithoutAuthority, escrow].map(
        async (escrow) => {
          const { canDeposit, canClaim, canWithdraw } =
            await alphaVault.interactionState(escrow);
          return { canDeposit, canClaim, canWithdraw };
        }
      )
    );
    expect(alphaVault.vaultState).toBe(VaultState.DEPOSITING);
    expect(canDeposit).toBe(true);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);

    expect(canWalletWithAuthorityDeposit).toBe(true);
    expect(canWalletWithAuthorityClaim).toBe(false);
    expect(canWalletWithAuthorityWithdraw).toBe(false);

    expect(canWalletWithoutAuthorityDeposit).toBe(false);
    expect(canWalletWithoutAuthorityClaim).toBe(false);
    expect(canWalletWithoutAuthorityWithdraw).toBe(false);

    const walletWithAuthorityDepositTx = await alphaVault.deposit(
      getAmountInLamports(MAX_INDIVIDUAL_CAP, 9),
      walletWithAuthority.publicKey
    );
    const walletWithAuthorityDepositTxHash = await sendAndConfirmTransaction(
      connection,
      walletWithAuthorityDepositTx,
      [walletWithAuthority]
    );
    console.log(
      "🚀 ~ walletWithAuthorityDepositTxHash:",
      walletWithAuthorityDepositTxHash
    );

    const depositTx = await alphaVault.deposit(
      getAmountInLamports(2, 9),
      keypair.publicKey
    );
    const depositTxHash = await sendAndConfirmTransaction(
      connection,
      depositTx,
      [keypair]
    );
    console.log("🚀 ~ depositTxHash:", depositTxHash);

    [escrowWithAuthority, escrowWithoutAuthority, escrow] = await Promise.all(
      [walletWithAuthority, walletWithoutAuthority, keypair].map(
        async ({ publicKey }) => {
          const escrow = await alphaVault.getEscrow(publicKey);
          return escrow;
        }
      )
    );

    expect(escrowWithAuthority.totalDeposit.toString()).toEqual(
      getAmountInLamports(MAX_INDIVIDUAL_CAP, 9).toString()
    );
    expect(escrowWithoutAuthority).toBeNull();
    expect(escrow.totalDeposit.toString()).toEqual(
      getAmountInLamports(2, 9).toString()
    );

    const [
      {
        canDeposit: canWalletWithAuthorityDepositAfter,
        canClaim: canWalletWithAuthorityClaimAfter,
        canWithdraw: canWalletWithAuthorityWithdrawAfter,
      },
      {
        canDeposit: canDepositAfter,
        canClaim: canClaimAfter,
        canWithdraw: canWithdrawAfter,
      },
    ] = await Promise.all(
      [escrowWithAuthority, escrow].map(async (escrow) => {
        return alphaVault.interactionState(escrow);
      })
    );
    expect(canDepositAfter).toBe(true);
    expect(canClaimAfter).toBe(false);
    expect(canWithdrawAfter).toBe(false);

    expect(canWalletWithAuthorityDepositAfter).toBe(false);
    expect(canWalletWithAuthorityClaimAfter).toBe(false);
    expect(canWalletWithAuthorityWithdrawAfter).toBe(false);

    const personalQuota = await alphaVault.getAvailableDepositQuota(escrow);
    expect(personalQuota.toString()).toEqual(
      getAmountInLamports(
        MAX_VAULT_DEPOSIT_CAP - 2 - MAX_INDIVIDUAL_CAP,
        9
      ).toString()
    );

    const nextDepositTx = await alphaVault.deposit(
      personalQuota,
      keypair.publicKey
    );
    const nextDepositTxHash = await sendAndConfirmTransaction(
      connection,
      nextDepositTx,
      [keypair]
    );
    console.log("🚀 ~ nextDepositTxHash:", nextDepositTxHash);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    const {
      canDeposit: canDepositAfterNext,
      canClaim: canClaimAfterNext,
      canWithdraw: canWithdrawAfterNext,
    } = await alphaVault.interactionState(escrow);
    expect(canDepositAfterNext).toBe(false);
    expect(canClaimAfterNext).toBe(false);
    expect(canWithdrawAfterNext).toBe(false);
  });

  test("PURCHASING", async () => {
    await waitForState(connection, alphaVault, VaultState.PURCHASING);

    const fillTx = await alphaVault.fillVault(keypair.publicKey);
    const fillTxHash = await sendAndConfirmTransaction(connection, fillTx, [
      keypair,
    ]);
    console.log("🚀 ~ fillTxHash:", fillTxHash);
    const { canDeposit, canClaim, canWithdraw } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.PURCHASING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);
  });

  test("LOCKING", async () => {
    await waitForState(connection, alphaVault, VaultState.LOCKING);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    const { canDeposit, canClaim, canWithdraw } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.LOCKING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(true);
    expect(canClaim).toBe(false);
  });

  test("VESTING", async () => {
    await waitForState(connection, alphaVault, VaultState.VESTING);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    const { canDeposit, canClaim, canWithdraw } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.VESTING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(true);
    expect(canClaim).toBe(true);
  });

  test("VESTING_ENDED", async () => {
    await waitForState(connection, alphaVault, VaultState.ENDED);

    escrow = await alphaVault.getEscrow(keypair.publicKey);
    if (escrow) {
      const claimInfo = alphaVault.getClaimInfo(escrow);
      expect(claimInfo.totalClaimable.toNumber()).toBeGreaterThan(0);
    }

    const { canDeposit, canClaim, canWithdraw } =
      await alphaVault.interactionState(escrow);
    expect(alphaVault.vaultState).toBe(VaultState.ENDED);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(true);
    expect(canClaim).toBe(true);
  });
});
