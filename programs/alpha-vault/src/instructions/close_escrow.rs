use crate::*;

#[event_cpi]
#[derive(Accounts)]
pub struct CloseEscrowCtx<'info> {
    #[account(mut)]
    pub vault: AccountLoader<'info, Vault>,

    #[account(
        mut,
        has_one = vault,
        has_one = owner,
        close = rent_receiver
    )]
    pub escrow: AccountLoader<'info, Escrow>,

    pub owner: Signer<'info>,

    /// CHECK: Account to receive closed account rental SOL
    #[account(mut)]
    pub rent_receiver: UncheckedAccount<'info>,
}

pub fn handle_close_escrow(_ctx: Context<CloseEscrowCtx>) -> Result<()> {
    Ok(())
}
