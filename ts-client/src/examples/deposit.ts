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

async function depositToAlphaVault(
  vault: PublicKey,
  depositAmount: BN,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaVault = await AlphaVault.create(connection, vault);
  const depositTx = await alphaVault.deposit(depositAmount, payer.publicKey);

  console.log(`Depositing ${depositAmount.toString()}`);
  const txHash = await sendAndConfirmTransaction(connection, depositTx, [
    payer,
  ]);
  console.log(txHash);

  const escrow = await alphaVault.getEscrow(payer.publicKey);
  console.log("Escrow info");
  console.log(escrow);
}

// Alpha vault to be deposited to
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
const depositAmount = new BN(100_000);
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to deposit to alpha vault. Deposit can only happen before the deposit close.
 */
depositToAlphaVault(vault, depositAmount, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
