import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { AlphaVault } from "../alpha-vault";

const connection = new Connection(clusterApiUrl("devnet"));

async function getAllDepositors(vault: PublicKey) {
  const alphaVault = await AlphaVault.create(connection, vault);
  const escrows = await alphaVault.program.account.escrow.all([
    {
      memcmp: {
        offset: 8,
        bytes: vault.toBase58(),
      },
    },
  ]);

  for (const escrow of escrows) {
    console.log("Wallet", escrow.account.owner.toBase58());
    const depositInfo = await alphaVault.getDepositInfo(escrow.account);
    console.log(depositInfo);
  }
}

// Alpha vault address
const vault = new PublicKey("AxRoXRwQgxyaQBMwQsTRrtQ9i9Hd59BKNZBycTcYru5Z");
getAllDepositors(vault).catch(console.error);
