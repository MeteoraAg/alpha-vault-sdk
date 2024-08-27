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

async function fillVaultWithDynamicAmm(vault: PublicKey, payer: Keypair) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);

  console.log(
    "Pool type: ",
    alphaVault.vault.poolType == PoolType.DYNAMIC ? "Dynamic AMM" : "DLMM"
  );

  // Dynamic AMM require only single fill transaction
  const fillVaultWithDynamicAmmTransaction = await alphaVault.fillVault(
    payer.publicKey
  );

  console.log("Fill vault with dynamic AMM");
  const txHash = await sendAndConfirmTransaction(
    connection,
    fillVaultWithDynamicAmmTransaction,
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
fillVaultWithDynamicAmm(vault, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
