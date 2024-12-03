import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { loadKeypairFromFile } from "../../utils";
import { AlphaVault } from "../../../alpha-vault";
import dotenv from "dotenv";
import { createMerkleTree, loadWhitelistWalletCsv } from "./utils";
import { BN } from "bn.js";

dotenv.config();

async function createMerkleRootConfig(
  vault: PublicKey,
  csvPath: string,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const alphaVault = await AlphaVault.create(connection, vault);

  // 1. Load whitelist wallet from csv file
  const whitelistWallets = await loadWhitelistWalletCsv(csvPath);
  console.log("Loaded whitelist wallets");
  console.log(whitelistWallets);

  // 2. Create merkle tree
  const tree = await createMerkleTree(connection, alphaVault, whitelistWallets);

  // 3. Create merkle root config
  // If the tree grew too large, one can partition it into multiple tree by setting different version
  const version = new BN(0);
  const createMerkleRootConfigTx = await alphaVault.createMerkleRootConfig(
    tree.getRoot(),
    version,
    payer.publicKey
  );

  // 4. Send transaction
  console.log("Sending transaction");
  const txHash = await sendAndConfirmTransaction(
    connection,
    createMerkleRootConfigTx,
    [payer]
  );
  console.log(txHash);
}

// Permissioned alpha vault
const vault = new PublicKey("ARGqVVUPPqtqH9UeBHvYsv7AtZv623YdEaEziZ1pdDUs");
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);
const whitelistWalletCsvFilepath =
  "src/examples/permissioned/whitelist_wallet.csv";

/**
 * This example shows how to close an escrow account and get rental back. Close escrow can only happen after vesting is complete, and escrow have claimed all the bought token.
 */
createMerkleRootConfig(vault, whitelistWalletCsvFilepath, payer)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
