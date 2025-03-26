import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Cluster,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ALPHA_VAULT_TREASURY_ID,
  DYNAMIC_AMM_PROGRAM_ID,
  PROGRAM_ID,
  VaultPoint,
  VaultState,
  WhitelistMode,
} from "./constant";
import {
  deriveAlphaVault,
  deriveEscrow,
  deriveMerkleRootConfig,
  fillDlmmTransaction,
  fillDynamicAmmTransaction,
  getOrCreateATAInstruction,
  unwrapSOLInstruction,
  wrapSOLInstruction,
} from "./helper";
import { IDL } from "./idl";
import {
  ActivationType,
  AlphaVaultProgram,
  Clock,
  ClockLayout,
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
import { AmmIdl, PoolState } from "@meteora-ag/dynamic-amm-sdk";
import { IDL as DlmmIdl, LBCLMM_PROGRAM_IDS, LbPair } from "@meteora-ag/dlmm";

export * from "./constant";
export * from "./helper";
export * from "./merkle_tree/";
export * from "./type";

type Opt = {
  cluster: Cluster | "localhost";
};

export class AlphaVault {
  constructor(
    public program: AlphaVaultProgram,
    public pubkey: PublicKey,
    public vault: Vault,
    public activationPoint: BN,
    public preActivationDuration: BN,
    public clock: Clock,
    private opt?: Opt
  ) {}

  /** Getter */

  get mode() {
    return this.vault.vaultMode === 0 ? VaultMode.PRORATA : VaultMode.FCFS;
  }

  get vaultPoint(): VaultPoint {
    const firstJoinPoint = Number(this.vault.depositingPoint.toString());
    const lastJoinPoint = Number(
      this.activationPoint
        .sub(
          process.env.NODE_ENV === "test"
            ? new BN(5)
            : this.preActivationDuration
        ) // Time window for vault to purchase token from the pool
        .sub(
          process.env.NODE_ENV === "test"
            ? new BN(1)
            : new BN(
                this.vault.activationType === ActivationType.SLOT ? 750 : 5 * 60
              )
        )
        .toString()
    );
    const lastBuyingPoint = Number(
      this.activationPoint.sub(new BN(1)).toString()
    );
    const startVestingPoint = Number(this.vault.startVestingPoint.toString());
    const endVestingPoint = Number(this.vault.endVestingPoint.toString());

    return {
      firstJoinPoint,
      lastJoinPoint,
      lastBuyingPoint,
      startVestingPoint,
      endVestingPoint,
    };
  }

  get vaultState(): VaultState {
    const currentSlot = this.clock.slot.toNumber();
    const currentTimestamp = this.clock.unixTimestamp.toNumber();
    const {
      firstJoinPoint,
      lastJoinPoint,
      lastBuyingPoint,
      startVestingPoint,
      endVestingPoint,
    } = this.vaultPoint;
    let vaultState = VaultState.PREPARING;
    const currentPoint =
      this.vault.activationType === ActivationType.SLOT
        ? currentSlot
        : currentTimestamp;

    if (firstJoinPoint > currentPoint) {
      vaultState = VaultState.PREPARING;
    } else if (
      lastJoinPoint >= currentPoint &&
      firstJoinPoint <= currentPoint
    ) {
      vaultState = VaultState.DEPOSITING;
    } else if (
      lastJoinPoint < currentPoint &&
      lastBuyingPoint >= currentPoint
    ) {
      vaultState = VaultState.PURCHASING;
    } else if (
      lastBuyingPoint < currentPoint &&
      startVestingPoint > currentPoint
    ) {
      vaultState = VaultState.LOCKING;
    } else if (
      startVestingPoint <= currentPoint &&
      endVestingPoint > currentPoint
    ) {
      vaultState = VaultState.VESTING;
    } else if (endVestingPoint <= currentPoint) {
      vaultState = VaultState.ENDED;
    }

    return vaultState;
  }
  /** End Getter */

  /** Static Function */
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

    const accountsToFetch = [vaultAddress, SYSVAR_CLOCK_PUBKEY];
    const [vaultAccountBuffer, clockAccountBuffer] =
      await connection.getMultipleAccountsInfo(accountsToFetch);
    const vault: Vault = program.coder.accounts.decode(
      "vault",
      vaultAccountBuffer.data
    );
    const clockState: Clock = ClockLayout.decode(clockAccountBuffer.data);

    if (vault.poolType === PoolType.DLMM) {
      const dlmmProgram = new Program(
        DlmmIdl,
        LBCLMM_PROGRAM_IDS[opt.cluster],
        provider
      );
      const pool = (await dlmmProgram.account.lbPair.fetch(
        vault.pool
      )) as unknown as LbPair;
      return new AlphaVault(
        program,
        vaultAddress,
        vault,
        pool.activationPoint,
        pool.preActivationDuration,
        clockState,
        opt
      );
    } else {
      const ammProgram = new Program(AmmIdl, DYNAMIC_AMM_PROGRAM_ID, provider);
      const pool = (await ammProgram.account.pool.fetch(
        vault.pool
      )) as unknown as PoolState;
      return new AlphaVault(
        program,
        vaultAddress,
        vault,
        pool.bootstrapping.activationPoint,
        pool.bootstrapping.activationType === ActivationType.SLOT
          ? new BN(9000)
          : new BN(3600),
        clockState,
        opt
      );
    }
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
      .accounts({
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
      .accounts({
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

    return AlphaVault.createVault(
      program,
      vaultParam,
      owner,
      WhitelistMode.Permissionless
    );
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

    return AlphaVault.createVault(
      program,
      vaultParam,
      owner,
      WhitelistMode.PermissionWithMerkleProof
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

    return AlphaVault.createVault(
      program,
      vaultParam,
      owner,
      WhitelistMode.PermissionWithAuthority
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
  /** End Static Function */

  /** Public Function */
  /**
   * Calculates and returns information about the total allocated, claimed,
   * and claimable tokens in an escrow account based on certain conditions.
   * @param {Escrow} escrowAccount - An object representing an escrow account, which likely contains
   * information such as total deposits, claimed tokens, and other relevant data.
   * @returns The `getClaimInfo` function returns an object with three properties: `totalAllocated`,
   * `totalClaimed`, and `totalClaimable`.
   */
  public getClaimInfo(escrowAccount: Escrow) {
    const currentSlot = this.clock.slot.toNumber();
    const currentTimestamp = this.clock.unixTimestamp.toNumber();
    const totalAllocated = this.vault.boughtToken
      .mul(escrowAccount.totalDeposit)
      .div(this.vault.totalDeposit);
    const totalClaimed = escrowAccount.claimedToken;
    const totalClaimable = (() => {
      const currentSlotBN = new BN(
        this.vault.activationType === ActivationType.SLOT
          ? currentSlot
          : currentTimestamp
      );
      if (currentSlotBN.lt(this.vault.startVestingPoint)) {
        return new BN(0);
      }

      const endSlot = BN.min(currentSlotBN, this.vault.endVestingPoint);
      const totalClaimableToken = this.vault.boughtToken
        .mul(endSlot.add(new BN(1)).sub(this.vault.startVestingPoint))
        .div(
          this.vault.endVestingPoint
            .add(new BN(1))
            .sub(this.vault.startVestingPoint)
        );
      const drippedEscrowAmount = totalClaimableToken
        .mul(escrowAccount.totalDeposit)
        .div(this.vault.totalDeposit);
      return drippedEscrowAmount.sub(escrowAccount.claimedToken);
    })();

    return {
      totalAllocated,
      totalClaimed,
      totalClaimable,
    };
  }

  /**
   * The available deposit quota of the vault based on user's deposit info
   * @param {DepositInfo} depositInfo - The `depositInfo` object can obtain from the `getDepositInfo` function.
   * @returns The `getAvailableDepositQuota` function returns the available deposit quota based on the
   * provided `depositInfo` and the current state of the vault.
   */
  public getAvailableDepositQuota(
    escrow: Escrow | null,
    merkleProof?: DepositWithProofParams
  ) {
    // FCFS will stop allow to deposit after maxDepositCap/individualDepositCap reached
    const modeCap = (() => {
      if (this.mode === VaultMode.FCFS) {
        return BN.min(
          this.vault.maxDepositingCap,
          this.vault.individualDepositingCap
        );
      }

      return new BN(Number.MAX_SAFE_INTEGER);
    })();

    // Merkle proof cap
    const merkleCap = (() => {
      if (
        this.vault.whitelistMode === WhitelistMode.PermissionWithMerkleProof
      ) {
        return merkleProof.maxCap;
      }

      return new BN(Number.MAX_SAFE_INTEGER);
    })();

    // Authority cap
    const authorityCap = (() => {
      if (this.vault.whitelistMode === WhitelistMode.PermissionWithAuthority) {
        return escrow.maxCap;
      }

      return new BN(Number.MAX_SAFE_INTEGER);
    })();

    // compare 3 cap and return the smallest one
    const vaultAvailableCap = BN.min(BN.min(modeCap, merkleCap), authorityCap);
    if (!escrow) {
      return vaultAvailableCap;
    }
    const personalAvailableCap = this.vault.individualDepositingCap.sub(
      escrow.totalDeposit
    );

    return personalAvailableCap;
  }

  public async interactionState(
    escrow: Escrow | null,
    merkleProof?: DepositWithProofParams | null,
    clock?: Clock
  ) {
    await this.refreshState(clock);
    const isWhitelisted = this.isWhitelisted(escrow, merkleProof);
    const canClaim = this.canClaim(escrow);
    const canDeposit = this.canDeposit(escrow, merkleProof);
    const canWithdraw = this.canWithdraw(escrow);
    const hadWithdrawn = this.hadWithdrawn(escrow);
    return {
      isWhitelisted,
      canClaim,
      canDeposit,
      canWithdraw,
      hadWithdrawn,
    };
  }

  private isWhitelisted(
    escrow: Escrow | null,
    merkleProof: DepositWithProofParams | null
  ) {
    if (this.vault.whitelistMode === WhitelistMode.PermissionWithMerkleProof)
      return !!merkleProof;
    if (this.vault.whitelistMode === WhitelistMode.PermissionWithAuthority)
      return !!escrow;

    return true;
  }

  private canClaim(escrow: Escrow | null) {
    if (!escrow) return false;

    if (![VaultState.VESTING, VaultState.ENDED].includes(this.vaultState)) {
      return false;
    }

    const claimInfo = this.getClaimInfo(escrow);
    return claimInfo.totalClaimable.gtn(0);
  }

  private canDeposit(
    escrow: Escrow | null,
    merkleProof: DepositWithProofParams | null
  ) {
    // If not whitelisted, user cannot deposit
    if (!this.isWhitelisted(escrow, merkleProof)) {
      return false;
    }

    // If not in deposit mode, user cannot deposit
    if (this.vaultState !== VaultState.DEPOSITING) {
      return false;
    }

    // If personal cap is finished, user cannot deposit
    const personalAvailableCap = this.getAvailableDepositQuota(
      escrow,
      merkleProof
    );
    if (personalAvailableCap.lten(0)) {
      return false;
    }

    return true;
  }

  private canWithdraw(escrow: Escrow | null) {
    if (!escrow) return false;

    const depositInfo = this.getDepositInfo(escrow);

    // Can withdraw after deposit in prorata mode
    if (
      depositInfo.totalDeposit.gtn(0) &&
      this.mode === VaultMode.PRORATA &&
      this.vaultState === VaultState.DEPOSITING
    ) {
      return true;
    }

    // if totalReturned > 0, regardless of crank working or not, user can withdraw
    if (depositInfo.totalReturned.gtn(0)) {
      const currentPoint =
        this.vault.activationType === ActivationType.SLOT
          ? this.clock.slot.toNumber()
          : this.clock.unixTimestamp.toNumber();

      // make sure the user can withdraw after the pool is activated
      if (currentPoint >= this.activationPoint.toNumber()) {
        return true;
      }
    }

    return false;
  }

  private hadWithdrawn(escrow: Escrow | null) {
    if (!escrow) return false;

    return escrow.refunded === 1;
  }

  /**
   * Refreshes the state of the Alpha Vault by fetching the latest vault data.
   *
   * @return {void} No return value, updates the internal state of the Alpha Vault.
   */
  public async refreshState(clock?: Clock) {
    if (clock) {
      this.vault = await this.program.account.vault.fetch(this.pubkey);
      this.clock = clock;
    } else {
      const accountsToFetch = [this.pubkey, SYSVAR_CLOCK_PUBKEY];
      const [vaultAccountBuffer, clockAccountBuffer] =
        await this.program.provider.connection.getMultipleAccountsInfo(
          accountsToFetch
        );
      const vault: Vault = this.program.coder.accounts.decode(
        "vault",
        vaultAccountBuffer.data
      );
      const clockState: Clock = ClockLayout.decode(clockAccountBuffer.data);

      this.vault = vault;
      this.clock = clockState;
    }
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
      .accounts({
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
          .accounts({
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
    merkleProof?: DepositWithProofParams
  ): Promise<Transaction> {
    if (this.vault.whitelistMode === WhitelistMode.PermissionWithMerkleProof) {
      if (!merkleProof) {
        throw new Error(
          "Merkle proof is required for permissioned vault with merkle proof"
        );
      }
    }
    const [escrow] = deriveEscrow(this.pubkey, owner, this.program.programId);
    const escrowAccount =
      await this.program.account.escrow.fetchNullable(escrow);

    const preInstructions: TransactionInstruction[] = [];
    if (!escrowAccount) {
      if (
        this.vault.whitelistMode === WhitelistMode.PermissionWithMerkleProof
      ) {
        const { merkleRootConfig, maxCap, proof } = merkleProof;

        const createEscrowTx = await this.program.methods
          .createPermissionedEscrow(maxCap, proof)
          .accounts({
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
      } else if (this.vault.whitelistMode === WhitelistMode.Permissionless) {
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
   *
   * @returns {Promise<Transaction | null>} A promise that resolves to the fill vault transaction or null if it's DLMM pool and out of liquidity.
   */
  public async fillVault(payer: PublicKey): Promise<Transaction | null> {
    const poolType = this.vault.poolType;

    if (poolType === PoolType.DYNAMIC) {
      return fillDynamicAmmTransaction(
        this.program,
        this.pubkey,
        this.vault,
        payer,
        this.opt
      );
    } else {
      return fillDlmmTransaction(
        this.program,
        this.pubkey,
        this.vault,
        payer,
        this.opt
      );
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
      .accounts({
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
  public getDepositInfo(escrowAccount: Escrow | null): DepositInfo {
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
    const totalReturned = this.vault.totalDeposit.isZero()
      ? new BN(0)
      : remainingAmount
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

    return program.account.escrow.all([
      {
        memcmp: {
          bytes: owner.toBase58(),
          offset: 40,
        },
      },
    ]);
  }
  /** End Public Function */
}
