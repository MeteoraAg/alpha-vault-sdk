use crate::*;

#[event_cpi]
#[derive(Accounts)]
pub struct CreatePermissionedEscrowWithMerkleProofCtx<'info> {
    #[account(mut, has_one=pool)]
    pub vault: AccountLoader<'info, Vault>,

    /// CHECK: pool
    pub pool: AccountInfo<'info>,

    #[account(
        init,
        seeds = [
            ESCROW,
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

    /// merkle_root_config
    #[account(has_one=vault)]
    pub merkle_root_config: AccountLoader<'info, MerkleRootConfig>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: escrow fee receiver
    #[account(mut, address = treasury::ID @ VaultError::InvalidFeeReceiverAccount)]
    pub escrow_fee_receiver: Option<AccountInfo<'info>>,

    // system program
    pub system_program: Program<'info, System>,
}

pub fn handle_create_permissioned_escrow<'info>(
    _ctx: Context<'_, '_, '_, 'info, CreatePermissionedEscrowWithMerkleProofCtx<'info>>,
    _max_cap: u64,
    _proof: Vec<[u8; 32]>,
) -> Result<()> {
    Ok(())
}
