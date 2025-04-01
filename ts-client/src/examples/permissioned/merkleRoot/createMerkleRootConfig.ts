import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { loadKeypairFromFile } from "../../utils";
import {
  AlphaVault,
  deriveMerkleRootConfig,
  PROGRAM_ID,
} from "../../../alpha-vault";
import dotenv from "dotenv";
import { createMerkleTree, loadWhitelistWalletCsv } from "./utils";
import { BN } from "bn.js";
import fs from "fs";
import Decimal from "decimal.js";

dotenv.config();

async function createMerkleRootConfig(
  vault: PublicKey,
  csvPath: string,
  payer: Keypair
) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const alphaVault = await AlphaVault.create(connection, vault);

  // 1. Load whitelist wallet from csv file
  const whitelistWallets = await loadWhitelistWalletCsv(csvPath);
  console.log("Loaded whitelist wallets");
  // console.log(whitelistWallets);

  const chunkCount = Math.floor(whitelistWallets.length / 10_000 + 1);

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * 10_000;
    const endOffset = Math.min(offset + 10_000, whitelistWallets.length);
    const chunk = whitelistWallets.slice(offset, endOffset);

    const tree = await createMerkleTree(connection, alphaVault, chunk);

    console.log("Version", i);
    console.log(new Uint8Array(tree.getRoot()));

    const [merkleRootConfig] = deriveMerkleRootConfig(
      alphaVault.pubkey,
      new BN(i),
      new PublicKey(PROGRAM_ID["mainnet-beta"])
    );

    // const obj: {
    //   [key: string]: {
    //     merkle_root_config: String;
    //     max_cap: number;
    //     proof: number[][];
    //   };
    // } = {};

    // for (const w of chunk) {
    //   const proof = tree.getProof(
    //     w.wallet,
    //     new BN(w.depositCap.mul(new Decimal(10 ** 6)).toString())
    //   );
    //   obj[w.wallet.toBase58()] = {
    //     merkle_root_config: merkleRootConfig.toBase58(),
    //     max_cap: new BN(
    //       w.depositCap.mul(new Decimal(10 ** 6)).toString()
    //     ).toNumber(),
    //     proof: proof.map((buffer) => {
    //       return Array.from(new Uint8Array(buffer));
    //     }),
    //   };
    // }

    // fs.writeFileSync(`${i}.json`, JSON.stringify(obj), "utf-8");

    // console.log(chunk[chunk.length - 1].wallet.toBase58());

    if (i == 0) {
      const depositAmount = new BN(5000000000);
      const owner = new PublicKey(
        "DqoWzQb5Pa7fEJXpxzdk7rG54QBRHisoJjzcNCxEhGSF"
      );
      const proof = tree.getProof(owner, depositAmount).map((buffer) => {
        return Array.from(new Uint8Array(buffer));
      });

      const [merkleRootConfig] = deriveMerkleRootConfig(
        alphaVault.pubkey,
        new BN(i),
        new PublicKey(PROGRAM_ID["mainnet-beta"])
      );

      // 4. Deposit
      const depositTx = await alphaVault.deposit(depositAmount, owner, {
        merkleRootConfig,
        maxCap: depositAmount,
        proof,
      });

      console.log(
        depositTx
          .serialize({
            verifySignatures: false,
          })
          .toString("base64")
      );
    }
  }

  // 2. Create merkle tree
  // const tree = await createMerkleTree(connection, alphaVault, whitelistWallets);

  // 3. Create merkle root config
  // If the tree grew too large, one can partition it into multiple tree by setting different version
  // const version = new BN(0);
  // const createMerkleRootConfigTx = await alphaVault.createMerkleRootConfig(
  //   tree.getRoot(),
  //   version,
  //   payer.publicKey
  // );

  // 4. Send transaction
  // console.log("Sending transaction");
  // const txHash = await sendAndConfirmTransaction(
  //   connection,
  //   createMerkleRootConfigTx,
  //   [payer]
  // );
  // console.log(txHash);
}

// Permissioned alpha vault
const vault = new PublicKey("E949GqHKP9do58cqgwoDygaLjj1aLGM1VEmdmktzSN7Y");
// const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);
const whitelistWalletCsvFilepath = "./ts-client/src/whitelist_wallet.csv";

/**
 * This example shows how to close an escrow account and get rental back. Close escrow can only happen after vesting is complete, and escrow have claimed all the bought token.
 */
createMerkleRootConfig(vault, whitelistWalletCsvFilepath, null)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
