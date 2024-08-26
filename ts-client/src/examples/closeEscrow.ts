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

async function closeEscrow(vault: PublicKey, payer: Keypair) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);
  const claimTx = await alphaVault.closeEscrow(payer.publicKey);

  console.log("Close escrow");
  const txHash = await sendAndConfirmTransaction(connection, claimTx, [payer]);
  console.log(txHash);
}

// Alpha vault to be deposited to
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to close an escrow account and get rental back. Close escrow can only happen after vesting is complete, and escrow have claimed all the bought token.
 */
closeEscrow(vault, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
