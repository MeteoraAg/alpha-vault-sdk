import { Connection, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { parse } from "csv-parse";
import path from "path";
import fs from "fs";
import { AlphaVault } from "../../alpha-vault";
import { BalanceTree } from "../../alpha-vault/merkle_tree";
import { BN } from "bn.js";

type WhitelistWallet = {
  wallet: String;
  deposit_cap: String;
};

type ParsedWhitelistWallet = {
  wallet: PublicKey;
  depositCap: Decimal;
};

export async function loadWhitelistWalletCsv(
  csvPath: string
): Promise<ParsedWhitelistWallet[]> {
  const csvFile = fs.readFileSync(csvPath, { encoding: "utf-8" });

  return new Promise((res, rej) => {
    parse(
      csvFile,
      {
        delimiter: ",",
        columns: ["wallet", "deposit_cap"],
      },
      (err, data: WhitelistWallet[]) => {
        if (err) {
          rej(err);
        } else {
          // Remove header
          data.shift();
          res(
            data.map((d) => {
              return {
                wallet: new PublicKey(d.wallet),
                depositCap: new Decimal(d.deposit_cap.toString()),
              };
            })
          );
        }
      }
    );
  });
}

export const createMerkleTree = async (
  connection: Connection,
  alphaVault: AlphaVault,
  whitelistedWallets: ParsedWhitelistWallet[]
) => {
  const quoteMint = await connection.getTokenSupply(alphaVault.vault.quoteMint);
  const toNativeAmountMultiplier = new Decimal(10 ** quoteMint.value.decimals);
  const tree = new BalanceTree(
    whitelistedWallets.map((info) => {
      return {
        account: info.wallet,
        maxCap: new BN(
          info.depositCap.mul(toNativeAmountMultiplier).toString()
        ),
      };
    })
  );

  return tree;
};
