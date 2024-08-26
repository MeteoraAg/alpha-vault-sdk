use crate::assert_eq_admin;
use crate::ProrataVaultConfig;
use crate::VaultError;
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct CloseProrataConfig<'info> {
    #[account(
        mut,
        close = rent_receiver
    )]
    pub config: Account<'info, ProrataVaultConfig>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    /// CHECK: Account to receive closed account rental SOL
    #[account(mut)]
    pub rent_receiver: UncheckedAccount<'info>,
}

pub fn handle_close_prorata_config(_ctx: Context<CloseProrataConfig>) -> Result<()> {
    Ok(())
}
