import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { loadKeypairFromFile } from "./utils";
import { AlphaVault } from "../alpha-vault";
import BN from "bn.js";
import dotenv from "dotenv";

dotenv.config();

async function withdrawRemainingFromAlphaVault(
  vault: PublicKey,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);
  const withdrawRemainingTx = await alphaVault.withdrawRemainingQuote(
    payer.publicKey
  );

  console.log(`Withdrawing unused fund`);
  const txHash = await sendAndConfirmTransaction(
    connection,
    withdrawRemainingTx,
    [payer]
  );
  console.log(txHash);

  const escrow = await alphaVault.getEscrow(payer.publicKey);
  console.log("Escrow info");
  console.log(escrow);
}

// Alpha vault to be withdraw / refund from
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to withdraw remaining unused deposit from an alpha vault after the vault done buying.
 */
withdrawRemainingFromAlphaVault(vault, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
