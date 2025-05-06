import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Cluster,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ALPHA_VAULT_TREASURY_ID,
  Permissionless,
  PermissionWithAuthority,
  PermissionWithMerkleProof,
  PROGRAM_ID,
  WhitelistMode,
} from "./constant";
import {
  createProgram,
  deriveAlphaVault,
  deriveEscrow,
  deriveMerkleRootConfig,
  fillDlmmTransaction,
  fillDammTransaction,
  getOrCreateATAInstruction,
  unwrapSOLInstruction,
  wrapSOLInstruction,
} from "./helper";
import IDL from "./alpha_vault.json";
import {
  AlphaVaultProgram,
  CustomizableFcfsVaultParams,
  CustomizableProrataVaultParams,
  DepositInfo,
  DepositWithProofParams,
  Escrow,
  PoolType,
  Vault,
  VaultMode,
  VaultParam,
  WalletDepositCap,
} from "./type";

export * from "./constant";
export * from "./helper";
export * from "./merkle_tree/";
export * from "./type";

export type Opt = {
  cluster: Cluster | "localhost";
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
    const program = createProgram(connection, opt);

    const vault = await program.account.vault.fetch(vaultAddress);
    const vaultMode =
      vault.vaultMode === 0 ? VaultMode.PRORATA : VaultMode.FCFS;

    return new AlphaVault(program, vaultAddress, vault, vaultMode);
  }

  /**
   * Creates a customizable FCFS vault
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {CustomizableFcfsVaultParams} vaultParam - The parameters for creating the vault.
   * @param {PublicKey} owner - The owner of the vault.
   * @param {Opt} [opt] - Optional configuration options.
   * @return {Promise<Transaction>} The transaction for creating the vault.
   */
  public static async createCustomizableFcfsVault(
    connection: Connection,
    vaultParam: CustomizableFcfsVaultParams,
    owner: PublicKey,
    opt?: Opt
  ) {
    const program = createProgram(connection, opt);

    const {
      poolAddress,
      poolType,
      baseMint,
      quoteMint,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      maxDepositingCap,
      individualDepositingCap,
      escrowFee,
      whitelistMode,
    } = vaultParam;

    const [alphaVault] = deriveAlphaVault(
      owner,
      poolAddress,
      program.programId
    );

    const createTx = await program.methods
      .initializeFcfsVault({
        poolType,
        baseMint,
        quoteMint,
        depositingPoint,
        startVestingPoint,
        endVestingPoint,
        maxDepositingCap,
        individualDepositingCap,
        escrowFee,
        whitelistMode,
      })
      .accountsPartial({
        base: owner,
        vault: alphaVault,
        pool: poolAddress,
        funder: owner,
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
   * Creates a customizable Prorata vault.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {CustomizableProrataVaultParams} vaultParam - The parameters for creating the vault.
   * @param {PublicKey} owner - The owner of the vault.
   * @param {Opt} [opt] - Optional configuration options.
   * @return {Promise<Transaction>} The transaction for creating the vault.
   */
  public static async createCustomizableProrataVault(
    connection: Connection,
    vaultParam: CustomizableProrataVaultParams,
    owner: PublicKey,
    opt?: Opt
  ) {
    const program = createProgram(connection, opt);

    const {
      poolAddress,
      poolType,
      baseMint,
      quoteMint,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      maxBuyingCap,
      escrowFee,
      whitelistMode,
    } = vaultParam;

    const [alphaVault] = deriveAlphaVault(
      owner,
      poolAddress,
      program.programId
    );

    const createTx = await program.methods
      .initializeProrataVault({
        poolType,
        baseMint,
        quoteMint,
        depositingPoint,
        startVestingPoint,
        endVestingPoint,
        maxBuyingCap,
        escrowFee,
        whitelistMode,
      })
      .accountsPartial({
        base: owner,
        vault: alphaVault,
        pool: poolAddress,
        funder: owner,
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
   * Creates a permissionless vault for dynamic amm / dlmm pool.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {VaultParam} params - The vault parameters.
   * @param {PublicKey} owner - The public key of the vault owner.
   * @param {Opt} [opt] - Optional parameters.
   * @return {Promise<Transaction>} The transaction creating the vault.
   */
  public static async createPermissionlessVault(
    connection: Connection,
    vaultParam: VaultParam,
    owner: PublicKey,
    opt?: Opt
  ): Promise<Transaction> {
    const program = createProgram(connection, opt);
    return AlphaVault.createVault(program, vaultParam, owner, Permissionless);
  }

  /**
   * Creates a permissioned vault for dynamic amm / dlmm pool. Vault created with this function will require merkle proof to be passed along when create stake escrow.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {VaultParam} params - The vault parameters.
   * @param {PublicKey} owner - The public key of the vault owner.
   * @param {Opt} [opt] - Optional parameters.
   * @return {Promise<Transaction>} The transaction creating the vault.
   */
  public static async createPermissionedVaultWithMerkleProof(
    connection: Connection,
    vaultParam: VaultParam,
    owner: PublicKey,
    opt?: Opt
  ): Promise<Transaction> {
    const program = createProgram(connection, opt);
    return AlphaVault.createVault(
      program,
      vaultParam,
      owner,
      PermissionWithMerkleProof
    );
  }

  /**
   * Creates a permissioned vault for dynamic amm / dlmm pool. Vault created with this function will require vault creator to create stake escrow for each users.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {VaultParam} params - The vault parameters.
   * @param {PublicKey} owner - The public key of the vault owner.
   * @param {Opt} [opt] - Optional parameters.
   * @return {Promise<Transaction>} The transaction creating the vault.
   */
  public static async createPermissionedVaultWithAuthorityFund(
    connection: Connection,
    vaultParam: VaultParam,
    owner: PublicKey,
    opt?: Opt
  ): Promise<Transaction> {
    const program = createProgram(connection, opt);
    return AlphaVault.createVault(
      program,
      vaultParam,
      owner,
      PermissionWithAuthority
    );
  }

  /**
   * Retrieves a list of all FCFS vault configurations.
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {Opt} [opt] - Optional parameters (e.g., cluster).
   * @return {Promise<fcfsVaultConfig[]>} A promise containing a list of FCFS vault configurations.
   */
  public static async getFcfsConfigs(connection: Connection, opt?: Opt) {
    const program = createProgram(connection, opt);
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
    const program = createProgram(connection, opt);
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
    const escrowAccount =
      await this.program.account.escrow.fetchNullable(escrow);

    return escrowAccount;
  }

  /**
   * Creates a stake escrow account by vault authority. Only applicable with PermissionWithAuthority whitelist mode
   *
   * @param {BN} maxAmount - The maximum amount for the escrow.
   * @param {PublicKey} owner - The public key of the owner.
   * @param {PublicKey} vaultAuthority - The public key of the vault authority.
   * @return {Promise<Transaction>} A promise that resolves to the transaction for creating a stake escrow.
   */
  public async createStakeEscrowByAuthority(
    maxAmount: BN,
    owner: PublicKey,
    vaultAuthority: PublicKey
  ): Promise<Transaction> {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);

    const createStakeEscrowIx = await this.program.methods
      .createPermissionedEscrowWithAuthority(maxAmount)
      .accountsPartial({
        vault: this.pubkey,
        pool: this.vault.pool,
        escrow,
        owner,
        payer: vaultAuthority,
      })
      .instruction();

    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash("confirmed");

    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: vaultAuthority,
    }).add(createStakeEscrowIx);
  }

  /**
   * Creates a stake escrow account by vault authority. Only applicable with PermissionWithAuthority whitelist mode
   *
   * @param {BN} maxAmount - The maximum amount for the escrow.
   * @param {PublicKey[]} owners - The public key of the owners.
   * @param {PublicKey} vaultAuthority - The public key of the vault authority.
   * @return {Promise<Transaction>} A promise that resolves to the transaction for creating a stake escrow.
   */
  public async createMultipleStakeEscrowByAuthorityInstructions(
    walletDepositCap: WalletDepositCap[],
    vaultAuthority: PublicKey
  ): Promise<TransactionInstruction[]> {
    return Promise.all(
      walletDepositCap.map((individualCap) => {
        const owner = individualCap.address;
        const maxAmount = individualCap.maxAmount;

        const [escrow] = deriveEscrow(
          this.pubkey,
          owner,
          this.program.programId
        );

        return this.program.methods
          .createPermissionedEscrowWithAuthority(maxAmount)
          .accountsPartial({
            vault: this.pubkey,
            pool: this.vault.pool,
            escrow,
            owner,
            payer: vaultAuthority,
          })
          .instruction();
      })
    );
  }

  /**
   * Deposits a specified amount of tokens into the vault.
   *
   * @param {BN} maxAmount - The maximum amount of tokens to deposit.
   * @param {PublicKey} owner - The public key of the owner's wallet.
   * @param {DepositWithProofParams} [depositProof] - The deposit proof parameters. Required for permisisoned vault.
   * @return {Promise<Transaction>} A promise that resolves to the deposit transaction.
   */
  public async deposit(
    maxAmount: BN,
    owner: PublicKey,
    depositProof?: DepositWithProofParams
  ): Promise<Transaction> {
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);
    const escrowAccount =
      await this.program.account.escrow.fetchNullable(escrow);

    const preInstructions: TransactionInstruction[] = [];
    if (!escrowAccount) {
      if (this.vault.whitelistMode === PermissionWithMerkleProof) {
        const { merkleRootConfig, maxCap, proof } = depositProof;

        const createEscrowTx = await this.program.methods
          .createPermissionedEscrow(maxCap, proof)
          .accountsPartial({
            merkleRootConfig,
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
      } else if (this.vault.whitelistMode === Permissionless) {
        const createEscrowTx = await this.program.methods
          .createNewEscrow()
          .accountsPartial({
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
      .accountsPartial({
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
      .accountsPartial({
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
      .accountsPartial({
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
      .accountsPartial({
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
   *
   * @returns {Promise<Transaction | null>} A promise that resolves to the fill vault transaction or null if it's DLMM pool and out of liquidity.
   */
  public async fillVault(payer: PublicKey): Promise<Transaction | null> {
    const poolType = this.vault.poolType;

    if (poolType === PoolType.DAMM) {
      return fillDammTransaction(this.program, this.pubkey, this.vault, payer);
    } else if (poolType === PoolType.DAMMV2) {
    } else {
      return fillDlmmTransaction(this.program, this.pubkey, this.vault, payer);
    }
  }

  /**
   * Creates a Merkle root configuration for the vault.
   *
   * @param {Buffer} root - The Merkle root to be configured.
   * @param {BN} version - The version of the Merkle root configuration.
   * @return {Transaction} A transaction to create the Merkle root configuration.
   */
  public async createMerkleRootConfig(
    root: Buffer,
    version: BN,
    vaultCreator: PublicKey
  ) {
    const [merkleRootConfig] = deriveMerkleRootConfig(
      this.pubkey,
      version,
      this.program.programId
    );

    return this.program.methods
      .createMerkleRootConfig({
        root: Array.from(new Uint8Array(root)),
        version,
      })
      .accountsPartial({
        merkleRootConfig,
        vault: this.pubkey,
        admin: vaultCreator,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
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
      .accountsPartial({
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

    const remainingAmount = this.vault.totalDeposit.sub(
      this.vault.swappedAmount
    );
    const totalReturned = remainingAmount
      .mul(escrowAccount.totalDeposit)
      .div(this.vault.totalDeposit);

    const totalFilled = escrowAccount.totalDeposit.sub(totalReturned);

    return {
      totalDeposit: escrowAccount.totalDeposit,
      totalFilled,
      totalReturned,
    };
  }

  private static async createVault(
    program: AlphaVaultProgram,
    {
      quoteMint,
      baseMint,
      poolType,
      vaultMode,
      poolAddress,
      config,
    }: VaultParam,
    owner: PublicKey,
    whitelistMode: WhitelistMode
  ) {
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
      whitelistMode,
    })
      .accountsPartial({
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
   * Retrieves a list of all escrows by owner
   *
   * @param {Connection} connection - The Solana connection to use.
   * @param {PublicKey} owner - The owner of escrows.
   * @param {Opt} [opt] - Optional configuration options.
   * @return {Promise<Esrow[]>} A promise containing a list of escrow
   */
  public static async getEscrowByOwner(
    connection: Connection,
    owner: PublicKey,
    opt?: Opt
  ) {
    const program = createProgram(connection, opt);
    return program.account.escrow.all([
      {
        memcmp: {
          bytes: owner.toBase58(),
          offset: 40,
        },
      },
    ]);
  }

  public static async getVault(
    connection: Connection,
    vaultAddress: PublicKey,
    opt?: Opt
  ) {
    const program = createProgram(connection, opt);
    return program.account.vault.fetch(vaultAddress);
  }
}
