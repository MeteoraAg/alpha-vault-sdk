use crate::assert_eq_admin;

use crate::ProrataVaultConfig;
use crate::VaultError;
use anchor_lang::prelude::*;
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ProrataConfigParameters {
    pub max_buying_cap: u64,
    pub start_vesting_duration: u64,
    pub end_vesting_duration: u64,
    pub escrow_fee: u64,
    pub activation_type: u8,
    pub index: u64,
}

#[derive(Accounts)]
#[instruction(config_parameters: ProrataConfigParameters)]
pub struct CreateProrataConfig<'info> {
    #[account(
        init,
        seeds = [
            b"prorata_config".as_ref(),
            config_parameters.index.to_le_bytes().as_ref()
        ],
        bump,
        payer = admin,
        space = 8 + ProrataVaultConfig::INIT_SPACE
    )]
    pub config: Account<'info, ProrataVaultConfig>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_prorata_config(
    _ctx: Context<CreateProrataConfig>,
    _config_parameters: ProrataConfigParameters,
) -> Result<()> {
    Ok(())
}
