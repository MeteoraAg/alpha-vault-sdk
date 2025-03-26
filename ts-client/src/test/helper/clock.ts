import { Connection } from "@solana/web3.js";
import {
  ActivationType,
  PoolType,
  VaultState,
  VaultPoint as AlphaVaultPoint,
  AlphaVault,
} from "../../alpha-vault";
import BN from "bn.js";
import { waitFor } from ".";

const MS_PER_SLOT = 400;

export interface VaultPoint {
  activationPoint: BN;
  depositingPoint: BN;
  startVestingPoint: BN;
  endVestingPoint: BN;
}

export const DLMM_SLOT_DELAY = Object.freeze({
  ACTIVATION: 30,
  DEPOSITING: 20,
  VESTING: 40,
  END: 50,
});

export const DAMM_SLOT_DELAY = Object.freeze({
  ACTIVATION: 15,
  DEPOSITING: 5,
  VESTING: 20,
  END: 30,
});

export async function createDummyPoint(
  connection: Connection,
  activationType: ActivationType,
  poolType: PoolType
): Promise<VaultPoint> {
  const currentSlot = await connection.getSlot();

  const currentPoint =
    activationType === ActivationType.SLOT
      ? currentSlot
      : await connection.getBlockTime(currentSlot);
  const slotDelay =
    poolType === PoolType.DLMM ? DLMM_SLOT_DELAY : DAMM_SLOT_DELAY;
  const bufferTime = activationType === ActivationType.SLOT ? 1000 : 1;

  return {
    activationPoint: new BN(currentPoint + slotDelay.ACTIVATION),
    depositingPoint: new BN(currentPoint + slotDelay.DEPOSITING),
    startVestingPoint: new BN(currentPoint + slotDelay.VESTING),
    endVestingPoint: new BN(currentPoint + slotDelay.END),
  };
}

export async function waitForState(
  connection: Connection,
  alphaVault: AlphaVault,
  vaultState: VaultState
) {
  const {
    vaultPoint,
    vault: { activationType },
  } = alphaVault;
  while (true) {
    const currentSlot = await connection.getSlot();
    const point =
      activationType === ActivationType.SLOT
        ? currentSlot
        : await connection.getBlockTime(currentSlot);

    if (vaultState === VaultState.DEPOSITING) {
      if (point > vaultPoint.firstJoinPoint) {
        break;
      }
    }
    if (vaultState === VaultState.PURCHASING) {
      if (point > vaultPoint.lastJoinPoint) {
        break;
      }
    }
    if (vaultState === VaultState.LOCKING) {
      if (point > vaultPoint.lastBuyingPoint) {
        break;
      }
    }
    if (vaultState === VaultState.VESTING) {
      if (point > vaultPoint.startVestingPoint) {
        break;
      }
    }
    if (vaultState === VaultState.ENDED) {
      if (point > vaultPoint.endVestingPoint) {
        break;
      }
    }

    await waitFor(1000);
  }

  return Promise.resolve();
}
