import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  Cluster,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { IDL } from "./idl";
import {
  ALPHA_VAULT_TREASURY_ID,
  MERKLE_PROOF_API,
  PROGRAM_ID,
} from "./constant";
import {
  DepositInfo,
  AlphaVaultProgram,
  Escrow,
  Vault,
  VaultMode,
  VaultParam,
  PoolType,
} from "./type";
import {
  deriveAlphaVault,
  deriveEscrow,
  fillDlmmTransaction,
  fillDynamicAmmTransaction,
  getOrCreateATAInstruction,
  unwrapSOLInstruction,
  wrapSOLInstruction,
} from "./helper";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";

type Opt = {
  cluster: Cluster;
};

export class AlphaVault {
  constructor(
    public program: AlphaVaultProgram,
    public pubkey: PublicKey,
    public vault: Vault,
    public mode: VaultMode
  ) {}

  /**
   * Creates an AlphaVault instance from a given vault address.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {PublicKey} vaultAddress - The address of the vault to create an instance for.
   * @param {Opt} [opt] - Optional configuration options.
   * @return {Promise<AlphaVault>} A promise resolving to the created AlphaVault instance.
   */
  public static async create(
    connection: Connection,
    vaultAddress: PublicKey,
    opt?: Opt
  ): Promise<AlphaVault> {
    const provider = new AnchorProvider(
      connection,
      {} as any,
      AnchorProvider.defaultOptions()
    );
    const program = new Program(
      IDL,
      PROGRAM_ID[opt?.cluster || "mainnet-beta"],
      provider
    );

    const vault = await program.account.vault.fetch(vaultAddress);
    const vaultMode =
      vault.vaultMode === 0 ? VaultMode.PRORATA : VaultMode.FCFS;

    return new AlphaVault(program, vaultAddress, vault, vaultMode);
  }

  /**
   * Creates a permissionless vault for dynamic amm pool.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {VaultParam} params - The vault parameters.
   * @param {PublicKey} owner - The public key of the vault owner.
   * @param {Opt} [opt] - Optional parameters.
   * @return {Promise<Transaction>} The transaction creating the vault.
   */
  public static async createPermissionlessVault(
    connection: Connection,
    {
      quoteMint,
      baseMint,
      poolType,
      vaultMode,
      poolAddress,
      config,
    }: VaultParam,
    owner: PublicKey,
    opt?: Opt
  ): Promise<Transaction> {
    const provider = new AnchorProvider(
      connection,
      {} as any,
      AnchorProvider.defaultOptions()
    );
    const program = new Program(
      IDL,
      PROGRAM_ID[opt?.cluster || "mainnet-beta"],
      provider
    );

    const [alphaVault] = deriveAlphaVault(
      config,
      poolAddress,
      program.programId
    );

    const method =
      vaultMode === VaultMode.PRORATA
        ? program.methods.initializeVaultWithProrataConfig
        : program.methods.initializeVaultWithFcfsConfig;

    const createTx = await method({
      poolType,
      baseMint,
      quoteMint,
      permissioned: false,
    })
      .accounts({
        vault: alphaVault,
        pool: poolAddress,
        funder: owner,
        config,
        quoteMint,
        program: program.programId,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const { blockhash, lastValidBlockHeight } =
      await program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner,
    }).add(createTx);
  }

  /**
   * Retrieves a list of all FCFS vault configurations.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {Opt} [opt] - Optional parameters (e.g., cluster).
   * @return {Promise<fcfsVaultConfig[]>} A promise containing a list of FCFS vault configurations.
   */
  public static async getFcfsConfigs(connection: Connection, opt?: Opt) {
    const provider = new AnchorProvider(
      connection,
      {} as any,
      AnchorProvider.defaultOptions()
    );
    const program = new Program(
      IDL,
      PROGRAM_ID[opt?.cluster || "mainnet-beta"],
      provider
    );

    return program.account.fcfsVaultConfig.all();
  }

  /**
   * Retrieves a list of all prorata vault configurations.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {Opt} [opt] - Optional configuration options.
   * @return {Promise<prorataVaultConfig[]>} A promise containing a list of prorata vault configurations.
   */
  public static async getProrataConfigs(connection: Connection, opt?: Opt) {
    const provider = new AnchorProvider(
      connection,
      {} as any,
      AnchorProvider.defaultOptions()
    );
    const program = new Program(
      IDL,
      PROGRAM_ID[opt?.cluster || "mainnet-beta"],
      provider
    );

    return program.account.prorataVaultConfig.all();
  }

