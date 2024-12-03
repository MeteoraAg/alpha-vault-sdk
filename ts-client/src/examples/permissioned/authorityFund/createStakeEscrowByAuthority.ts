import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { loadKeypairFromFile } from "../../utils";
import BN from "bn.js";
import { AlphaVault, WalletDepositCap } from "../../../alpha-vault";

async function createStakeEscrowForWhitelistedWallets(
  connection: Connection,
  vault: PublicKey,
  vaultAuthority: Keypair,
  whitelistList: WalletDepositCap[]
) {
  const alphaVault = await AlphaVault.create(connection, vault, {
    cluster: "devnet",
  });

  const instructions =
    await alphaVault.createMultipleStakeEscrowByAuthorityInstructions(
      whitelistList,
      vaultAuthority.publicKey
    );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const tx = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: vaultAuthority.publicKey,
  }).add(...instructions);

  tx.sign(vaultAuthority);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
  });
  await connection.confirmTransaction(
    {
      signature,
      lastValidBlockHeight,
      blockhash,
    },
    "confirmed"
  );
  console.log(signature);
}

const connection = new Connection(clusterApiUrl("devnet"));
const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH);
// Alpha vault address
const vault = new PublicKey("Bm6NMNNzpFSPNkXt61GAEMJMRnw8UmrobQewmTvCwUqZ");
// Whitelisted wallet
const whitelistList: WalletDepositCap[] = [
  {
    address: new PublicKey("FXBXnxEEfwZJA1xnyJzKEhhJXmussKXKRdq5cAh19dbC"),
    maxAmount: new BN(100_000),
  },
  {
    address: new PublicKey("5unTfT2kssBuNvHPY6LbJfJpLqEcdMxGYLWHwShaeTLi"),
    maxAmount: new BN(200_000),
  },
];

/**
 * This example shows how to create stake escrow for whitelisted wallets for permissioned vault with authority fund
 */
createStakeEscrowForWhitelistedWallets(connection, vault, payer, whitelistList)
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
