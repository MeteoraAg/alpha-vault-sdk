use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateMerkleRootConfigParams {
    /// The 256-bit merkle root.
    pub root: [u8; 32],
    /// version
    pub version: u64,
}

#[event_cpi]
#[derive(Accounts)]
#[instruction(params: CreateMerkleRootConfigParams)]
pub struct CreateMerkleRootConfigCtx<'info> {
    pub vault: AccountLoader<'info, Vault>,

    #[account(
        init,
        seeds = [
            MERKLE_ROOT,
            vault.key().as_ref(),
            params.version.to_le_bytes().as_ref()
        ],
        bump,
        payer = admin,
        space = 8 + MerkleRootConfig::INIT_SPACE
    )]
    pub merkle_root_config: AccountLoader<'info, MerkleRootConfig>,

    #[account(
        mut,
        constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    // system program
    pub system_program: Program<'info, System>,
}

pub fn handle_create_merkle_root_config(
    _ctx: Context<CreateMerkleRootConfigCtx>,
    _params: CreateMerkleRootConfigParams,
) -> Result<()> {
    Ok(())
}
