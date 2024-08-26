use crate::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[event_cpi]
#[derive(Accounts)]
pub struct WithdrawRemainingQuoteCtx<'info> {
    #[account(mut, has_one=token_vault, has_one=pool)]
    pub vault: AccountLoader<'info, Vault>,

    /// CHECK: pool
    pub pool: AccountInfo<'info>,

    #[account(mut, has_one=vault, has_one=owner)]
    pub escrow: AccountLoader<'info, Escrow>,

    #[account(mut)]
    pub token_vault: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub destination_token: Box<InterfaceAccount<'info, TokenAccount>>,
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,
    pub token_program: Interface<'info, TokenInterface>,

    pub owner: Signer<'info>,
}

pub fn handle_withdraw_remaining_quote(_ctx: Context<WithdrawRemainingQuoteCtx>) -> Result<()> {
    Ok(())
}
