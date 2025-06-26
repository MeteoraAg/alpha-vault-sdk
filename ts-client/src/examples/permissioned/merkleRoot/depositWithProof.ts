import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import dotenv from "dotenv";
import { AlphaVault } from "../../../alpha-vault";
import { loadKeypairFromFile } from "../../utils";

dotenv.config();

async function depositToPermissionedAlphaVault(
  vault: PublicKey,
  depositAmount: BN,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const alphaVault = await AlphaVault.create(connection, vault);

  // 1. Load merkle proof
  const merkleProof = await alphaVault.getMerkleProofForDeposit(
    payer.publicKey
  );

  console.log(merkleProof);

  // 2. Deposit
  const depositTx = await alphaVault.deposit(
    depositAmount,
    payer.publicKey,
    merkleProof
  );

  const txHash = await sendAndConfirmTransaction(connection, depositTx, [
    payer,
  ]);
  console.log(txHash);

  const escrow = await alphaVault.getEscrow(payer.publicKey);
  console.log("Escrow info");
  console.log(escrow);
}

// Alpha vault to be deposited to
const vault = new PublicKey("BToaBpGTZd1dt2W46jn8Lm65yk7FgerZgJdwAE1wRsxS");
const depositAmount = new BN(100_000);
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);

/**
 * This example shows how to deposit to permissioned alpha vault. Deposit can only happen before the deposit close.
 */
depositToPermissionedAlphaVault(vault, depositAmount, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
