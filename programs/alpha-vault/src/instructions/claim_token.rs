use crate::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[event_cpi]
#[derive(Accounts)]
pub struct ClaimTokenCtx<'info> {
    #[account(mut, has_one=token_out_vault)]
    pub vault: AccountLoader<'info, Vault>,

    #[account(mut, has_one=vault, has_one=owner)]
    pub escrow: AccountLoader<'info, Escrow>,

    #[account(mut)]
    pub token_out_vault: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub destination_token: Box<InterfaceAccount<'info, TokenAccount>>,
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,
    pub token_program: Interface<'info, TokenInterface>,

    pub owner: Signer<'info>,
}

pub fn handle_claim_token(_ctx: Context<ClaimTokenCtx>) -> Result<()> {
    Ok(())
}
