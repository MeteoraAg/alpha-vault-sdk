import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { ALPHA_VAULT_PROGRAM_ID, loadKeypairFromFile } from "../utils";
import { AlphaVault } from "../../alpha-vault";
import BN from "bn.js";
import dotenv from "dotenv";
import Decimal from "decimal.js";
import { deriveMerkleRootConfig } from "../../alpha-vault/helper";
import { createMerkleTree, loadWhitelistWalletCsv } from "./utils";

dotenv.config();

async function depositToPermissionedAlphaVault(
  vault: PublicKey,
  depositAmount: BN,
  csvPath: string,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const alphaVault = await AlphaVault.create(connection, vault);

  // 1. Load whitelisted wallet
  const whitelistedWallets = await loadWhitelistWalletCsv(csvPath);

  // 2. Create merkle tree
  const tree = await createMerkleTree(
    connection,
    alphaVault,
    whitelistedWallets
  );

  // 3. Get wallet proof info
  const depositorWhitelistInfo = whitelistedWallets.find((w) =>
    w.wallet.equals(payer.publicKey)
  );
  const quoteMint = await connection.getTokenSupply(alphaVault.vault.quoteMint);
  const toNativeAmountMultiplier = new Decimal(10 ** quoteMint.value.decimals);

  const nativeDepositCap = new BN(
    depositorWhitelistInfo.depositCap.mul(toNativeAmountMultiplier).toString()
  );

  const depositorProof = tree
    .getProof(payer.publicKey, nativeDepositCap)
    .map((buffer) => {
      return Array.from(new Uint8Array(buffer));
    });

  const [merkleRootConfig] = deriveMerkleRootConfig(
    alphaVault.pubkey,
    new BN(0),
    ALPHA_VAULT_PROGRAM_ID
  );

  // 4. Deposit
  const depositTx = await alphaVault.deposit(depositAmount, payer.publicKey, {
    merkleRootConfig,
    maxCap: nativeDepositCap,
    proof: depositorProof,
  });

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
const vault = new PublicKey("ARGqVVUPPqtqH9UeBHvYsv7AtZv623YdEaEziZ1pdDUs");
const depositAmount = new BN(100_000);
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);
const whitelistWalletCsvFilepath =
  "src/examples/permissioned/whitelist_wallet.csv";

/**
 * This example shows how to deposit to permissioned alpha vault. Deposit can only happen before the deposit close.
 */
depositToPermissionedAlphaVault(
  vault,
  depositAmount,
  whitelistWalletCsvFilepath,
  payer
)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
