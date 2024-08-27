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

async function withdrawFromAlphaVault(
  vault: PublicKey,
  withdrawAmount: BN,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);
  const withdrawTx = await alphaVault.withdraw(withdrawAmount, payer.publicKey);

  console.log(`Withdrawing ${withdrawAmount.toString()}`);
  const txHash = await sendAndConfirmTransaction(connection, withdrawTx, [
    payer,
  ]);
  console.log(txHash);

  const escrow = await alphaVault.getEscrow(payer.publicKey);
  console.log("Escrow info");
  console.log(escrow);
}

// Alpha vault to be withdraw from
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const withdrawAmount = new BN(100_000);
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to withdraw from an alpha vault. Withdraw can only happen before the deposit close,
 * and it applicable only when the vault is in Prorata mode.
 */
withdrawFromAlphaVault(vault, withdrawAmount, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
