use anchor_lang::prelude::*;

#[cfg(not(feature = "localnet"))]
declare_id!("vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2");

#[cfg(feature = "localnet")]
declare_id!("SNPmGgnywBvvrAKMLundzG6StojyHTHDLu7T4sdhP4k");

pub mod instructions;
pub use instructions::*;

pub mod state;
pub use state::*;

pub mod errors;
pub use errors::*;

pub mod events;
pub use events::*;

pub mod pda;

pub mod activation;
pub use activation::*;

pub mod constants;
pub use constants::*;

pub mod admin {
    use anchor_lang::prelude::Pubkey;
    use anchor_lang::solana_program::pubkey;

    #[cfg(feature = "localnet")]
    pub const ADMINS: [Pubkey; 1] = [pubkey!("bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1")];

    #[cfg(not(feature = "localnet"))]
    pub const ADMINS: [Pubkey; 3] = [
        pubkey!("5unTfT2kssBuNvHPY6LbJfJpLqEcdMxGYLWHwShaeTLi"),
        pubkey!("ChSAh3XXTxpp5n2EmgSCm6vVvVPoD1L9VrK3mcQkYz7m"),
        pubkey!("DHLXnJdACTY83yKwnUkeoDjqi4QBbsYGa1v8tJL76ViX"),
    ];
}

pub fn assert_eq_admin(admin: Pubkey) -> bool {
    crate::admin::ADMINS
        .iter()
        .any(|predefined_admin| predefined_admin.eq(&admin))
}

pub mod treasury {
    use anchor_lang::solana_program::declare_id;
    // https://v3.squads.so/dashboard/RW5xNldRYjJaS1FFdlYzQUhWUTQxaTU3VlZoRHRoQWJ0eU12Wm9SaFo3RQ==
    declare_id!("BJQbRiRWhJCyTYZcAuAL3ngDCx3AyFQGKDq8zhiZAKUw");
}

#[program]
pub mod alpha_vault {
    use super::*;

    ////// PRORATA VAULT /////
    pub fn initialize_prorata_vault(
        ctx: Context<InitializeProrataVaultCtx>,
        params: InitializeProrataVaultParams,
    ) -> Result<()> {
        handle_initialize_prorata_vault(ctx, &params)
    }
    pub fn initialize_vault_with_prorata_config(
        ctx: Context<InitializeVaultWithProrataConfigCtx>,
        params: InitializeVaultWithConfigParams,
    ) -> Result<()> {
        handle_initialize_vault_with_prorata_config(ctx, &params)
    }
    pub fn update_prorata_vault_parameters(
        ctx: Context<UpdateProrataVaultParametersCtx>,
        params: UpdateProrataVaultParams,
    ) -> Result<()> {
        handle_update_prorata_vault_parameters(ctx, &params)
    }
    pub fn create_prorata_config(
        ctx: Context<CreateProrataConfig>,
        config_parameters: ProrataConfigParameters,
    ) -> Result<()> {
        handle_create_prorata_config(ctx, config_parameters)
    }
    pub fn close_prorata_config(ctx: Context<CloseProrataConfig>) -> Result<()> {
        handle_close_prorata_config(ctx)
    }
    ////// END PRORATA VAULT /////

    ////// FCFS VAULT ////
    pub fn initialize_fcfs_vault(
        ctx: Context<InitializeFcfsVaultCtx>,
        params: InitializeFcfsVaultParams,
    ) -> Result<()> {
        handle_initialize_fcfs_vault(ctx, &params)
    }
    pub fn initialize_vault_with_fcfs_config(
        ctx: Context<InitializeVaultWithFcfsConfigCtx>,
        params: InitializeVaultWithConfigParams,
    ) -> Result<()> {
        handle_initialize_vault_with_fcfs_config(ctx, &params)
    }
    pub fn update_fcfs_vault_parameters(
        ctx: Context<UpdateFcfsVaultParametersCtx>,
        params: UpdateFcfsVaultParams,
    ) -> Result<()> {
        handle_update_fcfs_vault_parameters(ctx, &params)
    }
    pub fn create_fcfs_config(
        ctx: Context<CreateFcfsConfig>,
        config_parameters: FcfsConfigParameters,
    ) -> Result<()> {
        handle_create_fcfs_config(ctx, config_parameters)
    }
    pub fn close_fcfs_config(ctx: Context<CloseFcfsConfig>) -> Result<()> {
        handle_close_fcfs_config(ctx)
    }
    ////// END FCFS VAULT /////

    pub fn create_merkle_root_config(
        ctx: Context<CreateMerkleRootConfigCtx>,
        params: CreateMerkleRootConfigParams,
    ) -> Result<()> {
        handle_create_merkle_root_config(ctx, params)
    }

    /// USER FUNCTIONS
    pub fn create_new_escrow<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateNewEscrowCtx<'info>>,
    ) -> Result<()> {
        handle_create_new_escrow(ctx)
    }

    // create_permissioned_escrow with merkle proof
    pub fn create_permissioned_escrow<'info>(
        ctx: Context<'_, '_, '_, 'info, CreatePermissionedEscrowWithMerkleProofCtx<'info>>,
        max_cap: u64,
        proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        handle_create_permissioned_escrow(ctx, max_cap, proof)
    }

    // create_permissioned_escrow with authority
    pub fn create_permissioned_escrow_with_authority<'info>(
        ctx: Context<'_, '_, '_, 'info, CreatePermissionedEscrowWithAuthorityCtx<'info>>,
        max_cap: u64,
    ) -> Result<()> {
        handle_create_permissioned_escrow_with_authority(ctx, max_cap)
    }

    pub fn close_escrow(ctx: Context<CloseEscrowCtx>) -> Result<()> {
        handle_close_escrow(ctx)
    }
    pub fn deposit(ctx: Context<DepositCtx>, max_amount: u64) -> Result<()> {
        handle_deposit(ctx, max_amount)
    }
    pub fn withdraw(ctx: Context<WithdrawCtx>, amount: u64) -> Result<()> {
        handle_withdraw(ctx, amount)
    }
    pub fn withdraw_remaining_quote(ctx: Context<WithdrawRemainingQuoteCtx>) -> Result<()> {
        handle_withdraw_remaining_quote(ctx)
    }

    pub fn claim_token(ctx: Context<ClaimTokenCtx>) -> Result<()> {
        handle_claim_token(ctx)
    }
    ////// END USER FUNCTIONS /////

    // permissionless
    pub fn fill_dlmm<'info>(
        ctx: Context<'_, '_, '_, 'info, FillDlmmCtx<'info>>,
        max_amount: u64,
    ) -> Result<()> {
        handle_fill_dlmm(ctx, max_amount)
    }

    // permissionless
    pub fn fill_dynamic_amm<'info>(
        ctx: Context<'_, '_, '_, 'info, FillDynamicAmmCtx<'info>>,
        max_amount: u64,
    ) -> Result<()> {
        handle_fill_dynamic_amm(ctx, max_amount)
    }
}
