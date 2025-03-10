use crate::*;

#[event_cpi]
#[derive(Accounts)]
pub struct CreateCrankFeeWhitelistCtx<'info> {
    #[account(
        init,
        seeds = [
            CRANK_FEE_WHITELIST,
            cranker.key().as_ref(),
        ],
        bump,
        payer = admin,
        space = 8 + CrankFeeWhitelist::INIT_SPACE
    )]
    pub crank_fee_whitelist: AccountLoader<'info, CrankFeeWhitelist>,

    /// CHECK: cranker
    pub cranker: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_crank_fee_whitelist(_ctx: Context<CreateCrankFeeWhitelistCtx>) -> Result<()> {
    Ok(())
}
