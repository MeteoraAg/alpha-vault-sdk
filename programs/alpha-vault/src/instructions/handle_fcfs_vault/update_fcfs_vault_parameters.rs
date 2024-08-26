use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateFcfsVaultParams {
    pub max_depositing_cap: u64,
    pub depositing_point: u64,
    pub individual_depositing_cap: u64,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
}

#[event_cpi]
#[derive(Accounts)]
pub struct UpdateFcfsVaultParametersCtx<'info> {
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

pub fn handle_update_fcfs_vault_parameters(
    _ctx: Context<UpdateFcfsVaultParametersCtx>,
    _params: &UpdateFcfsVaultParams,
) -> Result<()> {
    Ok(())
}
