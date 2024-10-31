use crate::*;
use anchor_lang::prelude::*;

#[event_cpi]
#[derive(Accounts)]
pub struct CreatePermissionedEscrowWithAuthorityCtx<'info> {
    #[account(mut, has_one=pool)]
    pub vault: AccountLoader<'info, Vault>,

    /// CHECK: pool
    pub pool: AccountInfo<'info>,

    #[account(
        init,
        seeds = [
            b"escrow".as_ref(),
            vault.key().as_ref(),
            owner.key().as_ref(),
        ],
        bump,
        payer = payer,
        space = 8 + Escrow::INIT_SPACE
    )]
    pub escrow: AccountLoader<'info, Escrow>,
    /// CHECK:
    pub owner: UncheckedAccount<'info>,

    #[account(
        mut,
        address = vault.load()?.vault_authority @ VaultError::InvalidCreator
    )]
    pub payer: Signer<'info>,

    // system program
    pub system_program: Program<'info, System>,
}

pub fn handle_create_permissioned_escrow_with_authority<'info>(
    _ctx: Context<'_, '_, '_, 'info, CreatePermissionedEscrowWithAuthorityCtx<'info>>,
    _max_cap: u64,
) -> Result<()> {
    Ok(())
}
