use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeProrataVaultParams {
    pub pool_type: u8,
    pub quote_mint: Pubkey,
    pub base_mint: Pubkey,
    pub depositing_point: u64,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
    pub max_buying_cap: u64,
    pub escrow_fee: u64,
    pub whitelist_mode: u8,
}

#[event_cpi]
#[derive(Accounts)]
pub struct InitializeProrataVaultCtx<'info> {
    #[account(
        init,
        seeds = [
            VAULT,
            base.key().as_ref(),
            pool.key().as_ref(),
        ],
        bump,
        payer = funder,
        space = 8 + Vault::INIT_SPACE
    )]
    pub vault: AccountLoader<'info, Vault>,

    /// CHECK: pool
    pub pool: AccountInfo<'info>,

    #[account(mut)]
    pub funder: Signer<'info>,

    pub base: Signer<'info>,

    // system program
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_prorata_vault(
    _ctx: Context<InitializeProrataVaultCtx>,
    _params: &InitializeProrataVaultParams,
) -> Result<()> {
    Ok(())
}