  /**
   * Refreshes the state of the Alpha Vault by fetching the latest vault data.
   *
   * @return {void} No return value, updates the internal state of the Alpha Vault.
   */
  public async refreshState() {
    this.vault = await this.program.account.vault.fetch(this.pubkey);
  }

  /**
   * Retrieves the escrow account associated with the given owner.
   *
   * @param {PublicKey} owner - The public key of the owner.
   * @return {Promise<Escrow | null>} A promise containing the escrow account, or null if not found.
   */
  public async getEscrow(owner: PublicKey): Promise<Escrow | null> {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);
    const escrowAccount = await this.program.account.escrow.fetchNullable(
      escrow
    );

    return escrowAccount;
  }

  /**
   * Deposits a specified amount of tokens into the vault.
   *
   * @param {BN} maxAmount - The maximum amount of tokens to deposit.
   * @param {PublicKey} owner - The public key of the owner's wallet.
   * @param {Opt} [opt] - Optional parameters for the transaction.
   * @return {Promise<Transaction>} A promise that resolves to the deposit transaction.
   */
  public async deposit(
    maxAmount: BN,
    owner: PublicKey,
    opt?: Opt
  ): Promise<Transaction> {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);
    const escrowAccount = await this.program.account.escrow.fetchNullable(
      escrow
    );

    const preInstructions: TransactionInstruction[] = [];
    if (!escrowAccount) {
      if (this.vault.permissioned === 1) {
        const merkleProofApi = MERKLE_PROOF_API[opt?.cluster || "mainnet-beta"];
        const merkleData = await fetch(
          `${merkleProofApi}/${this.pubkey.toBase58()}/${owner.toBase58()}`
        ).then((res) => res.json());
        const { merkle_root_config, max_cap, proof } = merkleData as {
          merkle_root_config: string;
          max_cap: number;
          proof: number[][];
        };
        const createEscrowTx = await this.program.methods
          .createPermissionedEscrow(new BN(max_cap), proof)
          .accounts({
            merkleRootConfig: merkle_root_config,
            vault: this.pubkey,
            pool: this.vault.pool,
            escrow,
            owner,
            payer: owner,
            systemProgram: SystemProgram.programId,
            escrowFeeReceiver: ALPHA_VAULT_TREASURY_ID,
          })
          .instruction();
        preInstructions.push(createEscrowTx);
      } else {
        const createEscrowTx = await this.program.methods
          .createNewEscrow()
          .accounts({
            vault: this.pubkey,
            escrow,
            owner,
            payer: owner,
            systemProgram: SystemProgram.programId,
            pool: this.vault.pool,
            escrowFeeReceiver: ALPHA_VAULT_TREASURY_ID,
          })
          .instruction();
        preInstructions.push(createEscrowTx);
      }
    }

    const [
      { ataPubKey: sourceToken, ix: createSourceTokenIx },
      { ix: createBaseTokenIx },
      { ix: createTokenVaultIx },
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.vault.quoteMint,
        owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.vault.baseMint,
        owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.vault.quoteMint,
        this.pubkey,
        owner
      ),
    ]);
    createSourceTokenIx && preInstructions.push(createSourceTokenIx);
    createBaseTokenIx && preInstructions.push(createBaseTokenIx);
    createTokenVaultIx && preInstructions.push(createTokenVaultIx);

    const postInstructions: TransactionInstruction[] = [];
    if (this.vault.quoteMint.equals(NATIVE_MINT)) {
      preInstructions.push(
        ...wrapSOLInstruction(owner, sourceToken, BigInt(maxAmount.toString()))
      );
      postInstructions.push(unwrapSOLInstruction(owner));
    }

    const depositTx = await this.program.methods
      .deposit(maxAmount)
      .accounts({
        vault: this.pubkey,
        escrow,
        sourceToken,
        tokenVault: this.vault.tokenVault,
        tokenMint: this.vault.quoteMint,
        pool: this.vault.pool,
        owner,
      })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner,
    }).add(depositTx);
  }

  /**
   * Withdraws a specified amount of tokens from the vault.
   *
   * @param {BN} amount - The amount of tokens to withdraw.
   * @param {PublicKey} owner - The public key of the owner's wallet.
   * @return {Promise<Transaction>} A promise that resolves to the withdraw transaction.
   */
  public async withdraw(amount: BN, owner: PublicKey) {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubKey: destinationToken, ix: createDestinationTokenIx } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        this.vault.quoteMint,
        owner
      );
    createDestinationTokenIx && preInstructions.push(createDestinationTokenIx);

    const withdrawTx = await this.program.methods
      .withdraw(amount)
      .accounts({
        vault: this.pubkey,
        destinationToken,
        escrow,
        owner,
        pool: this.vault.pool,
        tokenVault: this.vault.tokenVault,
        tokenMint: this.vault.quoteMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();

    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner,
    }).add(withdrawTx);
  }

  /**
   * Withdraws the remaining quote from the vault.
   *
   * @param {PublicKey} owner - The public key of the owner's wallet.
   * @return {Promise<Transaction>} A promise that resolves to the withdraw transaction.
   */
  public async withdrawRemainingQuote(owner: PublicKey) {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubKey: destinationToken, ix: createDestinationTokenIx } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        this.vault.quoteMint,
        owner
      );
    createDestinationTokenIx && preInstructions.push(createDestinationTokenIx);

    const withdrawRemainingTx = await this.program.methods
      .withdrawRemainingQuote()
      .accounts({
        vault: this.pubkey,
        escrow,
        owner,
        destinationToken,
        pool: this.vault.pool,
        tokenVault: this.vault.tokenVault,
        tokenMint: this.vault.quoteMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();

    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner,
    }).add(withdrawRemainingTx);
  }

  /**
   * Claims bought token from the vault.
   *
   * @param {PublicKey} owner - The public key of the owner's wallet.
   * @return {Promise<Transaction>} A promise that resolves to the claim transaction.
   */
  public async claimToken(owner: PublicKey) {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubKey: destinationToken, ix: createDestinationTokenIx } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        this.vault.baseMint,
        owner
      );
    createDestinationTokenIx && preInstructions.push(createDestinationTokenIx);

    const claimTokenTx = await this.program.methods
      .claimToken()
      .accounts({
        vault: this.pubkey,
        escrow,
        owner,
        destinationToken,
        tokenOutVault: this.vault.tokenOutVault,
        tokenMint: this.vault.baseMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();

    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner,
    }).add(claimTokenTx);
  }

  /**
   * Crank the vault to buy tokens from the pool.
   *
   * @param {PublicKey} payer - The public key of the payer's wallet.
   */
  public async fillVault(payer: PublicKey) {
    const poolType = this.vault.poolType;

    if (poolType === PoolType.DYNAMIC) {
      return fillDynamicAmmTransaction(
        this.program,
        this.pubkey,
        this.vault,
        payer
      );
    } else {
      return fillDlmmTransaction(this.program, this.pubkey, this.vault, payer);
    }
  }

  /**
   * Close the escrow account.
   *
   * @param {PublicKey} owner - The public key of the owner's wallet.
   * @return {Promise<Transaction>} A promise that resolves to the close escrow transaction.
   */
  public async closeEscrow(owner: PublicKey) {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);

    const closeEscrowTx = await this.program.methods
      .closeEscrow()
      .accounts({
        vault: this.pubkey,
        escrow,
        owner,
        rentReceiver: owner,
      })
      .transaction();

    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner,
    }).add(closeEscrowTx);
  }

  /**
   * Retrieves deposit information for the given escrow account.
   *
   * @param {Escrow | null} escrowAccount - The escrow account to retrieve deposit information for.
   * @return {Promise<DepositInfo>} A promise that resolves to the deposit information, including total deposit, total filled, and total returned.
   */
  public async getDepositInfo(
    escrowAccount: Escrow | null
  ): Promise<DepositInfo> {
    if (!escrowAccount) {
      return {
        totalDeposit: new BN(0),
        totalFilled: new BN(0),
        totalReturned: new BN(0),
      };
    }

    const totalReturned =
      this.vault.vaultMode === VaultMode.PRORATA &&
      this.vault.totalDeposit.gt(this.vault.maxBuyingCap)
        ? escrowAccount.totalDeposit.sub(
            escrowAccount.totalDeposit
              .mul(this.vault.maxBuyingCap)
              .div(this.vault.totalDeposit)
          )
        : new BN(0);
    const totalFilled = escrowAccount.totalDeposit.sub(totalReturned);

    return {
      totalDeposit: escrowAccount.totalDeposit,
      totalFilled,
      totalReturned,
    };
  }
}
