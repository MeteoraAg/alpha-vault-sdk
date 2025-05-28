import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { loadKeypairFromFile } from "./utils";
import { AlphaVault } from "../alpha-vault";
import dotenv from "dotenv";
import { PoolType, VaultMode } from "../alpha-vault/type";

dotenv.config();

async function fillVaultWithDlmm(vault: PublicKey, payer: Keypair) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);

  let poolTypeName = "Unknown";
  switch (alphaVault.vault.poolType) {
    case PoolType.DLMM: {
      poolTypeName = "DLMM";
      break;
    }
    case PoolType.DAMM: {
      poolTypeName = "Dynamic AMM";
      break;
    }
    case PoolType.DAMMV2: {
      poolTypeName = "DAMM v2";
      break;
    }
  }
  console.log("Pool type: ", poolTypeName);

  // DLMM require require one to many transactions
  while (true) {
    const fillVaultWithDLMMTransaction = await alphaVault.fillVault(
      payer.publicKey
    );

    if (!fillVaultWithDLMMTransaction) {
      // Vault bought out the whole pool and still have remaining
      break;
    }

    console.log("Fill vault with DLMM");
    const txHash = await sendAndConfirmTransaction(
      connection,
      fillVaultWithDLMMTransaction,
      [payer]
    );
    console.log(txHash);

    await alphaVault.refreshState();
    const inAmountCap =
      alphaVault.vault.vaultMode == VaultMode.FCFS
        ? alphaVault.vault.totalDeposit
        : alphaVault.vault.totalDeposit.lt(alphaVault.vault.maxBuyingCap)
          ? alphaVault.vault.totalDeposit
          : alphaVault.vault.maxBuyingCap;

    if (inAmountCap.eq(alphaVault.vault.swappedAmount)) {
      break;
    }
  }
}

// Alpha vault to be cranked
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to crank the vault to purchase base token from the pool, with deposited token from the vault.
 */
fillVaultWithDlmm(vault, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
