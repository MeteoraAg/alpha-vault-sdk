use crate::assert_eq_admin;
use crate::FcfsVaultConfig;
use crate::VaultError;
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct CloseFcfsConfig<'info> {
    #[account(
        mut,
        close = rent_receiver
    )]
    pub config: Account<'info, FcfsVaultConfig>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    /// CHECK: Account to receive closed account rental SOL
    #[account(mut)]
    pub rent_receiver: UncheckedAccount<'info>,
}

pub fn handle_close_fcfs_config(_ctx: Context<CloseFcfsConfig>) -> Result<()> {
    Ok(())
}
