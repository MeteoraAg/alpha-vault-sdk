import fs from "fs";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import BN, { max } from "bn.js";
import Decimal from "decimal.js";
import {
  AlphaVault,
  BalanceTree,
  DepositWithProofParams,
  deriveMerkleRootConfig,
  PROGRAM_ID,
  WalletDepositCap,
} from "../../alpha-vault";
import {
  createMerkleTree,
  ParsedWhitelistWallet,
} from "../../examples/permissioned/merkleRoot/utils";

export const keypairBuffer = fs.readFileSync(
  "../keys/localnet/admin-bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1.json",
  "utf-8"
);
export const connection = new Connection("http://127.0.0.1:8899", "confirmed");
export const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(keypairBuffer))
);
export const BASE_TOKEN_DECIMAL = 6;
export const MINT_AMOUNT = 100_000_000;

export const OWNER_ESCROW_CAP = 10;

export const OWNER_MERKLE_DEPOSIT_CAP = 100;
export const MERKLEONE_DEPOSIT_CAP = 1;

export function getAmountInLamports(
  amount: number | string,
  decimals: number
): BN {
  const amountD = new Decimal(amount);
  const amountLamports = amountD.mul(new Decimal(10 ** decimals));
  return new BN(amountLamports.toString());
}

export const airDropSol = async (
  connection: Connection,
  publicKey: PublicKey,
  amount = 1
) => {
  try {
    const airdropSignature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      },
      connection.commitment
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export async function createBaseAndQuoteToken(
  connection: Connection,
  wallet: Keypair
) {
  const baseToken = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    null,
    BASE_TOKEN_DECIMAL,
    Keypair.generate(),
    null,
    TOKEN_PROGRAM_ID
  );

  const userBaseAcc = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    baseToken,
    wallet.publicKey,
    false,
    "confirmed",
    {
      commitment: "confirmed",
    },
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const userBase = userBaseAcc.address;

  const userQuoteAcc = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    NATIVE_MINT,
    wallet.publicKey,
    false,
    "confirmed",
    {
      commitment: "confirmed",
    },
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const userQuote = userQuoteAcc.address;

  await mintTo(
    connection,
    wallet,
    baseToken,
    userBase,
    wallet.publicKey,
    MINT_AMOUNT * 10 ** BASE_TOKEN_DECIMAL,
    [],
    {
      commitment: "confirmed",
    },
    TOKEN_PROGRAM_ID
  );

  return {
    baseToken,
    quoteToken: NATIVE_MINT,
    userBase,
    userQuote,
  };
}

export async function createEscrowForAuthority(
  alphaVault: AlphaVault,
  walletDepositCap: WalletDepositCap[]
) {
  const createStakeEscrowIxs =
    await alphaVault.createMultipleStakeEscrowByAuthorityInstructions(
      walletDepositCap,
      keypair.publicKey
    );
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const createEscrowTx = new Transaction({
    feePayer: keypair.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(...createStakeEscrowIxs);
  const createStakeEscrowTxHash = await sendAndConfirmTransaction(
    connection,
    createEscrowTx,
    [keypair]
  );
  console.log("🚀 ~ createStakeEscrowTxHash:", createStakeEscrowTxHash);
}

export async function createMerkle(
  alphaVault: AlphaVault,
  payer: Keypair,
  walletList: ParsedWhitelistWallet[]
): Promise<{
  tree: BalanceTree;
  merkleRootConfig: PublicKey;
}> {
  const tree = await createMerkleTree(connection, alphaVault, walletList);

  const version = new BN(0);

  const createMerkleProof = await alphaVault.createMerkleRootConfig(
    tree.getRoot(),
    version,
    payer.publicKey
  );
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const createMerkleProofTx = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: payer.publicKey,
  }).add(createMerkleProof);
  const createMerkleProofTxHash = await sendAndConfirmTransaction(
    connection,
    createMerkleProofTx,
    [payer]
  );
  console.log("🚀 ~ createMerkleProofTxHash:", createMerkleProofTxHash);

  const [merkleRootConfig] = deriveMerkleRootConfig(
    alphaVault.pubkey,
    version,
    new PublicKey(PROGRAM_ID["localhost"])
  );

  return {
    tree,
    merkleRootConfig,
  };
}

export async function createIndividualMerkle(
  tree: BalanceTree,
  wallet: Keypair,
  walletList: ParsedWhitelistWallet[]
) {
  const depositorWhitelistInfo = walletList.find((w) =>
    w.wallet.equals(wallet.publicKey)
  );
  if (!depositorWhitelistInfo) return null;

  const toNativeAmountMultiplier = new Decimal(10 ** 9);

  const maxCap = new BN(
    depositorWhitelistInfo.depositCap.mul(toNativeAmountMultiplier).toString()
  );

  const proof = tree.getProof(wallet.publicKey, maxCap).map((buffer) => {
    return Array.from(new Uint8Array(buffer));
  });

  return {
    proof,
    maxCap,
  };
}

export async function waitFor(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
