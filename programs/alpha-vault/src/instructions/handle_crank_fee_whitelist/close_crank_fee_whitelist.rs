use crate::*;

#[event_cpi]
#[derive(Accounts)]
pub struct CloseCrankFeeWhitelistCtx<'info> {
    #[account(
        mut,
        close = rent_receiver
    )]
    pub crank_fee_whitelist: AccountLoader<'info, CrankFeeWhitelist>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    /// CHECK: Account to receive closed account rental SOL
    #[account(mut)]
    pub rent_receiver: UncheckedAccount<'info>,
}

pub fn handle_close_crank_fee_whitelist(_ctx: Context<CloseCrankFeeWhitelistCtx>) -> Result<()> {
    Ok(())
}
