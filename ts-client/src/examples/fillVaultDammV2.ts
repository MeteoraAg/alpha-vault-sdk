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
import { PoolType } from "../alpha-vault/type";

dotenv.config();

async function fillVaultWithDammV2(vault: PublicKey, payer: Keypair) {
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

  // Dynamic AMM v2 require only single fill transaction
  const fillVaultWithDammV2Transaction = await alphaVault.fillVault(
    payer.publicKey
  );

  console.log("Fill vault with dynamic AMM v2");
  const txHash = await sendAndConfirmTransaction(
    connection,
    fillVaultWithDammV2Transaction,
    [payer]
  );
  console.log(txHash);
}

// Alpha vault to be cranked
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to crank the vault to purchase base token from the pool, with deposited token from the vault.
 */
fillVaultWithDammV2(vault, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
