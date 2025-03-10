use crate::*;
use anchor_spl::token_interface::Mint;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeVaultWithConfigParams {
    pub pool_type: u8,
    pub quote_mint: Pubkey,
    pub base_mint: Pubkey,
    pub whitelist_mode: u8,
}

#[event_cpi]
#[derive(Accounts)]
#[instruction(params: InitializeVaultWithConfigParams)]
pub struct InitializeVaultWithProrataConfigCtx<'info> {
    #[account(
        init,
        seeds = [
            VAULT,
            config.key().as_ref(),
            pool.key().as_ref(),
        ],
        bump,
        payer = funder,
        space = 8 + Vault::INIT_SPACE
    )]
    pub vault: AccountLoader<'info, Vault>,

    /// CHECK: pool
    pub pool: AccountInfo<'info>,

    #[account(
        constraint = params.quote_mint.eq(&quote_mint.key()) @ VaultError::IncorrectTokenMint
    )]
    pub quote_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub funder: Signer<'info>,

    pub config: Account<'info, ProrataVaultConfig>,

    // system program
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_vault_with_prorata_config(
    _ctx: Context<InitializeVaultWithProrataConfigCtx>,
    _params: &InitializeVaultWithConfigParams,
) -> Result<()> {
    Ok(())
}
