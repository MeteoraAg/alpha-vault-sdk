use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateProrataVaultParams {
    pub max_buying_cap: u64,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
}

#[event_cpi]
#[derive(Accounts)]
pub struct UpdateProrataVaultParametersCtx<'info> {
    #[account(
        mut,
        has_one = pool,
    )]
    pub vault: AccountLoader<'info, Vault>,

    /// CHECK: pool
    pub pool: AccountInfo<'info>,

    #[account(constraint = assert_eq_admin(admin.key()) @ VaultError::InvalidAdmin)]
    pub admin: Signer<'info>,
}

pub fn handle_update_prorata_vault_parameters(
    _ctx: Context<UpdateProrataVaultParametersCtx>,
    _params: &UpdateProrataVaultParams,
) -> Result<()> {
    Ok(())
}
