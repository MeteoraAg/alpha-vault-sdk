import {
  Keypair,
  MergeStakeParams,
  PublicKey,
  sendAndConfirmTransaction,
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
  DepositWithProofParams,
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
  createIndividualMerkle,
  createMerkle,
  getAmountInLamports,
  keypair,
  MERKLEONE_DEPOSIT_CAP,
  OWNER_MERKLE_DEPOSIT_CAP,
  waitFor,
} from "./helper";
import { waitForState, createDummyPoint, VaultPoint } from "./helper/clock";
import Decimal from "decimal.js";

const MAX_INDIVIDUAL_CAP = 0.5;
const MAX_VAULT_DEPOSIT_CAP = 5;
const MAX_VAULT_BUYING_CAP = 10;

const merkleWalletOne = new Keypair();
const merkleWalletTwo = new Keypair();

export const MERKLE_WALLET_LIST = [
  {
    wallet: keypair.publicKey,
    depositCap: new Decimal(OWNER_MERKLE_DEPOSIT_CAP),
  },
  {
    wallet: merkleWalletOne.publicKey,
    depositCap: new Decimal(MERKLEONE_DEPOSIT_CAP),
  },
];

let BTC: PublicKey;
let SOL: PublicKey;
let vaultPoint: VaultPoint;
let dlmm: DLMM;
let alphaVault: AlphaVault;
let escrow: Escrow;
let merkleOneEscrow: Escrow;
let merkleTwoEscrow: Escrow;

let merkle: DepositWithProofParams | null;
let merkleOne: DepositWithProofParams | null;
let merkleTwo: DepositWithProofParams | null;

describe("DLMM, Merkle, FCFS, SLOT", () => {
  beforeAll(async () => {
    await Promise.all(
      [keypair, merkleWalletOne, merkleWalletTwo].map(async (wallet) => {
        await airDropSol(connection, wallet.publicKey, 10);
      })
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
          whiteListMode: WhitelistMode.PermissionWithMerkleProof,
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

    [escrow, merkleOneEscrow, merkleTwoEscrow] = await Promise.all([
      alphaVault.getEscrow(keypair.publicKey),
      alphaVault.getEscrow(merkleWalletOne.publicKey),
      alphaVault.getEscrow(merkleWalletTwo.publicKey),
    ]);

    const { tree, merkleRootConfig } = await createMerkle(
      alphaVault,
      keypair,
      MERKLE_WALLET_LIST
    );

    [merkle, merkleOne, merkleTwo] = await Promise.all(
      [keypair, merkleWalletOne, merkleWalletTwo].map(async (wallet) => {
        const merkle = await createIndividualMerkle(
          tree,
          wallet,
          MERKLE_WALLET_LIST
        );
        if (!merkle) return null;
        return {
          ...merkle,
          merkleRootConfig,
        };
      })
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

    const [
      { canDeposit, canClaim, canWithdraw },
      {
        canDeposit: canMerkleOneDeposit,
        canClaim: canMerkleOneClaim,
        canWithdraw: canMerkleOneWithdraw,
      },
      {
        canDeposit: canMerkleTwoDeposit,
        canClaim: canMerkleTwoClaim,
        canWithdraw: canMerkleTwoWithdraw,
      },
    ] = await Promise.all(
      [merkle, merkleOne, merkleTwo].map(async (merkle, index) => {
        const indexEscrow = [escrow, merkleOneEscrow, merkleTwoEscrow][index];
        return alphaVault.interactionState(indexEscrow, merkle);
      })
    );
    expect(alphaVault.vaultState).toBe(VaultState.DEPOSITING);
    expect(canDeposit).toBe(true);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);

    expect(canMerkleOneDeposit).toBe(true);
    expect(canMerkleOneWithdraw).toBe(false);
    expect(canMerkleOneClaim).toBe(false);

    expect(canMerkleTwoDeposit).toBe(false);
    expect(canMerkleTwoWithdraw).toBe(false);
    expect(canMerkleTwoClaim).toBe(false);

    const depositAmount = getAmountInLamports(3, 9);
    const depositTx = await alphaVault.deposit(
      depositAmount,
      keypair.publicKey,
      merkle
    );
    const depositTxHash = await sendAndConfirmTransaction(
      connection,
      depositTx,
      [keypair]
    );
    console.log("🚀 ~ depositTxHash:", depositTxHash);

    const merkleOnedepositAmount = getAmountInLamports(2, 9);
    const merkleOnedepositTx = await alphaVault.deposit(
      merkleOnedepositAmount,
      merkleWalletOne.publicKey,
      merkleOne
    );
    const merkleOnedepositTxHash = await sendAndConfirmTransaction(
      connection,
      merkleOnedepositTx,
      [merkleWalletOne]
    );
    console.log("🚀 ~ merkleOnedepositTxHash:", merkleOnedepositTxHash);

    [escrow, merkleOneEscrow, merkleTwoEscrow] = await Promise.all([
      alphaVault.getEscrow(keypair.publicKey),
      alphaVault.getEscrow(merkleWalletOne.publicKey),
      alphaVault.getEscrow(merkleWalletTwo.publicKey),
    ]);

    expect(escrow.totalDeposit.toString()).toEqual(
      getAmountInLamports(3, 9).toString()
    );
    expect(merkleOneEscrow.totalDeposit.toString()).toEqual(
      getAmountInLamports(MERKLEONE_DEPOSIT_CAP, 9).toString()
    );
    expect(merkleTwoEscrow).toBeNull();

    const {
      canDeposit: canDepositAfter,
      canClaim: canClaimAfter,
      canWithdraw: canWithdrawAfter,
    } = await alphaVault.interactionState(escrow);
    expect(canDepositAfter).toBe(false);
    expect(canClaimAfter).toBe(false);
    expect(canWithdrawAfter).toBe(false);
  });

  test("PURCHASING", async () => {
    await waitForState(connection, alphaVault, VaultState.PURCHASING);

    const { canDeposit, canClaim, canWithdraw } =
      await alphaVault.interactionState(escrow);
    console.log({
      current: alphaVault.clock.slot.toNumber(),
      lastBuying: alphaVault.vaultPoint.lastBuyingPoint,
      lastJoin: alphaVault.vaultPoint.lastJoinPoint,
    });
    expect(alphaVault.vaultState).toBe(VaultState.PURCHASING);
    expect(canDeposit).toBe(false);
    expect(canWithdraw).toBe(false);
    expect(canClaim).toBe(false);

    const fillTx = await alphaVault.fillVault(keypair.publicKey);
    const fillTxHash = await sendAndConfirmTransaction(connection, fillTx, [
      keypair,
    ]);
    console.log("🚀 ~ fillTxHash:", fillTxHash);
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
