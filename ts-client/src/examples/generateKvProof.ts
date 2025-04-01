import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import Decimal from "decimal.js";
import dotenv from "dotenv";
import fs from "fs";
import { AlphaVault, deriveMerkleRootConfig, PROGRAM_ID } from "../alpha-vault";
import {
  createMerkleTree,
  loadWhitelistWalletCsv,
} from "./permissioned/merkleRoot/utils";

dotenv.config();

async function generateKvProof(
  vault: PublicKey,
  csvPath: string,
  chunkSize: number
) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const alphaVault = await AlphaVault.create(connection, vault);

  // 1. Load whitelist wallet from csv file
  const whitelistWallets = await loadWhitelistWalletCsv(csvPath);
  console.log("Loaded whitelist wallets");
  // console.log(whitelistWallets);

  const chunkCount = Math.floor(whitelistWallets.length / chunkSize + 1);

  const quoteDecimal = await connection
    .getTokenSupply(alphaVault.vault.quoteMint)
    .then((supply) => supply.value.decimals);

  const toNativeAmountMultiplier = 10 ** quoteDecimal;

  console.log(`${chunkCount} chunks`);

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * chunkSize;
    const endOffset = Math.min(offset + chunkSize, whitelistWallets.length);
    const chunk = whitelistWallets.slice(offset, endOffset);

    const tree = await createMerkleTree(connection, alphaVault, chunk);

    console.log("Version", i);
    // console.log(new Uint8Array(tree.getRoot()));

    const [merkleRootConfig] = deriveMerkleRootConfig(
      alphaVault.pubkey,
      new BN(i),
      new PublicKey(PROGRAM_ID["mainnet-beta"])
    );

    const obj: {
      [key: string]: {
        merkle_root_config: String;
        max_cap: number;
        proof: number[][];
      };
    } = {};

    for (const w of chunk) {
      const nativeDepositCap = new BN(
        w.depositCap.mul(new Decimal(toNativeAmountMultiplier)).toString()
      );
      const proof = tree.getProof(w.wallet, nativeDepositCap);
      obj[w.wallet.toBase58()] = {
        merkle_root_config: merkleRootConfig.toBase58(),
        max_cap: nativeDepositCap.toNumber(),
        proof: proof.map((buffer) => {
          return Array.from(new Uint8Array(buffer));
        }),
      };
    }

    // Simulation check
    if (i === chunkCount - 1) {
      const amount = new BN(1_000);

      const wallet = chunk[chunk.length - 1].wallet;
      const proof = obj[wallet.toBase58()].proof;
      const merkleRootConfig = new PublicKey(
        obj[wallet.toBase58()].merkle_root_config
      );
      const maxCap = new BN(obj[wallet.toBase58()].max_cap);

      const tx = await alphaVault.deposit(amount, wallet, {
        proof,
        merkleRootConfig,
        maxCap,
      });

      console.log(
        tx
          .serialize({
            requireAllSignatures: false,
          })
          .toString("base64")
      );
    }

    fs.writeFileSync(`${i}.json`, JSON.stringify(obj), "utf-8");
  }
}

// Permissioned alpha vault
const vault = new PublicKey("8SqYXv36CsUAtbCcg3EtqiGepkS2gV4pCHsM6MdaEqEL");
const whitelistWalletCsvFilepath = "./ts-client/src/whitelist_wallet.csv";
const chunkSize = 10_000;

generateKvProof(vault, whitelistWalletCsvFilepath, chunkSize)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
