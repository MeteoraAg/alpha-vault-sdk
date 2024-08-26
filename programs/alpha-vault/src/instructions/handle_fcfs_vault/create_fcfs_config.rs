use crate::assert_eq_admin;
use crate::FcfsVaultConfig;
use crate::VaultError;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct FcfsConfigParameters {
    pub max_depositing_cap: u64,
    pub start_vesting_duration: u64,
    pub end_vesting_duration: u64,
    pub depositing_duration_until_last_join_point: u64, // from current point
    pub individual_depositing_cap: u64,
    pub escrow_fee: u64,
    pub activation_type: u8,
    pub index: u64,
}

#[derive(Accounts)]
#[instruction(config_parameters: FcfsConfigParameters)]
pub struct CreateFcfsConfig<'info> {
    #[account(
        init,
        seeds = [
            b"fcfs_config".as_ref(),
            config_parameters.index.to_le_bytes().as_ref()
        ],
        bump,
        payer = admin,
        space = 8 + FcfsVaultConfig::INIT_SPACE
    )]
    pub config: Account<'info, FcfsVaultConfig>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_fcfs_config(
    _ctx: Context<CreateFcfsConfig>,
    _config_parameters: FcfsConfigParameters,
) -> Result<()> {
    Ok(())
}
