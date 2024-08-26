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

dotenv.config();

async function claimBoughtTokenFromAlphaVault(
  vault: PublicKey,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);
  const claimTx = await alphaVault.claimToken(payer.publicKey);

  console.log("Claiming bought token");
  const txHash = await sendAndConfirmTransaction(connection, claimTx, [payer]);
  console.log(txHash);

  const escrow = await alphaVault.getEscrow(payer.publicKey);
  console.log("Escrow info");
  console.log(escrow);
}

// Alpha vault to be deposited to
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to claim bought token from an alpha vault. Claim can only happen when the vesting start.
 */
claimBoughtTokenFromAlphaVault(vault, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
